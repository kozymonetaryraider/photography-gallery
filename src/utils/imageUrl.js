const DEFAULT_IMAGE_BASE_URL =
  'https://kozymonetaryraider-1433634188.cos.ap-hongkong.myqcloud.com';

const IMAGE_BASE_URL = (
  import.meta.env.VITE_IMAGE_BASE_URL || DEFAULT_IMAGE_BASE_URL
).replace(/\/$/, '');

export function imageUrl(src) {
  if (!IMAGE_BASE_URL || !src?.startsWith('/images/')) return src;
  return encodeURI(`${IMAGE_BASE_URL}${src}`);
}
