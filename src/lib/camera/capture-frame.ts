/**
 * Captura frames para envio ao OCR no servidor (multipart JPEG).
 */

export async function canvasToJpegBlob(canvas: HTMLCanvasElement, quality = 0.92): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Falha ao gerar JPEG a partir do canvas.'))),
      'image/jpeg',
      quality
    );
  });
}

export async function videoToJpegBlob(video: HTMLVideoElement, quality = 0.92): Promise<Blob | null> {
  const w = video.videoWidth;
  const h = video.videoHeight;
  if (!w || !h) return null;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(video, 0, 0, w, h);
  try {
    return await canvasToJpegBlob(canvas, quality);
  } catch {
    return null;
  }
}

export async function imageElementToJpegBlob(img: HTMLImageElement, quality = 0.92): Promise<Blob | null> {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  if (!w || !h) return null;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  try {
    ctx.drawImage(img, 0, 0, w, h);
    return await canvasToJpegBlob(canvas, quality);
  } catch {
    return null;
  }
}
