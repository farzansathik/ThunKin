// normal return the raw URL directly, since we are using supabase free plan which does not support image transformation (e.g. to jpeg) in the URL
export const toJpegUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  return url; // just return the raw URL directly
};



// need to be supabase pro. (i think it not working in free plan?)

// export const toJpegUrl = (url: string | null | undefined): string | null => {
//   if (!url) return null;
//   return url
//     .replace('/object/public/', '/render/image/public/')
//     + '?format=jpeg';
// };

// // e.g. resize too
// export const toJpegUrlWithSize = (url: string | null | undefined, width: number): string | null => {
//   if (!url) return null;
//   return url
//     .replace('/object/public/', '/render/image/public/')
//     + `?format=jpeg&width=${width}`;
// };