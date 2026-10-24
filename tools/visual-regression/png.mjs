// Minimal PNG codec for the visual-regression harness — decode and
// encode 8-bit RGB/RGBA PNGs (what `adb screencap` and this tool write)
// using only Node built-ins (node:zlib), so the harness runs anywhere
// Node does with zero install. Interlaced PNGs are rejected: neither
// screencap nor this encoder produces them.

import zlib from "node:zlib";

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const crcTable = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xed_b8_83_20 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xff_ff_ff_ff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xff_ff_ff_ff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

/** Encode an RGBA buffer (width*height*4) as a PNG. */
export function encodePng(width, height, rgba) {
  if (rgba.length !== width * height * 4) {
    throw new Error(`encodePng: expected ${width * height * 4} bytes, got ${rgba.length}`);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  const raw = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 4)] = 0; // filter: none
    rgba.copy(raw, y * (1 + width * 4) + 1, y * width * 4, (y + 1) * width * 4);
  }
  return Buffer.concat([
    PNG_SIGNATURE,
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 6 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

/** Decode a PNG to { width, height, rgba } (RGBA, 4 bytes/pixel). */
export function decodePng(buf) {
  if (!buf.subarray(0, 8).equals(PNG_SIGNATURE)) throw new Error("decodePng: bad signature");
  let offset = 8;
  let width = 0;
  let height = 0;
  let colorType = 0;
  const idat = [];
  chunks: while (offset < buf.length) {
    const len = buf.readUInt32BE(offset);
    const type = buf.toString("ascii", offset + 4, offset + 8);
    const data = buf.subarray(offset + 8, offset + 8 + len);
    switch (type) {
      case "IHDR": {
        width = data.readUInt32BE(0);
        height = data.readUInt32BE(4);
        if (data[8] !== 8) throw new Error(`decodePng: unsupported bit depth ${data[8]}`);
        colorType = data[9];
        if (colorType !== 2 && colorType !== 6) {
          throw new Error(`decodePng: unsupported color type ${colorType}`);
        }
        if (data[12] !== 0) throw new Error("decodePng: interlaced PNGs unsupported");
        break;
      }
      case "IDAT": {
        idat.push(data);
        break;
      }
      case "IEND": {
        break chunks;
      }
      default: {
        break;
      }
    }
    offset += 12 + len;
  }
  const bpp = colorType === 6 ? 4 : 3;
  const stride = width * bpp;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  if (raw.length < height * (stride + 1)) throw new Error("decodePng: truncated pixel data");
  const out = Buffer.alloc(width * height * 4);
  let prevRow = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const rowStart = y * (stride + 1);
    const filter = raw[rowStart];
    const row = Buffer.from(raw.subarray(rowStart + 1, rowStart + 1 + stride));
    for (let x = 0; x < stride; x++) {
      const left = x >= bpp ? row[x - bpp] : 0;
      const up = prevRow[x];
      const upLeft = x >= bpp ? prevRow[x - bpp] : 0;
      switch (filter) {
        case 1: {
          row[x] = (row[x] + left) & 0xff;
          break;
        }
        case 2: {
          row[x] = (row[x] + up) & 0xff;
          break;
        }
        case 3: {
          row[x] = (row[x] + ((left + up) >> 1)) & 0xff;
          break;
        }
        case 4: {
          row[x] = (row[x] + paeth(left, up, upLeft)) & 0xff;
          break;
        }
        default: {
          if (filter !== 0) throw new Error(`decodePng: unknown filter ${filter}`);
        }
      }
    }
    for (let x = 0; x < width; x++) {
      const src = x * bpp;
      const dst = (y * width + x) * 4;
      out[dst] = row[src];
      out[dst + 1] = row[src + 1];
      out[dst + 2] = row[src + 2];
      out[dst + 3] = bpp === 4 ? row[src + 3] : 0xff;
    }
    prevRow = row;
  }
  return { width, height, rgba: out };
}

/**
 * Compare two decoded images. A pixel "differs" when any channel's
 * absolute delta exceeds `threshold` (0-255 scale). Returns the diff
 * count, the differing ratio, and a diff visualization (dimmed
 * baseline with differing pixels in red) as an encoded PNG buffer.
 */
export function diffImages(a, b, threshold = 16) {
  if (a.width !== b.width || a.height !== b.height) {
    throw new Error(`diffImages: size mismatch ${a.width}x${a.height} vs ${b.width}x${b.height}`);
  }
  const total = a.width * a.height;
  const vis = Buffer.alloc(total * 4);
  let diffCount = 0;
  for (let i = 0; i < total; i++) {
    const o = i * 4;
    const dr = Math.abs(a.rgba[o] - b.rgba[o]);
    const dg = Math.abs(a.rgba[o + 1] - b.rgba[o + 1]);
    const db = Math.abs(a.rgba[o + 2] - b.rgba[o + 2]);
    const da = Math.abs(a.rgba[o + 3] - b.rgba[o + 3]);
    if (Math.max(dr, dg, db, da) > threshold) {
      diffCount++;
      vis[o] = 0xff;
      vis[o + 1] = 0x00;
      vis[o + 2] = 0x00;
      vis[o + 3] = 0xff;
    } else {
      const gray = Math.round((a.rgba[o] + a.rgba[o + 1] + a.rgba[o + 2]) / 3);
      vis[o] = gray;
      vis[o + 1] = gray;
      vis[o + 2] = gray;
      vis[o + 3] = 0xff;
    }
  }
  return {
    diffCount,
    total,
    ratio: diffCount / total,
    diffPng: encodePng(a.width, a.height, vis),
  };
}
