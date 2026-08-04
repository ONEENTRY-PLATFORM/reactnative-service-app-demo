import type {IAttributeValues} from 'oneentry/dist/base/utils';
import type {IPagesEntity} from 'oneentry/dist/pages/pagesInterfaces';

// Utility helpers ported 1:1 from nextjs-beauty/components/utils. Kept together
// in this module so the wizard has a single import surface — every helper here
// mirrors its web counterpart. When these become useful outside BookingV2,
// promote them to lib/oneentry/ and update imports.

// ── entityLinks ────────────────────────────────────────────────────────────
export interface EntityLink {
  title: string;
  id: number | string | undefined;
  parentId: number | undefined;
}

export const entityLinks = (value: unknown): EntityLink[] => {
  if (!Array.isArray(value)) return [];
  return (
    value as Array<{
      title?: string;
      value?: {id?: number | string; parentId?: number};
    }>
  ).map(entry => ({
    title: typeof entry?.title === 'string' ? entry.title : '',
    id: entry?.value?.id,
    parentId:
      typeof entry?.value?.parentId === 'number'
        ? entry.value.parentId
        : undefined,
  }));
};

export const entityPageIds = (value: unknown): number[] =>
  entityLinks(value)
    .map(l => l.id)
    .filter((id): id is number => typeof id === 'number');

export const entityProductIds = (value: unknown): number[] => {
  const ids: number[] = [];
  for (const link of entityLinks(value)) {
    if (typeof link.id !== 'string' || !link.id.startsWith('p-')) continue;
    const productId = Number(link.id.split('-')[2]);
    if (productId) ids.push(productId);
  }
  return ids;
};

// ── plainTextFromTextAttr ──────────────────────────────────────────────────
export const plainTextFromTextAttr = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (!Array.isArray(value) || value.length === 0) return '';
  const first = value[0] as
    | {plainValue?: string; htmlValue?: string}
    | undefined;
  const plain = first?.plainValue?.trim();
  if (plain) return plain;
  const html = first?.htmlValue;
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
};

// ── productDurationMinutes ─────────────────────────────────────────────────
export const productDurationMinutes = (
  attrs: IAttributeValues | undefined,
): number | null => {
  const raw = attrs?.duration?.value ?? attrs?.time?.value;
  if (typeof raw === 'number') return raw;
  if (
    typeof raw === 'string' &&
    raw.trim() !== '' &&
    !Number.isNaN(Number(raw))
  ) {
    return Number(raw);
  }
  return null;
};

// ── isOfferProduct ─────────────────────────────────────────────────────────
const OFFER_ATTRIBUTE_SET = 'offer';
export const isOfferProduct = (product: {
  attributeSetIdentifier?: string | null;
}): boolean => product.attributeSetIdentifier === OFFER_ATTRIBUTE_SET;

// ── salonFromPage ──────────────────────────────────────────────────────────
export interface CmsSalon {
  id: number;
  url: string;
  name: string;
  address: string;
  phone: string;
  email: string;
}

export const salonFromPage = (page: IPagesEntity): CmsSalon => {
  const attrs = page.attributeValues ?? {};
  const rawAddress = (attrs as any).salon_address?.value;
  const rawPhone = (attrs as any).salon_phone?.value;
  const rawEmail = (attrs as any).salon_email?.value;
  return {
    id: page.id,
    url: page.pageUrl,
    name: (page.localizeInfos?.title as string) || page.pageUrl,
    address: typeof rawAddress === 'string' ? rawAddress : '',
    phone: typeof rawPhone === 'string' ? rawPhone : '',
    email: typeof rawEmail === 'string' ? rawEmail : '',
  };
};

// ── formatUaePhone ─────────────────────────────────────────────────────────
export const formatUaePhone = (raw: string | undefined | null): string => {
  if (!raw) return '';
  const trimmed = raw.trim();
  let national = trimmed.replace(/\D/g, '');
  if (national.startsWith('971')) national = national.slice(3);
  else if (national.startsWith('0')) national = national.slice(1);
  if (national.length === 9 && national.startsWith('5')) {
    return `+971 ${national.slice(0, 2)} ${national.slice(2, 5)} ${national.slice(5)}`;
  }
  if (national.length === 8) {
    return `+971 ${national.slice(0, 1)} ${national.slice(1, 4)} ${national.slice(4)}`;
  }
  return trimmed;
};

// ── fileDisplayUrl / fileBlurDataUrl ───────────────────────────────────────
type FileEntry = {
  downloadLink?: string | {default?: string[]};
  previewLink?: string | {default?: string[]; [key: string]: any};
  defaultPreview?: string;
};

export const fileDisplayUrl = (value: unknown): string => {
  if (!Array.isArray(value) || value.length === 0) return '';
  const first = value[0] as FileEntry;
  const link = first?.downloadLink ?? first?.previewLink;
  if (!link) return '';
  if (typeof link === 'string') return link;
  return link.default?.[1] ?? link.default?.[0] ?? '';
};

export const fileBlurDataUrl = (value: unknown): string | undefined => {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  const first = value[0] as FileEntry;
  const preview = first?.previewLink;
  if (typeof preview !== 'object' || !preview) return undefined;
  const key = first.defaultPreview ?? 'default';
  const pair = preview[key];
  return Array.isArray(pair) ? (pair[0] as string | undefined) : undefined;
};
