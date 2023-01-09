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

/** Color with optional attributes. */
export type Color =
  | string // Plain color (e.g. '#aaff00')
  | {
      // Color with attributes.
      color: string;
      blink?: boolean;
    };

/** A color palette, represented as an array of CSS colors. */
export type Palette = Array<Color>;

/** Information about current screen mode. */
export interface ModeInfo {
  /** Whether the current mode supports graphics.
   *
   * If false, only text mode output is supported.
   */
  isGraphicsMode: boolean;
  /** Number of colors supported for foreground. */
  numFgColors: number;
  /** Number of colors supported for background. */
  numBgColors: number;
  /** Text format. */
  textFormat: TextFormat;
  /** Graphics resolution. */
  resolution: Resolution;
  /** Size of a text character, in pixels. */
  characterSize: Size2D;
  /** Number of screen pages available. */
  numPages: number;
}

/** 4-bit RGBI 16-color palette. */
export const Cga16ColorPalette: Palette = [
  '#000000',
  '#0000aa',
  '#00aa00',
  '#00aaaa',
  '#aa0000',
  '#aa00aa',
  '#aa5500',
  '#aaaaaa',
  '#555555',
  '#5555ff',
  '#55ff55',
  '#55ffff',
  '#ff5555',
  '#ff55ff',
  '#ffff55',
  '#ffffff',
];

/** 4-bit RGBI 8-color palette with blinking bit. */
export const Cga8ColorPalette: Palette = [
  '#000000',
  '#0000aa',
  '#00aa00',
  '#00aaaa',
  '#aa0000',
  '#aa00aa',
  '#aa5500',
  '#aaaaaa',
  {color: '#000000', blink: true},
  {color: '#0000aa', blink: true},
  {color: '#00aa00', blink: true},
  {color: '#00aaaa', blink: true},
  {color: '#aa0000', blink: true},
  {color: '#aa00aa', blink: true},
  {color: '#aa5500', blink: true},
  {color: '#aaaaaa', blink: true},
];

export const CgaModes: Array<ModeInfo> = [
  // BIOS modes 0 & 1
  {
    isGraphicsMode: false,
    numFgColors: 16,
    numBgColors: 8,
    textFormat: {
      cols: 40,
      rows: 25,
    },
    resolution: {
      width: 320,
      height: 200,
    },
    characterSize: {height: 8, width: 8},
    numPages: 8,
  },
  // BIOS modes 2 & 3
  {
    isGraphicsMode: false,
    numFgColors: 16,
    numBgColors: 8,
    textFormat: {
      cols: 80,
      rows: 25,
    },
    resolution: {
      width: 640,
      height: 200,
    },
    characterSize: {height: 8, width: 8},
    numPages: 4,
  },
  // BIOS mode 4
  {
    isGraphicsMode: true,
    numFgColors: 4,
    numBgColors: 16,
    textFormat: {
      cols: 40,
      rows: 25,
    },
    resolution: {
      width: 320,
      height: 200,
    },
    characterSize: {height: 8, width: 8},
    numPages: 1,
  },
  // BIOS mode 6
  {
    isGraphicsMode: true,
    numFgColors: 1,
    numBgColors: 1,
    textFormat: {
      cols: 80,
      rows: 25,
    },
    resolution: {
      width: 640,
      height: 200,
    },
    characterSize: {height: 8, width: 8},
    numPages: 1,
  },
];

/** Basic type of a video mode. */
export enum VideoModeType {
  /** Only supports text, no graphics. */
  TEXT = 'text',
  /** Supports text and graphics. */
  TEXT_AND_GRAPHICS = 'textAndGraphics',
}

/** Base class for video mode implementations. */
export abstract class VideoMode {
  /** Type of this video mode. */
  abstract readonly type: VideoModeType;
  /** Text format. */
  abstract readonly textFormat: TextFormat;
  /** Graphics resolution. */
  abstract readonly resolution: Resolution;
  /** Number of screen pages. */
  abstract readonly numPages: number;

  /** Draw a text character at (x, y). */
  setChar(x: number, y: number, ch: string | number) {}
  /** Draw a pixel at (x, y). */
  setPixel(x: number, y: number, color: number) {}

  /** Render currently visible page to array of HTML hex color values. */
  abstract render(): Array<Array<string>>;

  /** Currently active page. */
  protected activePage: number = 0;
  /** Currently visible page. */
  protected visiblePage: number = 0;
  /** Buffer storing the ASCII value of the character at [page][y][x]. */
  protected textBuffer: Array<Array<Array<number>>> = [];
  /** Pixel buffer storing the color value at [page][y][x]. */
  protected pixelBuffer: Array<Array<Array<number>>> = [];
}
