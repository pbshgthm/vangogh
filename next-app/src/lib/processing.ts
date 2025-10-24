import { promises as fs } from "fs";
import sharp from "sharp";
import { put, list, del, head } from "@vercel/blob";

const clusterMin = 5;
const clusterK = 10;
const redImgSize = 20;
const detImgSize = 10;
const cachePrefix = "desk";

export class SearchError extends Error {}

type Pixel = [number, number, number];
type ScatterSeries = [number[], number[], number[]];
type ClusterScatter = ScatterSeries[];

interface KMeansResult {
  centroids: number[][];
  labels: number[];
}

interface StoredImage {
  key: string;
  buffer: Buffer;
  contentType?: string;
}

const getBlobToken = () => {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) {
    throw new SearchError("Missing BLOB_READ_WRITE_TOKEN");
  }
  return token;
};

const srgbToLinear = (value: number) => {
  const channel = value / 255;
  if (channel <= 0.04045) {
    return channel / 12.92;
  }
  return Math.pow((channel + 0.055) / 1.055, 2.4);
};

const rgbToLab = ([r, g, b]: Pixel): Pixel => {
  const rl = srgbToLinear(r);
  const gl = srgbToLinear(g);
  const bl = srgbToLinear(b);

  const x = rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375;
  const y = rl * 0.2126729 + gl * 0.7151522 + bl * 0.072175;
  const z = rl * 0.0193339 + gl * 0.119192 + bl * 0.9503041;

  const refX = 0.95047;
  const refY = 1;
  const refZ = 1.08883;

  const fx = xyzToLab(x / refX);
  const fy = xyzToLab(y / refY);
  const fz = xyzToLab(z / refZ);

  const L = Math.max(0, 116 * fy - 16);
  const a = 500 * (fx - fy);
  const bLab = 200 * (fy - fz);
  return [L, a, bLab];
};

const xyzToLab = (value: number) => {
  const epsilon = 216 / 24389;
  const kappa = 24389 / 27;
  if (value > epsilon) {
    return Math.cbrt(value);
  }
  return (kappa * value + 16) / 116;
};

const readImagePixels = async (
  source: Buffer,
  mode: "lab" | "rgb",
  size: number
): Promise<Pixel[]> => {
  const { data, info } = await sharp(source)
    .resize(size, size, { fit: "fill" })
    .removeAlpha()
    .toColourspace("srgb")
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels: Pixel[] = [];
  for (let i = 0; i < data.length; i += info.channels) {
    const srgb: Pixel = [
      data[i],
      data[i + 1] ?? data[i],
      data[i + 2] ?? data[i],
    ];
    if (mode === "lab") {
      pixels.push(rgbToLab(srgb));
    } else {
      pixels.push(srgb);
    }
  }
  return pixels;
};

const computeMoments = (pixels: Pixel[]): number[] => {
  const n = pixels.length || 1;
  const means: Pixel = [0, 0, 0];
  const std: Pixel = [0, 0, 0];
  const skew: Pixel = [0, 0, 0];

  for (const [x, y, z] of pixels) {
    means[0] += x;
    means[1] += y;
    means[2] += z;
  }

  means[0] /= n;
  means[1] /= n;
  means[2] /= n;

  for (const [x, y, z] of pixels) {
    const dx = x - means[0];
    const dy = y - means[1];
    const dz = z - means[2];
    std[0] += dx * dx;
    std[1] += dy * dy;
    std[2] += dz * dz;
    skew[0] += dx * dx * dx;
    skew[1] += dy * dy * dy;
    skew[2] += dz * dz * dz;
  }

  const safe = (value: number) => (Math.abs(value) < 1e-9 ? 1e-9 : value);

  for (let i = 0; i < 3; i += 1) {
    std[i] = Math.sqrt(std[i] / n);
    skew[i] = (skew[i] / n) / Math.pow(safe(std[i]), 3);
  }

  return [...means, ...std, ...skew];
};

