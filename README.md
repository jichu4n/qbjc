![build](https://github.com/jichu4n/qbjc/workflows/build/badge.svg)

# qbjc

**qbjc** is a QBasic to JavaScript compiler. It compiles a QBasic program into a JavaScript module
that can run directly as a standalone program:

![Compiling and running a simple program](./docs/assets/hello.gif)

## Usage

```bash
# Install from NPM
npm install -g qbjc
# Compile hello.bas and write output to hello.bas.js
qbjc hello.bas
# ...or run hello.bas directly:
qbjc --run hello.bas
```

## Compatibility

What works:

- Core language features
  - Control flow structures - loops, conditionals, `GOTO`, `GOSUB` etc.
  - Data types - primitive types, arrays and user-defined types (a.k.a. records)
  - Expressions - arithmetic, string, comparison, boolean
  - Built-in functions like `VAL`, `STR$`, `INSTR`, `MID$` - see [full list](./src/runtime/builtins.ts)
  - `SUB`s and `FUNCTION`s
  - `DATA` constants
- Text mode
  - Basic text I/O - `PRINT`, `INPUT`, `INKEY$`, `INPUT$` etc.
  - Text mode screen manipulation - `COLOR`, `LOCATE` etc.
  - Note that the current implementation requires a VT100-compatible terminal emulator. On Windows,
    this means using WSL or something like PuTTY.

It's just enough to run the original [`NIBBLES.BAS` game](./examples/nibbles.bas) that shipped with QBasic:

![Compiling and running NIBBLES.BAS](./docs/assets/nibbles.gif)

See [examples](./examples) and [tests](./src/tests/testdata/compile-and-run) for an idea of what is
currently possible.

What doesn't work (yet):

- Running in the browser
- Graphics and audio
- Events - `ON ERROR`, `ON TIMER` etc.
- OS APIs like files I/O, `CALL INTERRUPT` etc.
- Direct memory access - `PEEK`, `POKE` etc.
- Less common syntax, inputs or options for statements and built-in functions
- ...and a lot more - contributions are welcome!

## Command line options

```
Usage: qbjc [options] <file.bas>

Options:
  -V, --version        output the version number
  -o, --output <file>  output file path
  -r, --run            run the compiled program after compilation
  --minify             minify the compiled program
  --source-map         enable source map generation
  --no-bundle          disable bundling with runtime code
  --debug-ast          enable generation of AST file for debugging compilation
  --debug-trace        enable stack trace for debugging compilation
  -h, --help           display help for command
```

## About

qbjc is distributed under the Apache License v2.
