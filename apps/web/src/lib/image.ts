// Клиентское сжатие фото перед загрузкой (НФ-08) — Canvas, без внешних зависимостей.

/** URL публичного файла по ключу хранилища (`public/<hex>.jpg`) через прокси /v1. */
export function fileUrl(key: string): string {
  return `/v1/files/${key}`;
}

/** Сжимает изображение до maxDim по большей стороне и отдаёт JPEG-Blob. */
export async function compressImage(file: File, maxDim = 1280, quality = 0.82): Promise<Blob> {
  const dataUrl = await readAsDataUrl(file);
  const img = await loadImage(dataUrl);
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file; // фоллбэк — грузим оригинал
  ctx.drawImage(img, 0, 0, w, h);
  return new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b ?? file), 'image/jpeg', quality);
  });
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new Error('read_failed'));
    r.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error('image_load_failed'));
    i.src = src;
  });
}
