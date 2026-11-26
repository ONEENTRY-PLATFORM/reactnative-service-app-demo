import {getAttributeFile, getAttributeFiles} from 'oneentry';
import type {IAttributeFile, IAttributeValue} from 'oneentry/dist/base/utils';

// Readers for OneEntry attribute values. Since SDK 1.0.157 a single-file
// `image`/`file` attribute is unwrapped — `value` is the file object itself,
// and an array only when several files are attached — while `value` itself is
// typed `unknown` (its shape is decided by `type` at runtime). Reading
// `value[0].downloadLink` therefore returns undefined with no error anywhere,
// so every attribute read goes through the helpers below.

/** URL of the first file of an `image`/`file`/`groupOfImages` attribute. */
export const attrFileUrl = (
  attr: IAttributeValue | undefined,
): string | undefined => getAttributeFile(attr)?.downloadLink;

/** Every file of a file-bearing attribute, one or many. */
export const attrFiles = (
  attr: IAttributeValue | undefined,
): IAttributeFile[] => getAttributeFiles(attr);

/** Value of a `string` attribute; empty string when unset. */
export const attrText = (attr: IAttributeValue | undefined): string =>
  typeof attr?.value === 'string' ? attr.value : '';

/** Value of an `integer`/`float`/`real` attribute; the SDK casts it to a number. */
export const attrNumber = (
  attr: IAttributeValue | undefined,
): number | undefined => {
  const value = attr?.value;
  if (typeof value === 'number') return value;
  if (
    typeof value === 'string' &&
    value.trim() !== '' &&
    !isNaN(Number(value))
  ) {
    return Number(value);
  }
  return undefined;
};

/**
 * Entries of an attribute whose value stays an array — `entity`, `list`,
 * `text`, `timeInterval`. The entry shape is defined by the attribute set,
 * so the caller names it.
 */
export const attrEntries = <T>(attr: IAttributeValue | undefined): T[] =>
  Array.isArray(attr?.value) ? (attr.value as T[]) : [];

type RichTextEntry = {
  plainValue?: string;
  htmlValue?: string;
  mdValue?: string;
};

/** Plain text of a `text` attribute, whose value is `[{plainValue, htmlValue}]`. */
export const attrRichText = (attr: IAttributeValue | undefined): string => {
  if (typeof attr?.value === 'string') return attr.value;
  const first = attrEntries<RichTextEntry>(attr)[0];
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
