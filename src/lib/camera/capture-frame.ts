/**
 * Captura frames para envio ao OCR no servidor (multipart JPEG).
 */

const MOTION_SAMPLE_WIDTH = 64;
const MOTION_SAMPLE_HEIGHT = 48;
const OCR_CAPTURE_MAX_DIM = 960;
const OCR_JPEG_QUALITY = 0.78;

async function canvasToJpegBlob(
  canvas: HTMLCanvasElement,
  quality = 0.92,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) =>
        b
          ? resolve(b)
          : reject(new Error("Falha ao gerar JPEG a partir do canvas.")),
      "image/jpeg",
      quality,
    );
  });
}

function drawVideoSample(
  video: HTMLVideoElement,
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
): boolean {
  const w = video.videoWidth;
  const h = video.videoHeight;
  if (!w || !h) return false;
  canvas.width = MOTION_SAMPLE_WIDTH;
  canvas.height = MOTION_SAMPLE_HEIGHT;
  try {
    ctx.drawImage(video, 0, 0, MOTION_SAMPLE_WIDTH, MOTION_SAMPLE_HEIGHT);
    return true;
  } catch {
    return false;
  }
}

/** Mean absolute difference between two grayscale samples (0–255 scale). */
export function computeGrayscaleMotionScore(
  previous: Uint8ClampedArray | null,
  current: Uint8ClampedArray,
): number {
  if (!previous || previous.length !== current.length) {
    return 0;
  }
  let total = 0;
  for (let i = 0; i < current.length; i += 4) {
    const cur = (current[i] + current[i + 1] + current[i + 2]) / 3;
    const prev = (previous[i] + previous[i + 1] + previous[i + 2]) / 3;
    total += Math.abs(cur - prev);
  }
  return total / (current.length / 4);
}

export function sampleVideoMotion(
  video: HTMLVideoElement,
  previousSnapshot: Uint8ClampedArray | null,
): { score: number; snapshot: Uint8ClampedArray | null } {
  if (
    !video.videoWidth ||
    video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA
  ) {
    return { score: 0, snapshot: previousSnapshot };
  }
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx || !drawVideoSample(video, ctx, canvas)) {
    return { score: 0, snapshot: previousSnapshot };
  }
  const imageData = ctx.getImageData(
    0,
    0,
    MOTION_SAMPLE_WIDTH,
    MOTION_SAMPLE_HEIGHT,
  );
  const score = computeGrayscaleMotionScore(previousSnapshot, imageData.data);
  return { score, snapshot: imageData.data };
}

export async function videoToJpegBlob(
  video: HTMLVideoElement,
  quality = OCR_JPEG_QUALITY,
): Promise<Blob | null> {
  const w = video.videoWidth;
  const h = video.videoHeight;
  if (!w || !h) {
    return null;
  }
  const longest = Math.max(w, h);
  const scale =
    longest > OCR_CAPTURE_MAX_DIM ? OCR_CAPTURE_MAX_DIM / longest : 1;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  try {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  } catch (e) {
    if (e instanceof DOMException && e.name === "SecurityError") return null;
    return null;
  }
  try {
    return await canvasToJpegBlob(canvas, quality);
  } catch {
    return null;
  }
}

export async function imageElementToJpegBlob(
  img: HTMLImageElement,
  quality = 0.92,
): Promise<Blob | null> {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  if (!w || !h) return null;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  try {
    ctx.drawImage(img, 0, 0, w, h);
  } catch (e) {
    if (e instanceof DOMException && e.name === "SecurityError") return null;
    return null;
  }
  try {
    return await canvasToJpegBlob(canvas, quality);
  } catch {
    return null;
  }
}

export function sampleImageMotion(
  img: HTMLImageElement,
  previousSnapshot: Uint8ClampedArray | null,
): { score: number; snapshot: Uint8ClampedArray | null } {
  if (!img.naturalWidth) {
    return { score: 0, snapshot: previousSnapshot };
  }
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return { score: 0, snapshot: previousSnapshot };
  canvas.width = MOTION_SAMPLE_WIDTH;
  canvas.height = MOTION_SAMPLE_HEIGHT;
  try {
    ctx.drawImage(img, 0, 0, MOTION_SAMPLE_WIDTH, MOTION_SAMPLE_HEIGHT);
  } catch {
    return { score: 0, snapshot: previousSnapshot };
  }
  const imageData = ctx.getImageData(
    0,
    0,
    MOTION_SAMPLE_WIDTH,
    MOTION_SAMPLE_HEIGHT,
  );
  const score = computeGrayscaleMotionScore(previousSnapshot, imageData.data);
  return { score, snapshot: imageData.data };
}
