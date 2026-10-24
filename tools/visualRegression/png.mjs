// Minimal PNG codec for the visual-regression harness — decode and
// encode 8-bit RGB/RGBA PNGs (what `adb screencap` and this tool write)
// using only Node built-ins (node:zlib), so the harness runs anywhere
// Node does with zero install. Interlaced PNGs are rejected: neither
// screencap nor this encoder produces them. The byte-level chunk
// primitives live in pngChunks.mjs and the pixel comparator in
// imageDiff.mjs (split out so each file stays under the length cap).

import zlib from "node:zlib";

import { chunk, paeth, PNG_SIGNATURE } from "./pngChunks.mjs";

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
