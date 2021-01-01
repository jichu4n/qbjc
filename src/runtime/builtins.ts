import {lookupSymbols} from '../lib/symbol-table';
import {
  areMatchingElementaryTypes,
  arraySpec,
  DataTypeSpec,
  doubleSpec,
  integerSpec,
  isArray,
  longSpec,
  singleSpec,
  stringSpec,
} from '../lib/types';
import {Ptr} from './compiled-code';
import QbArray from './qb-array';
import Runtime, {RuntimePlatform} from './runtime';
import legacyEncoding from 'legacy-encoding';
import roundHalfToEven from '../lib/round-half-to-even';

type RunFn = (...args: Array<any>) => Promise<any>;

/** Built-in function definition. */
export interface BuiltinProc {
  name: string;
  paramTypeSpecs: Array<DataTypeSpec>;
  run: RunFn;
}

/** Invocation context for built-in procs.
 *
 * The invocation context is passed to the run() function as the final argument.
 */
export interface RunContext {
  /** Handle to a Runtime instance. */
  runtime: Runtime;
  /** Handle to a RuntimePlatform instance. */
  platform: RuntimePlatform;
  /** DataTypeSpecs of the arguments. */
  argTypeSpecs: Array<DataTypeSpec>;
  /** Pointers to the underlying argument variables. */
  args: Array<Ptr>;
}

export interface BuiltinFn extends BuiltinProc {
  returnTypeSpec: DataTypeSpec;
}

export interface BuiltinSub extends BuiltinProc {}

