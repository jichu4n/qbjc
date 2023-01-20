import {createCanvas, createImageData, ImageData} from 'canvas';
import {Font} from './font';
import {FONT_DATA} from './font-data';

/** Text format, in number of characters. */
export interface TextFormat {
  cols: number;
  rows: number;
}

/** Size of a 2D object in pixels. */
export interface Size2D {
  width: number;
  height: number;
}

/** Graphics resolution, in pixels. */
export type Resolution = Size2D;

/** RGB Color value. */
export type RGB = [number, number, number];

/** Color with optional attributes. */
export type Color =
  | RGB // Plain color (e.g. '#aaff00')
  | {
      // Color with attributes.
      rgb: RGB;
      blink?: boolean;
    };

/** A color palette, represented as an array of CSS colors. */
export type Palette = Array<Color>;

/** Basic type of a video mode. */
export enum VideoModeType {
  /** Only supports text, no graphics. */
  TEXT = 'text',
  /** Supports text and graphics. */
  TEXT_AND_GRAPHICS = 'textAndGraphics',
}

/** Data and attributes stored for each element in a text buffer. */
export interface TextCell {
  /** The ASCII code of the text character. */
  charCode: number;
  /** Foreground color. */
  fgColor: number;
  /** Background color. */
  bgColor: number;
}

const SPACE = ' '.charCodeAt(0);

/** Base class for video mode implementations. */
export abstract class VideoModeController {
  constructor(
    /** Type of this video mode. */
    readonly type: VideoModeType,
    /** Text format. */
    readonly textFormat: TextFormat,
    /** Graphics resolution. */
    readonly resolution: Resolution,
    /** Number of screen pages. */
    readonly numPages: number,
    /** Font. */
    readonly font: Font,
    /** Number of available foreground colors.
     *
     * Sets the upper bound on foreground colors.
     */
    readonly numFgColors: number,
    /** Number of available background colors.
     *
     * Sets the upper bound on background colors.
     */
    readonly numBgColors: number
  ) {}

  /** Convert color value (number) to RGB. */
  protected abstract toRgb(color: number): RGB;

  /** Draw a text character at (x, y). */
  drawChar(x: number, y: number, charOrCharCode: string | number) {
    if (
      !(
        x >= 0 &&
        x < this.textFormat.cols &&
        y >= 0 &&
        y < this.textFormat.rows
      )
    ) {
      return;
    }
    const charCode =
      typeof charOrCharCode === 'string'
        ? charOrCharCode.charCodeAt(0)
        : charOrCharCode;
    const glyph = this.font.glyphs[charCode];
    if (!glyph) {
      return;
    }
    this.activeTextBuffer[y][x] = {
      charCode,
      fgColor: this.textFgColor,
      bgColor: this.bgColor,
    };
    const xPos = this.font.width * x;
    const yPos = this.font.height * y;
    for (let y = 0; y < this.font.height; ++y) {
      for (let x = 0; x < this.font.width; ++x) {
        this.activePixelBuffer[yPos + y][xPos + x] = glyph[y][x]
          ? this.textFgColor
          : this.bgColor;
      }
    }
  }
  /** Draw a pixel at (x, y). */
  drawPixel(x: number, y: number, color: number) {}

  /** Render currently visible page to array of HTML hex color values. */
  renderToImageData(): ImageData {
    const uint8Array = new Uint8ClampedArray(
      this.resolution.height * this.resolution.width * 4
    );
    for (let y = 0, offset = 0; y < this.resolution.height; ++y) {
      for (let x = 0; x < this.resolution.width; ++x, offset += 4) {
        const color = this.visiblePixelBuffer[y][x];
        const [r, g, b] = this.toRgb(color);
        uint8Array[offset] = r;
        uint8Array[offset + 1] = g;
        uint8Array[offset + 2] = b;
        uint8Array[offset + 3] = 0xff;
      }
    }
    return createImageData(
      uint8Array,
      this.resolution.width,
      this.resolution.height
    );
  }

  /** Currently active page. */
  protected activePage: number = 0;
  /** Currently visible page. */
  protected visiblePage: number = 0;
  /** Current foreground color. */
  private _fgColor: number = this.numFgColors - 1;
  /** Current foreground color. */
  get fgColor() {
    return this._fgColor;
  }
  set fgColor(color: number) {
    this._fgColor = color % this.numFgColors;
  }
  /** Current background color. */
  private _bgColor: number = 0;
  /** Current background color. */
  get bgColor() {
    return this._bgColor;
  }
  set bgColor(color: number) {
    this._bgColor = color % this.numBgColors;
  }
  /** Buffer storing the ASCII value of the character at [page][y][x].
   *
   * Initial value for all elements is space (0x20 / 32).
   */
  protected textBuffer: Array<Array<Array<TextCell>>> = Array.from(
    {length: this.numPages},
    () =>
      Array.from({length: this.textFormat.rows}, () =>
        Array.from({length: this.textFormat.cols}, () => ({
          charCode: SPACE,
          fgColor: this.textFgColor,
          bgColor: this.bgColor,
        }))
      )
  );
  /** Pixel buffer storing the color value at [page][y][x].
   *
   * Initial value for pixels is the background color.
   */
  protected pixelBuffer: Array<Array<Array<number>>> = Array.from(
    {length: this.numPages},
    () =>
      Array.from({length: this.resolution.height}, () =>
        Array.from({length: this.resolution.width}, () => this.bgColor)
      )
  );

