import {useEffect, useMemo, useSyncExternalStore} from 'react';
import {IUserEntity} from 'oneentry/dist/users/usersInterfaces';
import {IFormConfig} from 'oneentry/dist/forms/formsInterfaces';
import {
  FormDataPostType,
  IFormByMarkerDataEntity,
} from 'oneentry/dist/forms-data/formsDataInterfaces';
import {api} from '@/api/defineApi';

// Reviews are records of the `master_review` form, not pages — the same
// storage nextjs-beauty reads from (app/api/server/reviews/getReviews.ts), so
// both clients show the same moderated set.
const REVIEW_FORM_MARKER = 'master_review';

// One read covers the studio: it has a few dozen reviews, not thousands.
const REVIEWS_LIMIT = 200;

// Several screens mount the hook at once (home, master card, reviews list);
// the TTL keeps them on one request instead of one per component.
const CACHE_TTL_MS = 5 * 60 * 1000;

export type CmsReview = {
  id: string;
  author: string;
  // Admin id of the specialist (`review_master`), matched against IAdminEntity.id.
  masterId: number;
  rating: number;
  // ISO date (YYYY-MM-DD): `review_date` for imported reviews, else the record time.
  date: string;
  text: string;
};

type ApiError = {statusCode?: number; message?: string | string[]};

// The SDK returns API failures as values (`errors.isShell: false`), not throws.
const asApiError = (value: unknown): ApiError | null => {
  if (value && typeof value === 'object' && 'statusCode' in value) {
    const code = (value as ApiError).statusCode;
    if (typeof code === 'number' && code >= 400) {
      return value as ApiError;
    }
  }
  return null;
};

const errorText = (e: ApiError): string => {
  const msg = Array.isArray(e.message) ? e.message.join(', ') : e.message;
  return `Error ${e.statusCode ?? ''}: ${msg ?? 'request failed'}`.trim();
};

const fieldValue = (
  record: IFormByMarkerDataEntity,
  marker: string,
): unknown => {
  const fields = Array.isArray(record.formData) ? record.formData : [];
  return fields.find(field => field.marker === marker)?.value;
};

// A `text` value normally arrives as `[{plainValue, htmlValue}]`, but records
// written through other paths carry the bare object or a plain string.
const plainText = (value: unknown): string => {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (typeof candidate === 'string') {
    return candidate;
  }
  if (candidate && typeof candidate === 'object') {
    const {plainValue, htmlValue} = candidate as {
      plainValue?: string;
      htmlValue?: string;
    };
    return plainValue ?? (htmlValue ?? '').replace(/<[^>]*>/g, '');
  }
  return '';
};

export const parseReviewRecord = (
  record: IFormByMarkerDataEntity,
): CmsReview | null => {
  const text = plainText(fieldValue(record, 'review_text')).trim();
  // A rating without a body has nothing to show in a review card.
  if (!text) {
    return null;
  }
  const isoDate = String(fieldValue(record, 'review_date') ?? '').trim();
  const recordTime = record.time ? String(record.time) : '';
  return {
    id: String(record.id),
    author: String(fieldValue(record, 'review_author') ?? '').trim(),
    masterId: Number(fieldValue(record, 'review_master') ?? 0),
    // The API sends `real` fields as strings ("4"), hence the Number().
    rating: Number(fieldValue(record, 'rating') ?? 0) || 0,
    date: isoDate || recordTime.slice(0, 10),
    text,
  };
};

// `formModuleConfigId` changes whenever the form is recreated in the admin
// panel, so it is read from the form at runtime rather than hardcoded.
let formConfigPromise: Promise<IFormConfig> | null = null;

const getReviewFormConfig = (): Promise<IFormConfig> => {
  if (!formConfigPromise) {
    formConfigPromise = (async () => {
      const form = await api.Forms.getFormByMarker(REVIEW_FORM_MARKER);
      const err = asApiError(form);
      if (err) {
        throw new Error(errorText(err));
      }
      const config = (form as {moduleFormConfigs?: IFormConfig[]})
        .moduleFormConfigs?.[0];
      if (!config?.id) {
        throw new Error('Reviews are not available right now.');
      }
      return config;
    })().catch(e => {
      // Do not pin a failure: the next caller retries.
      formConfigPromise = null;
      throw e;
    });
  }
  return formConfigPromise;
};

type ReviewsSnapshot = {
  reviews: CmsReview[];
  // `true` until the first read settles, so counts never flash a fake 0.
  loading: boolean;
  error: string | null;
  // Epoch ms of the last successful read; 0 = never loaded.
  at: number;
};

