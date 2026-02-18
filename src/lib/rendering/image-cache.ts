const imageCache = new Map<string, HTMLImageElement>();
const pendingLoads = new Map<string, Promise<HTMLImageElement>>();

export async function loadImage(src: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(src);
  if (cached && cached.complete && cached.naturalWidth > 0) {
    return cached;
  }

  const pending = pendingLoads.get(src);
  if (pending) return pending;

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache.set(src, img);
      pendingLoads.delete(src);
      resolve(img);
    };
    img.onerror = () => {
      pendingLoads.delete(src);
      reject(new Error(`Failed to load image: ${src.slice(0, 64)}`));
    };
    img.src = src;
  });

  pendingLoads.set(src, promise);
  return promise;
}

export function clearImageCache() {
  imageCache.clear();
  pendingLoads.clear();
}
