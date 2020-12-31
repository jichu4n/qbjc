import {lookupSymbols} from '../lib/symbol-table';
import {
  areMatchingElementaryTypes,
  arraySpec,
  DataTypeSpec,
  doubleSpec,
  integerSpec,
  isArray,
  longSpec,
  stringSpec,
} from '../lib/types';
import {Ptr} from './compiled-code';
import QbArray from './qb-array';
import Runtime, {RuntimePlatform} from './runtime';

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
    name: 'chr$',
    paramTypeSpecs: [longSpec()],
    returnTypeSpec: stringSpec(),
    async run(n: number) {
      return (String.fromCodePoint ?? String.fromCharCode)(Math.floor(n));
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
      return haystack.indexOf(needle, Math.floor(start) - 1) + 1;
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
      return s.substr(0, Math.floor(n));
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
      return s.substr(Math.floor(startIdx) - 1, Math.floor(length));
    },
  },
  {
    name: 'right$',
    paramTypeSpecs: [stringSpec(), longSpec()],
    returnTypeSpec: stringSpec(),
    async run(s: string, n: number) {
      return s.substr(Math.max(0, s.length - Math.floor(n)));
    },
  },
  {
    name: 'rnd',
    paramTypeSpecs: [],
    returnTypeSpec: doubleSpec(),
    async run() {
      return Math.random();
    },
  },
  {
    name: 'rtrim$',
    paramTypeSpecs: [stringSpec()],
    returnTypeSpec: stringSpec(),
    async run(s: string, {args}: RunContext) {
      return s.trimEnd();
    },
  },
  {
    name: 'space$',
    paramTypeSpecs: [longSpec()],
    returnTypeSpec: stringSpec(),
    async run(n: number) {
      return ' '.repeat(Math.floor(n));
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
    async run() {
      // TODO
      return '';
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
      const result = Math.floor((now.getTime() - midnight.getTime()) / 1000);
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
      name: 'randomize',
      async run() {},
    },
    [[], [longSpec()]]
  ),
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
      name: 'locate',
      async run(...args: Array<any>) {
        const {platform} = args.pop() as RunContext;
        const [row, column, cursor] = args;
        if (Number.isFinite(row) && Number.isFinite(column)) {
          await platform.moveCursorTo(
            Math.floor(column) - 1,
            Math.floor(row) - 1
          );
        } else {
          // TODO
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
