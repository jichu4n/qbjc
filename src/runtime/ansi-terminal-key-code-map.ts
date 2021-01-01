/** Returns a VT100 escape sequence prefixed by "ESC [". */
function ESC(c: string) {
  return `\u001B[${c}`;
}

/** Returns a DOS keyboard scan code prefixed by NUL. */
function NUL(n: number) {
  return String.fromCharCode(0, n);
}

/** Map ANSI / VT100 sequences to DOS keyboard scan codes. */
const ANSI_TERMINAL_KEY_CODE_MAP: {[key: string]: string} = {
  [ESC('A')]: NUL(72), // Up arrow
  [ESC('B')]: NUL(80), // Down arrow
  [ESC('C')]: NUL(77), // Right arrow
  [ESC('D')]: NUL(75), // Left arrow
  // More TODO
};

export default ANSI_TERMINAL_KEY_CODE_MAP;