/** Built-in functions. */
export const BUILTIN_FNS: Array<BuiltinFn> = [
  {
    name: 'abs',
    paramTypeSpecs: [doubleSpec()],
    returnTypeSpec: doubleSpec(),
    async run(n: number) {
      return Math.abs(n);
    },
  },
  {
    name: 'asc',
    paramTypeSpecs: [stringSpec()],
    returnTypeSpec: longSpec(),
    async run(s: string) {
      if (s.length === 0) {
        throw new Error('Expected non-empty string in ASC()');
      }
      return legacyEncoding.encode(s[0], 'cp437')[0];
    },
  },
  {
    name: 'chr$',
    paramTypeSpecs: [longSpec()],
    returnTypeSpec: stringSpec(),
    async run(n: number) {
      return legacyEncoding.decode(Buffer.from([n]), 'cp437');
    },
  },
  {
    name: 'cdbl',
    paramTypeSpecs: [doubleSpec()],
    returnTypeSpec: doubleSpec(),
    async run(n: number) {
      return n;
    },
  },
  {
    name: 'cint',
    paramTypeSpecs: [doubleSpec()],
    returnTypeSpec: longSpec(),
    async run(n: number) {
      return roundHalfToEven(n);
    },
  },
  {
    name: 'clng',
    paramTypeSpecs: [doubleSpec()],
    returnTypeSpec: longSpec(),
    async run(n: number) {
      return roundHalfToEven(n);
    },
  },
  {
    name: 'cos',
    paramTypeSpecs: [doubleSpec()],
    returnTypeSpec: doubleSpec(),
    async run(n: number) {
      return Math.cos(n);
    },
  },
  {
    name: 'csng',
    paramTypeSpecs: [doubleSpec()],
    returnTypeSpec: singleSpec(),
    async run(n: number) {
      return n;
    },
  },
  {
    name: 'csrlin',
    paramTypeSpecs: [],
    returnTypeSpec: longSpec(),
    async run({platform}: RunContext) {
      return (await platform.getCursorPosition()).y + 1;
    },
  },
  {
    name: 'fix',
    paramTypeSpecs: [doubleSpec()],
    returnTypeSpec: longSpec(),
    async run(n: number) {
      return Math.sign(n) * Math.floor(Math.abs(n));
    },
  },
  {
    name: 'inkey$',
    paramTypeSpecs: [],
    returnTypeSpec: stringSpec(),
    async run({platform}: RunContext) {
      const c = await platform.getChar();
      return c ?? '';
    },
  },
  {
    name: 'input$',
    paramTypeSpecs: [longSpec()],
    returnTypeSpec: stringSpec(),
    async run(n: number, {platform}: RunContext) {
      const result: Array<string> = [];
      while (result.length < n) {
        const c = await platform.getChar();
        if (c) {
          result.push(c);
        }
      }
      return result.join('');
    },
  },
  {
    name: 'instr',
    paramTypeSpecs: [stringSpec(), stringSpec()],
    returnTypeSpec: longSpec(),
    async run(haystack: string, needle: string) {
      return haystack.indexOf(needle) + 1;
    },
  },
  {
    name: 'instr',
    paramTypeSpecs: [longSpec(), stringSpec(), stringSpec()],
    returnTypeSpec: integerSpec(),
    async run(start: number, haystack: string, needle: string) {
      return haystack.indexOf(needle, start - 1) + 1;
    },
  },
  {
    name: 'int',
    paramTypeSpecs: [doubleSpec()],
    returnTypeSpec: longSpec(),
    async run(n: number) {
      return Math.floor(n);
    },
  },
  {
    name: 'lbound',
    paramTypeSpecs: [arraySpec(doubleSpec(), [])],
    returnTypeSpec: longSpec(),
    async run(array: QbArray) {
      return array.typeSpec.dimensionSpecs[0][0];
    },
  },
  {
    name: 'lbound',
    paramTypeSpecs: [arraySpec(doubleSpec(), []), longSpec()],
    returnTypeSpec: longSpec(),
    async run(array: QbArray, dimensionIdx: number) {
      if (
        dimensionIdx < 1 ||
        dimensionIdx > array.typeSpec.dimensionSpecs.length
      ) {
        throw new Error(`Invalid dimension index: ${dimensionIdx}`);
      }
      return array.typeSpec.dimensionSpecs[dimensionIdx - 1][0];
    },
  },
  {
    name: 'lcase$',
    paramTypeSpecs: [stringSpec()],
    returnTypeSpec: stringSpec(),
    async run(s: string) {
      return s.toLowerCase();
    },
  },
  {
    name: 'left$',
    paramTypeSpecs: [stringSpec(), longSpec()],
    returnTypeSpec: stringSpec(),
    async run(s: string, n: number) {
      return s.substr(0, n);
    },
  },
  {
    name: 'len',
    paramTypeSpecs: [stringSpec()],
    returnTypeSpec: longSpec(),
    async run(s: string) {
      return s.length;
    },
  },
  {
    name: 'ltrim$',
    paramTypeSpecs: [stringSpec()],
    returnTypeSpec: stringSpec(),
    async run(s: string) {
      return s.trimStart();
    },
  },
  {
    name: 'mid$',
    paramTypeSpecs: [stringSpec(), longSpec(), longSpec()],
    returnTypeSpec: stringSpec(),
    async run(s: string, startIdx: number, length: number) {
      return s.substr(startIdx - 1, length);
    },
  },
  {
    name: 'peek',
    paramTypeSpecs: [longSpec()],
    returnTypeSpec: longSpec(),
    async run() {
      // STUB
      return 0;
    },
  },
  {
    name: 'pos',
    paramTypeSpecs: [longSpec()],
    returnTypeSpec: longSpec(),
    async run(_, {platform}: RunContext) {
      return (await platform.getCursorPosition()).x + 1;
    },
  },
  {
    name: 'right$',
    paramTypeSpecs: [stringSpec(), longSpec()],
    returnTypeSpec: stringSpec(),
    async run(s: string, n: number) {
      return s.substr(Math.max(0, s.length - n));
    },
  },
  ...overload<BuiltinFn>(
    {
      name: 'rnd',
      returnTypeSpec: doubleSpec(),
      async run() {
        return Math.random();
      },
    },
    [[], [longSpec()]]
  ),
  {
    name: 'rtrim$',
    paramTypeSpecs: [stringSpec()],
    returnTypeSpec: stringSpec(),
    async run(s: string, {args}: RunContext) {
      return s.trimEnd();
    },
  },
  {
    name: 'sgn',
    paramTypeSpecs: [doubleSpec()],
    returnTypeSpec: longSpec(),
    async run(n: number) {
      return Math.sign(n);
    },
  },
  {
    name: 'sin',
    paramTypeSpecs: [doubleSpec()],
    returnTypeSpec: doubleSpec(),
    async run(n: number) {
      return Math.sin(n);
    },
  },
  {
    name: 'spc',
    paramTypeSpecs: [longSpec()],
    returnTypeSpec: stringSpec(),
    async run(n: number) {
      return ' '.repeat(n);
    },
  },
  {
    name: 'space$',
    paramTypeSpecs: [longSpec()],
    returnTypeSpec: stringSpec(),
    async run(n: number) {
      return ' '.repeat(n);
    },
  },
  {
    name: 'sqr',
    paramTypeSpecs: [doubleSpec()],
    returnTypeSpec: doubleSpec(),
    async run(n: number) {
      return Math.sqrt(n);
    },
  },
  {
    name: 'str$',
    paramTypeSpecs: [doubleSpec()],
    returnTypeSpec: stringSpec(),
    async run(n: number) {
      return `${n >= 0 ? ' ' : ''}${n}`;
    },
  },
  {
    name: 'tab',
    paramTypeSpecs: [longSpec()],
    returnTypeSpec: stringSpec(),
    async run(col: number, {platform}: RunContext) {
      const {x, y} = await platform.getCursorPosition();
      const {cols} = await platform.getScreenSize();
      col = (Math.max(1, col) - 1) % cols;
      await platform.moveCursorTo(col, x <= col ? y : y + 1);
      return '';
    },
  },
  {
    name: 'tan',
    paramTypeSpecs: [doubleSpec()],
    returnTypeSpec: doubleSpec(),
    async run(n: number) {
      return Math.tan(n);
    },
  },
  {
    name: 'timer',
    paramTypeSpecs: [],
    returnTypeSpec: longSpec(),
    async run() {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(0, 0, 0, 0);
      const result = (now.getTime() - midnight.getTime()) / 1000;
      return result;
    },
  },
  {
    name: 'val',
    paramTypeSpecs: [stringSpec()],
    returnTypeSpec: doubleSpec(),
    async run(s: string) {
      const v = parseFloat(s);
      return isNaN(v) ? 0 : v;
    },
  },
  {
    name: 'ubound',
    paramTypeSpecs: [arraySpec(doubleSpec(), [])],
    returnTypeSpec: longSpec(),
    async run(array: QbArray) {
      return array.typeSpec.dimensionSpecs[0][1];
    },
  },
  {
    name: 'ubound',
    paramTypeSpecs: [arraySpec(doubleSpec(), []), longSpec()],
    returnTypeSpec: longSpec(),
    async run(array: QbArray, dimensionIdx: number) {
      if (
        dimensionIdx < 1 ||
        dimensionIdx > array.typeSpec.dimensionSpecs.length
      ) {
        throw new Error(`Invalid dimension index: ${dimensionIdx}`);
      }
      return array.typeSpec.dimensionSpecs[dimensionIdx - 1][1];
    },
  },
  {
    name: 'ucase$',
    paramTypeSpecs: [stringSpec()],
    returnTypeSpec: stringSpec(),
    async run(s: string) {
      return s.toUpperCase();
    },
  },
];

