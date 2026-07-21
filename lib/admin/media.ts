export function imageThumbnailUrl(url: string, width = 480, height = 360) {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.endsWith("imagekit.io")) return url;
    parsed.searchParams.set("tr", `w-${width},h-${height},c-at_max,q-72,f-auto`);
    return parsed.toString();
  } catch {
    return url;
  }
}