const euclidean = (a: number[], b: number[]) => {
  let sum = 0;
  for (let i = 0; i < a.length; i += 1) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
};

const kmeans = (points: number[][], k: number, maxIterations = 100): KMeansResult => {
  if (points.length === 0) {
    throw new Error("No data available for clustering");
  }
  const dimension = points[0].length;
  const clusterCount = Math.min(k, points.length);
  const centroids: number[][] = [];
  const used = new Set<number>();

  while (centroids.length < clusterCount) {
    const idx = Math.floor(Math.random() * points.length);
    if (used.has(idx)) {
      continue;
    }
    used.add(idx);
    centroids.push(points[idx].slice());
  }
  const labels = new Array(points.length).fill(0);

  for (let iter = 0; iter < maxIterations; iter += 1) {
    let changed = false;
    for (let i = 0; i < points.length; i += 1) {
      let bestIdx = 0;
      let bestDist = Number.POSITIVE_INFINITY;
      for (let j = 0; j < centroids.length; j += 1) {
        const dist = euclidean(points[i], centroids[j]);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = j;
        }
      }
      if (labels[i] !== bestIdx) {
        labels[i] = bestIdx;
        changed = true;
      }
    }

    const sums = Array.from({ length: centroids.length }, () =>
      new Array(dimension).fill(0)
    );
    const counts = new Array(centroids.length).fill(0);

    for (let i = 0; i < points.length; i += 1) {
      const label = labels[i];
      counts[label] += 1;
      const sum = sums[label];
      const point = points[i];
      for (let d = 0; d < dimension; d += 1) {
        sum[d] += point[d];
      }
    }

    for (let j = 0; j < centroids.length; j += 1) {
      if (counts[j] === 0) {
        centroids[j] = points[Math.floor(Math.random() * points.length)].slice();
        continue;
      }
      for (let d = 0; d < dimension; d += 1) {
        centroids[j][d] = sums[j][d] / counts[j];
      }
    }

    if (!changed) {
      break;
    }
  }

  return { centroids, labels };
};

const clusterCost = (
  data: number[][],
  centroids: number[][],
  labels: number[]
) => {
  const sums = new Array(centroids.length).fill(0);
  const counts = new Array(centroids.length).fill(0);
  for (let i = 0; i < data.length; i += 1) {
    const label = labels[i];
    const distance = euclidean(data[i], centroids[label]);
    sums[label] += distance;
    counts[label] += 1;
  }
  return sums.map((sum, index) =>
    counts[index] === 0 ? Number.POSITIVE_INFINITY : sum / counts[index]
  );
};