/** Simple statements implemented as built-in subs. */
export const BUILTIN_SUBS: Array<BuiltinSub> = [
  ...overload(
    {
      name: 'cls',
      async run(...args: Array<any>) {
        const {platform} = args.pop() as RunContext;
        await platform.clearScreen();
      },
    },
    [[], [longSpec()]]
  ),
  ...overload(
    {
      name: 'color',
      async run(...args: Array<any>) {
        const {platform, runtime} = args.pop() as RunContext;
        const getColorName = (n: number) => {
          if (n < 0 || n >= runtime.currentScreenModeConfig.colorMap.length) {
            throw new Error(`Invalid color: ${n}`);
          }
          return runtime.currentScreenModeConfig.colorMap[n];
        };
        const [fg, bg] = args;
        if (Number.isFinite(fg)) {
          platform.setFgColor(getColorName(fg));
        }
        if (Number.isFinite(bg)) {
          platform.setBgColor(getColorName(bg));
        }
      },
    },
    [
      [longSpec()],
      [longSpec(), longSpec()],
      [longSpec(), longSpec(), longSpec()],
    ]
  ),
  ...overload(
    {
      name: '__def_seg',
      async run() {
        // STUB
      },
    },
    [[], [longSpec()]]
  ),
  ...overload(
    {
      name: 'locate',
      async run(...args: Array<any>) {
        const {platform} = args.pop() as RunContext;
        const [row, col, cursor] = args;
        if (Number.isFinite(row) && Number.isFinite(col)) {
          await platform.moveCursorTo(col - 1, row - 1);
        } else if (Number.isFinite(row) || Number.isFinite(col)) {
          const origPos = await platform.getCursorPosition();
          const newX = Number.isFinite(col) ? col - 1 : origPos.x;
          const newY = Number.isFinite(row) ? row - 1 : origPos.y;
          if (newX !== origPos.x || newY !== origPos.y) {
            await platform.moveCursorTo(newX, newY);
          }
        }
        if (Number.isFinite(cursor)) {
          await platform.setCursorVisibility(!!cursor);
        }
      },
    },
    [
      [longSpec()],
      [longSpec(), longSpec()],
      [longSpec(), longSpec(), longSpec()],
      [longSpec(), longSpec(), longSpec(), longSpec()],
      [longSpec(), longSpec(), longSpec(), longSpec(), longSpec()],
    ]
  ),
  {
    name: 'play',
    paramTypeSpecs: [stringSpec()],
    async run() {
      // STUB
    },
  },
  {
    name: 'poke',
    paramTypeSpecs: [longSpec(), longSpec()],
    async run() {
      // STUB
    },
  },
  ...overload(
    {
      name: 'randomize',
      async run() {
        // STUB
      },
    },
    [[], [longSpec()]]
  ),
  ...overload(
    {
      name: 'screen',
      async run(mode: number, ...args: Array<any>) {
        const {runtime} = args.pop() as RunContext;
        runtime.setScreenMode(mode);
      },
    },
    [
      [longSpec()],
      [longSpec(), longSpec()],
      [longSpec(), longSpec(), longSpec()],
      [longSpec(), longSpec(), longSpec(), longSpec()],
    ]
  ),
  ...overload(
    {
      name: '__view_print',
      async run() {
        // STUB
      },
    },
    [[], [longSpec(), longSpec()]]
  ),
  {
    name: 'width',
    paramTypeSpecs: [longSpec(), longSpec()],
    async run() {
      // STUB
    },
  },
];

