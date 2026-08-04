import {useEffect, useState} from 'react';
import type {IAdminEntity} from 'oneentry/dist/admins/adminsInterfaces';
import type {IPagesEntity} from 'oneentry/dist/pages/pagesInterfaces';
import type {IProductsEntity} from 'oneentry/dist/products/productsInterfaces';
import {api} from '@/api/defineApi';
import {
  entityPageIds,
  entityProductIds,
  fileBlurDataUrl,
  fileDisplayUrl,
  formatUaePhone,
  isOfferProduct,
  plainTextFromTextAttr,
  productDurationMinutes,
  salonFromPage,
} from './cmsUtils';
import type {
  BookingData,
  BookingMaster,
  BookingSalon,
  BookingService,
} from './types';

// Client-side port of nextjs-beauty/app/booking/booking-data.ts. Fires the
// same OneEntry SDK calls (Pages, Products, Admins), reshapes into
// BookingData. No hardcoded lists — categories/subcategories/services/salons/
// masters come from the CMS. Runs once per wizard mount (RTK cache isn't used
// because the shape is dense and only needed here).

const PAGE_LIMIT = 100;

const CATEGORY_BY_PAGEURL: Record<string, string> = {
  hair: 'Hair',
  face: 'Face',
  body: 'Body',
  nails: 'Nails',
};

interface ServiceItem {
  id: number;
  title: string;
  price: number | null;
  currency: string;
  duration: number | null;
  categoryUrl: string;
  categoryId: number;
  subcategoryUrl: string | null;
}

interface CategoryBucket {
  category: {url: string; id: number; title: string};
  services: ServiceItem[];
}

// Paginated fetch of every product under a page marker — matches web
// fetchAllProducts (both cap one request at PAGE_LIMIT and page until the
// server-reported total is covered).
const fetchAllProducts = async (
  handle: string,
): Promise<IProductsEntity[]> => {
  const all: IProductsEntity[] = [];
  let offset = 0;
  for (;;) {
    let products: IProductsEntity[] = [];
    let total = 0;
    try {
      // SDK signature: (url, body?, langCode?, userQuery?) — pagination lives
      // in userQuery, NOT body (body is for filters). Passing pagination as
      // filters silently returned nothing on the live CMS, which is why the
      // master → services mapping was empty for everyone.
      const res = await api.Products.getProductsByPageUrl(
        handle,
        undefined,
        undefined,
        {offset, limit: PAGE_LIMIT} as any,
      );
      const anyRes = res as any;
      products = Array.isArray(anyRes) ? anyRes : anyRes?.items ?? [];
      total = Array.isArray(anyRes) ? products.length : anyRes?.total ?? products.length;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[BookingV2] fetchAllProducts failed', handle, e);
      break;
    }
    all.push(...products);
    offset += PAGE_LIMIT;
    if (products.length < 1 || all.length >= total) break;
  }
  return all;
};

const toServiceItem = (
  product: IProductsEntity,
  category: IPagesEntity,
  subcategoryUrl: string | null,
): ServiceItem => {
  const attrs = product.attributeValues ?? {};
  const attrPrice = (attrs as any).price?.value;
  const price =
    typeof (product as any).price === 'number'
      ? ((product as any).price as number)
      : typeof attrPrice === 'number'
        ? attrPrice
        : null;
  const attrCurrency = (attrs as any).currency?.value;
  return {
    id: product.id,
    title: (product.localizeInfos?.title as string) || '',
    price,
    currency: typeof attrCurrency === 'string' ? attrCurrency : '',
    duration: productDurationMinutes(attrs),
    categoryUrl: category.pageUrl,
    categoryId: category.id,
    subcategoryUrl,
  };
};

const toBookingMaster = ({
  admin,
  categoryByPageId,
  serviceById,
}: {
  admin: IAdminEntity;
  categoryByPageId: Map<number, string>;
  serviceById: Map<string, BookingService>;
}): BookingMaster | null => {
  const attrs: any = admin.attributeValues ?? {};
  const name = (attrs.master_name?.value as string | undefined) ?? '';
  if (!name) return null;

  const rawServices = attrs.master_services?.value;
  const categoryPageIds = entityPageIds(rawServices);
  const productIds = entityProductIds(rawServices);
  const serviceIds = productIds
    .map(id => String(id))
    .filter(id => serviceById.has(id));

  const fromProducts = serviceIds
    .map(id => serviceById.get(id)?.category)
    .filter((c): c is string => Boolean(c));
  const fromPages = categoryPageIds
    .map(id => categoryByPageId.get(id))
    .filter((c): c is string => Boolean(c));
  const specialties = Array.from(
    new Set(fromProducts.length > 0 ? fromProducts : fromPages),
  );

  const salonIds = entityPageIds(attrs.master_salon?.value);
  const prices = serviceIds
    .map(id => serviceById.get(id)?.price)
    .filter((v): v is number => typeof v === 'number');

  const shortDescription = attrs.master_short_description?.value;

  return {
    id: String(admin.id),
    adminId: admin.id,
    name,
    grade: typeof shortDescription === 'string' ? shortDescription : '',
    photo: fileDisplayUrl(attrs.master_image?.value),
    photoBlur: fileBlurDataUrl(attrs.master_image?.value),
    specialties,
    rating: Number(attrs.master_rating?.value) || 5,
    reviews: null,
    price: prices.length ? Math.min(...prices) : null,
    bio: plainTextFromTextAttr(attrs.master_description?.value),
    salonIds,
    serviceIds,
    schedule: attrs.master_schedule,
  };
};

