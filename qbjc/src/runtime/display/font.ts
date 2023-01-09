/** Metadata for an embedded font. */
export interface FontInfo {
  /** Font name, internal to qbjc. */
  name: string;
  /** Width of a glyph in pixels. */
  width: number;
  /** Height of a glyph in pixels. */
  height: number;
}

/** Matrix representing a single glyph in an embedded font.
 *
 * Each element [y][x] specifies whether the pixel at (x, y) should be set to0
 * background color (0) or foreground color (1).
 */
export type Glyph = Array<Array<0 | 1>>;

/** Embedded font data.
 *
 * The length is always 256. Each element [ch] stores the glyph matrix for that
 * ASCII value.
 */
export type Glyphs = Array<Glyph>;

/** An embedded font. */
export interface Font extends FontInfo {
  /** The glyphs in the font. */
  glyphs: Glyphs;
}