/** Helper function to generate multiple signatures that map to the same built-in proc. */
function overload<T extends BuiltinProc>(
  proc: Omit<T, 'paramTypeSpecs'>,
  paramTypeSpecsList: Array<Array<DataTypeSpec>>
): Array<T> {
  return paramTypeSpecsList.map(
    (paramTypeSpecs) =>
      ({
        ...proc,
        paramTypeSpecs,
      } as T)
  );
}

export function lookupBuiltin<T extends BuiltinProc>(
  procs: Array<T>,
  name: string,
  argTypeSpecs: Array<DataTypeSpec>,
  {
    shouldReturnIfArgTypeMismatch,
  }: {
    shouldReturnIfArgTypeMismatch?: boolean;
  } = {}
): T | null {
  const builtinFnsMatchingName = lookupSymbols(procs, name);
  const builtinFn = builtinFnsMatchingName.find(
    ({paramTypeSpecs}) =>
      paramTypeSpecs.length === argTypeSpecs.length &&
      paramTypeSpecs.every(
        (paramTypeSpec, i) =>
          areMatchingElementaryTypes(paramTypeSpec, argTypeSpecs[i]) ||
          (isArray(paramTypeSpec) && isArray(argTypeSpecs[i]))
      )
  );
  return (
    builtinFn ??
    (shouldReturnIfArgTypeMismatch && builtinFnsMatchingName.length > 0
      ? builtinFnsMatchingName[0]
      : null)
  );
}