const shuffle = <T,>(items: T[]) => {
  const result = items.slice();
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const rgbToHex = ([r, g, b]: Pixel) =>
  `#${[r, g, b]
    .map((value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0"))
    .join("")}`;

const getPlot = (pixels: Pixel[]): ScatterSeries => {
  const plot: ScatterSeries = [[], [], []];
  for (const [r, g, b] of pixels) {
    plot[0].push(Math.round(r));
    plot[1].push(Math.round(g));
    plot[2].push(Math.round(b));
  }
  return plot;
};

const getPalette = (pixels: Pixel[], paletteK: number) => {
  const desired = Math.min(paletteK + 2, pixels.length);
  const { centroids } = kmeans(pixels, desired);
  const ranked = centroids
    .map((centroid) => ({
      value: Math.max(centroid[0], centroid[1], centroid[2]),
      color: rgbToHex(centroid as Pixel),
    }))
    .sort((a, b) => b.value - a.value);
  return ranked.slice(0, paletteK).map((entry) => entry.color);
};

const buildData = async (
  imageBuffers: Map<string, Buffer>,
  clusters: { cost: number; files: string[] }[],
  paletteSize: number
) => {
  const palette: string[][][] = [];
  const scatter: ClusterScatter[] = [];
  const limit = Math.min(4, clusters.length);

  for (let i = 0; i < limit; i += 1) {
    const cluster = clusters[i];
    const files = shuffle(cluster.files).slice(0, clusterMin);
    const clusterPalette: string[][] = [];
    const clusterScatter: ClusterScatter = [];

    for (const key of files) {
      const buffer = imageBuffers.get(key);
      if (!buffer) {
        continue;
      }
      const rgbPixels = await readImagePixels(buffer, "rgb", redImgSize);
      clusterPalette.push(getPalette(rgbPixels, paletteSize));
      clusterScatter.push(getPlot(rgbPixels));
    }

    palette.push(clusterPalette);
    scatter.push(clusterScatter);
  }

  return { palette, scatter };
};

const processImages = async (images: StoredImage[], paletteSize: number) => {
  const labData: Pixel[][] = [];
  const fileList: string[] = [];
  const imageBuffers = new Map<string, Buffer>();

  for (const image of images) {
    const labPixels = await readImagePixels(image.buffer, "lab", detImgSize);
    labData.push(labPixels);
    fileList.push(image.key);
    imageBuffers.set(image.key, image.buffer);
  }

  if (labData.length === 0) {
    throw new SearchError("No images available");
  }

  const moments = labData.map((pixels) => computeMoments(pixels));
  const { centroids, labels } = kmeans(moments, clusterK);
  const cost = clusterCost(moments, centroids, labels);

  const clusters = Array.from({ length: centroids.length }, (_, index) => ({
    cost: cost[index],
    files: [] as string[],
  }));

  for (let i = 0; i < labels.length; i += 1) {
    clusters[labels[i]].files.push(fileList[i]);
  }

  const filtered = clusters
    .filter((cluster) => cluster.files.length >= clusterMin && Number.isFinite(cluster.cost))
    .sort((a, b) => a.cost - b.cost);

  if (filtered.length < 4) {
    throw new SearchError("Insufficient samples for clustering");
  }

  return buildData(imageBuffers, filtered, paletteSize);
};

const fetchBuffer = async (url: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return undefined;
    }
    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength === 0) {
      return undefined;
    }
    return {
      buffer: Buffer.from(arrayBuffer),
      contentType: response.headers.get("content-type") ?? undefined,
    };
  } catch {
    return undefined;
  }
};

const listAllBlobs = async (prefix: string, token: string) => {
  const blobs = [];
  let cursor: string | undefined;
  do {
    const result = await list({ prefix, token, cursor });
    blobs.push(...result.blobs);
    cursor = result.cursor;
    if (!result.hasMore) {
      break;
    }
  } while (cursor);
  return blobs;
};

const getCachedImages = async (prefix: string, token: string): Promise<StoredImage[]> => {
  const blobs = await listAllBlobs(prefix, token);
  if (!blobs.length) {
    return [];
  }

  const images: StoredImage[] = [];
  for (const blob of blobs.sort((a, b) => a.pathname.localeCompare(b.pathname))) {
    const data = await fetchBuffer(blob.downloadUrl);
    if (!data) {
      continue;
    }
    images.push({
      key: blob.pathname,
      buffer: data.buffer,
      contentType: data.contentType,
    });
  }
  return images;
};

const deleteCachedImages = async (prefix: string, token: string) => {
  const blobs = await listAllBlobs(prefix, token);
  if (!blobs.length) {
    return;
  }
  await del(
    blobs.map((blob) => blob.url),
    { token }
  );
};

const downloadAndStoreImages = async (
  prefix: string,
  urls: string[],
  token: string
): Promise<StoredImage[]> => {
  if (!urls.length) {
    throw new SearchError("No results from Google search");
  }
  const images: StoredImage[] = [];
  let index = 1;
  for (const url of urls) {
    const data = await fetchBuffer(url);
    if (!data) {
      continue;
    }
    const blobKey = `${prefix}${String(index).padStart(4, "0")}`;
    try {
      await put(blobKey, data.buffer, {
        access: "public",
        token,
        contentType: data.contentType,
      });
      images.push({
        key: blobKey,
        buffer: data.buffer,
        contentType: data.contentType,
      });
      index += 1;
    } catch {
      // ignore upload errors and continue
    }
  }

  if (!images.length) {
    throw new SearchError("Unable to download images");
  }

  return images;
};