// A tiny external store instead of an RTK slice: api/methods/RTKApi.ts is
// shared, and one list read by a handful of components needs no more.
let snapshot: ReviewsSnapshot = {
  reviews: [],
  loading: true,
  error: null,
  at: 0,
};
let inFlight: Promise<void> | null = null;
const listeners = new Set<() => void>();

const setSnapshot = (patch: Partial<ReviewsSnapshot>) => {
  snapshot = {...snapshot, ...patch};
  listeners.forEach(notify => notify());
};

const subscribe = (notify: () => void) => {
  listeners.add(notify);
  return () => {
    listeners.delete(notify);
  };
};

const getSnapshot = () => snapshot;

const readApprovedReviews = async (): Promise<CmsReview[]> => {
  const config = await getReviewFormConfig();
  const data = await api.FormData.getFormsDataByMarker(
    REVIEW_FORM_MARKER,
    config.id,
    // The form pre-moderates; only approved records may reach the app.
    {status: ['approved']},
    0,
    undefined,
    0,
    REVIEWS_LIMIT,
  );
  const err = asApiError(data);
  if (err) {
    throw new Error(errorText(err));
  }
  const items = (data as {items?: IFormByMarkerDataEntity[]}).items;
  return (Array.isArray(items) ? items : [])
    .map(parseReviewRecord)
    .filter((review): review is CmsReview => review !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
};

export const loadReviews = (force = false): Promise<void> => {
  const fresh = snapshot.at > 0 && Date.now() - snapshot.at < CACHE_TTL_MS;
  if (!force && fresh) {
    return Promise.resolve();
  }
  if (inFlight) {
    return inFlight;
  }
  // Keep showing what we have during a background refresh.
  setSnapshot({loading: snapshot.at === 0, error: null});
  inFlight = readApprovedReviews()
    .then(reviews => {
      setSnapshot({reviews, loading: false, error: null, at: Date.now()});
    })
    .catch(e => {
      setSnapshot({
        loading: false,
        error: String((e as {message?: string})?.message ?? e),
      });
    })
    .finally(() => {
      inFlight = null;
    });
  return inFlight;
};

export type ReviewsState = {
  reviews: CmsReview[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

const refetch = () => {
  loadReviews(true);
};

export const useReviews = (): ReviewsState => {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    loadReviews();
  }, []);

  return {
    reviews: state.reviews,
    loading: state.loading,
    error: state.error,
    refetch,
  };
};

export const useMasterReviews = (
  masterId: number | undefined,
): ReviewsState => {
  const state = useReviews();
  const all = state.reviews;
  const reviews = useMemo(
    () => (masterId ? all.filter(r => r.masterId === masterId) : []),
    [all, masterId],
  );
  return {...state, reviews};
};

// Mirrors app/(tabs)/profile.tsx: the profile name lives in the
// sign-up form field `name_reg`; fall back to the login so the record is
// never anonymous.
export const getUserDisplayName = (user: IUserEntity | undefined): string => {
  const fields = (user?.formData ?? []) as {marker?: string; value?: unknown}[];
  const read = (marker: string) =>
    String(fields.find(f => f.marker === marker)?.value ?? '').trim();
  return (
    read('name_reg') ||
    read('email_reg') ||
    String(user?.identifier ?? '').trim()
  );
};

export type SubmitReviewInput = {
  masterId: number;
  rating: number;
  text: string;
  author: string;
};

export type SubmitReviewResult = {ok: true} | {ok: false; error: string};

export const submitReview = async ({
  masterId,
  rating,
  text,
  author,
}: SubmitReviewInput): Promise<SubmitReviewResult> => {
  try {
    const config = await getReviewFormConfig();
    // Submission shapes, not read shapes: a `text` field takes a one-element
    // array with a single representation and no editor `params` — the
    // platform rejects the record otherwise.
    const formData: FormDataPostType[] = [
      {marker: 'rating', type: 'real', value: rating},
      {marker: 'review_text', type: 'text', value: [{plainValue: text}]},
      {marker: 'review_author', type: 'string', value: author},
      {marker: 'review_master', type: 'string', value: String(masterId)},
    ] as FormDataPostType[];

    const result = await api.FormData.postFormsData({
      formIdentifier: REVIEW_FORM_MARKER,
      formData,
      formModuleConfigId: config.id,
      // The specialist travels in `review_master`: the API validates this
      // identifier against the module config's own entity (the reviews page),
      // so an admin id here is rejected.
      moduleEntityIdentifier: config.entityIdentifiers?.[0]?.id ?? '',
      replayTo: null,
      status: 'sent',
    });
    const err = asApiError(result);
    if (err) {
      return {ok: false, error: errorText(err)};
    }
    return {ok: true};
  } catch (e) {
    return {
      ok: false,
      error: String((e as {message?: string})?.message ?? e),
    };
  }
};
