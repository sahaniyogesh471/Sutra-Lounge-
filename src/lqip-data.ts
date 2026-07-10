// Auto-generated LQIP (Low Quality Image Placeholders) data
// Generated at: 2026-07-10T17:50:31.880Z
// Run: npm run generate-lqip to regenerate

export const LQIP_DATA = {};

export const getLQIPForImage = (src: string): string | undefined => {
  const entry = Object.values(LQIP_DATA).find((item: any) => item.src === src);
  return entry?.blurDataUrl;
};