interface GoogleImageResult {
  link?: string;
  image?: {
    thumbnailLink?: string;
  };
}

const searchGoogle = async (query: string, apiKey: string, cx: string) => {
  const urls: string[] = [];
  for (let start = 1; start <= 41 && urls.length < 60; start += 10) {
    const params = new URLSearchParams({
      key: apiKey,
      cx,
      searchType: "image",
      safe: "active",
      q: query,
      num: "10",
      start: String(start),
    });
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?${params.toString()}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new SearchError("Google search failed");
    }
    const data = (await response.json()) as { items?: GoogleImageResult[] };
    const items = data.items ?? [];
    if (!items.length) {
      break;
    }
    for (const item of items) {
      const candidate = item.image?.thumbnailLink ?? item.link;
      if (candidate) {
        urls.push(candidate);
      }
    }
    if (items.length < 10) {
      break;
    }
  }
  return Array.from(new Set(urls));
};

const normalizeKey = (key: string) =>
  key
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_+|_+$/g, "");

export const searchPalettes = async (
  rawKey: string,
  paletteSize: number,
  cacheClear: boolean
) => {
  const googleApiKey = process.env.GOOGLE_API_KEY?.trim();
  const googleCx = process.env.GOOGLE_CSE_ID?.trim();

  if (!googleApiKey) {
    throw new SearchError("Missing GOOGLE_API_KEY");
  }
  if (!googleCx) {
    throw new SearchError("Missing GOOGLE_CSE_ID");
  }

  const trimmedKey = rawKey.trim();
  if (!trimmedKey) {
    throw new SearchError("Empty search term");
  }

  const normalizedKey = normalizeKey(trimmedKey);
  if (!normalizedKey) {
    throw new SearchError("Empty search term");
  }

  const safePalette = Math.min(
    Math.max(parseInt(String(paletteSize), 10) || 4, 3),
    7
  );

  const token = getBlobToken();
  const prefix = `${cachePrefix}/${normalizedKey}/`;

  if (cacheClear) {
    await deleteCachedImages(prefix, token);
  }

  let images = await getCachedImages(prefix, token);

  if (!images.length) {
    const urls = await searchGoogle(trimmedKey, googleApiKey, googleCx);
    images = await downloadAndStoreImages(prefix, urls, token);
  }

  return processImages(images, safePalette);
};

export const imagePaletteFromSource = async (source: Buffer | string) => {
  const buffer =
    typeof source === "string" ? await fs.readFile(source) : source;
  const rgbPixels = await readImagePixels(buffer, "rgb", 100);
  const palettes: string[][] = [];
  for (let k = 3; k <= 7; k += 1) {
    palettes.push(getPalette(rgbPixels, k));
  }
  const scatter = getPlot(rgbPixels);
  return { palette: palettes, scatter };
};

export const getArchiveKeys = async () => {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) {
    return [];
  }

  const prefix = `${cachePrefix}/`;
  const blobs = await listAllBlobs(prefix, token);
  const directories = new Set<string>();
  for (const blob of blobs) {
    const relative = blob.pathname.slice(prefix.length);
    const [folder] = relative.split("/");
    if (folder) {
      directories.add(folder);
    }
  }
  return Array.from(directories).sort((a, b) => a.localeCompare(b));
};

export const getBlobDownloadUrl = async (pathname: string) => {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) {
    return undefined;
  }
  try {
    const metadata = await head(pathname, { token });
    return metadata.downloadUrl;
  } catch {
    return undefined;
  }
};