const buildBookingData = async (): Promise<BookingData> => {
  // Salons, categories and admins in parallel — same fanout as web.
  const [categoryPages, salonPages, admins] = await Promise.all([
    api.Pages.getChildPagesByParentUrl('services').catch(() => []),
    api.Pages.getChildPagesByParentUrl('salons').catch(() => []),
    api.Admins.getAdminsInfo([]).catch(() => []),
  ]);

  const salons: BookingSalon[] = ((salonPages as IPagesEntity[]) ?? []).map(
    salonPage => {
      const salon = salonFromPage(salonPage);
      return {
        id: salon.id,
        name: salon.name,
        address: salon.address,
        phone: formatUaePhone(salon.phone),
        schedule: (salonPage.attributeValues as any)?.salon_time,
      };
    },
  );

  const cats = (categoryPages as IPagesEntity[]) ?? [];
  const buckets: CategoryBucket[] = await Promise.all(
    cats.map(async categoryPage => {
      const subPages = (await api.Pages.getChildPagesByParentUrl(
        categoryPage.pageUrl,
      ).catch(() => [])) as IPagesEntity[];
      const subcategories = subPages ?? [];

      // Products from each subcategory + the category itself. Subcategory
      // lists are processed first so a service that shows up in both keeps
      // its more specific subcategory association.
      const lists = await Promise.all([
        ...subcategories.map(async sub => ({
          subcategoryUrl: sub.pageUrl,
          products: await fetchAllProducts(sub.pageUrl),
        })),
        (async () => ({
          subcategoryUrl: null as string | null,
          products: await fetchAllProducts(categoryPage.pageUrl),
        }))(),
      ]);

      const seen = new Set<number>();
      const services: ServiceItem[] = [];
      for (const {subcategoryUrl, products} of lists) {
        for (const product of products) {
          if (isOfferProduct(product) || seen.has(product.id)) continue;
          seen.add(product.id);
          services.push(toServiceItem(product, categoryPage, subcategoryUrl));
        }
      }

      return {
        category: {
          url: categoryPage.pageUrl,
          id: categoryPage.id,
          title:
            (categoryPage.localizeInfos?.title as string) || categoryPage.pageUrl,
        },
        services,
      };
    }),
  );

  const categoriesById = new Map<number, string>();
  buckets.forEach(({category}) => {
    categoriesById.set(
      category.id,
      CATEGORY_BY_PAGEURL[category.url] ?? category.title,
    );
  });

  const services: BookingService[] = buckets.flatMap(bucket =>
    bucket.services.map(item => ({
      id: String(item.id),
      category:
        CATEGORY_BY_PAGEURL[item.categoryUrl] ??
        buckets.find(b => b.category.url === item.categoryUrl)?.category.title ??
        item.categoryUrl,
      name: item.title,
      duration: item.duration !== null ? `${item.duration} min` : '',
      durationMinutes: item.duration,
      price: item.price,
      currency: item.currency,
      productId: item.id,
      categoryId: item.categoryId,
    })),
  );
  const serviceById = new Map(services.map(s => [s.id, s]));

  const adminsList = Array.isArray(admins)
    ? (admins as IAdminEntity[])
    : ((admins as any)?.items as IAdminEntity[]) ?? [];
  const masters: BookingMaster[] = adminsList
    .map(admin =>
      toBookingMaster({admin, categoryByPageId: categoriesById, serviceById}),
    )
    .filter((m): m is BookingMaster => m !== null);

  return {salons, services, masters};
};

// React hook: fire buildBookingData once, expose {data, loading, error}.
export const useBookingData = () => {
  const [data, setData] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const next = await buildBookingData();
        if (!cancelled) {
          setData(next);
          setError(null);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Failed to load booking data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return {data, loading, error};
};

export {buildBookingData};