  /** The currently active text buffer page. */
  protected get activeTextBuffer() {
    return this.textBuffer[this.activePage];
  }
  /** The currently active pixel buffer page. */
  protected get activePixelBuffer() {
    return this.pixelBuffer[this.activePage];
  }
  /** The currently visible pixel buffer page. */
  protected get visiblePixelBuffer() {
    return this.pixelBuffer[this.visiblePage];
  }

  /** Current text foreground color.
   *
   * This is typically the same as the graphics foreground color, but e.g. CGA
   * mode always renders text in color 3.
   */
  protected get textFgColor() {
    return this.fgColor;
  }
}

/** 4-bit RGBI 16-color palette. */
export const TEXT_MODE_16_COLOR_PALETTE: Palette = [
  [0x00, 0x00, 0x00],
  [0x00, 0x00, 0xaa],
  [0x00, 0xaa, 0x00],
  [0x00, 0xaa, 0xaa],
  [0xaa, 0x00, 0x00],
  [0xaa, 0x00, 0xaa],
  [0xaa, 0x55, 0x00],
  [0xaa, 0xaa, 0xaa],
  [0x55, 0x55, 0x55],
  [0x55, 0x55, 0xff],
  [0x55, 0xff, 0x55],
  [0x55, 0xff, 0xff],
  [0xff, 0x55, 0x55],
  [0xff, 0x55, 0xff],
  [0xff, 0xff, 0x55],
  [0xff, 0xff, 0xff],
  {rgb: [0x00, 0x00, 0x00], blink: true},
  {rgb: [0x00, 0x00, 0xaa], blink: true},
  {rgb: [0x00, 0xaa, 0x00], blink: true},
  {rgb: [0x00, 0xaa, 0xaa], blink: true},
  {rgb: [0xaa, 0x00, 0x00], blink: true},
  {rgb: [0xaa, 0x00, 0xaa], blink: true},
  {rgb: [0xaa, 0x55, 0x00], blink: true},
  {rgb: [0xaa, 0xaa, 0xaa], blink: true},
  {rgb: [0x55, 0x55, 0x55], blink: true},
  {rgb: [0x55, 0x55, 0xff], blink: true},
  {rgb: [0x55, 0xff, 0x55], blink: true},
  {rgb: [0x55, 0xff, 0xff], blink: true},
  {rgb: [0xff, 0x55, 0x55], blink: true},
  {rgb: [0xff, 0x55, 0xff], blink: true},
  {rgb: [0xff, 0xff, 0x55], blink: true},
  {rgb: [0xff, 0xff, 0xff], blink: true},
];

/** Base class for text modes (BIOS modes 0, 1, 2, 3). */
class TextModeController extends VideoModeController {
  constructor(
    textFormat: TextFormat,
    resolution: Resolution,
    readonly numPages: number
  ) {
    super(
      VideoModeType.TEXT,
      textFormat,
      resolution,
      numPages,
      FONT_DATA.find(({name}) => name === '8x8')!,
      16,
      8
    );
  }

  protected toRgb(color: number): RGB {
    const v = TEXT_MODE_16_COLOR_PALETTE[color];
    return Array.isArray(v) ? v : v.rgb;
  }
}

/** 40x25 text mode (BIOS mode 1). */
export class TextMode40x25Controller extends TextModeController {
  constructor() {
    super({cols: 40, rows: 25}, {width: 320, height: 200}, 8);
  }
}

/** 80x25 text mode (BIOS mode 3). */
export class TextMode80x25Controller extends TextModeController {
  constructor() {
    super({cols: 80, rows: 25}, {width: 640, height: 200}, 4);
  }
}

if (require.main === module) {
  const fs = require('fs-extra');
  const path = require('path');

  const controller = new TextMode40x25Controller();
  let text = 'hello';
  for (let i = 0; i < text.length; ++i) {
    controller.drawChar(i, 0, text.charCodeAt(i));
  }
  text = 'world';
  controller.fgColor = 1;
  controller.bgColor = 4;
  for (let i = 0; i < text.length; ++i) {
    controller.drawChar(i + 10, 1, text.charCodeAt(i));
  }
  const imageData = controller.renderToImageData();
  const c = createCanvas(
    controller.resolution.width,
    controller.resolution.height
  );
  const ctx = c.getContext('2d');
  ctx.putImageData(imageData, 0, 0);
  const pngBuffer = c.toBuffer('image/png');
  fs.writeFile(
    path.join(
      __dirname,
      '..',
      '..',
      '..',
      'src',
      'runtime',
      'display',
      'out.png'
    ),
    pngBuffer
  );
}
