# monaco-qb

QBasic / QuickBASIC syntax highlighting for the Monaco editor.

## Usage

Install from NPM:

```
npm install monaco-qb
```

To enable QBasic / QuickBASIC mode in Monaco, simply import the `monaco-qb`
package and specify `qb` as the language when creating an editor instance:

```ts
import * as monaco from 'monaco-editor';
import 'monaco-qb';

const editor = monaco.editor.create(document.getElementById('editor')!, {
  value: '',
  language: 'qb',
  // ...
});
```

Alternatively, you can import and set up monaco-qb lazily:

```ts
import {setupLanguage} from 'monaco-qb/qb';
// This will register the 'qb' language with Monaco.
setupLanguage();
```

## Examples

For a basic example of monaco-qb usage, see
[`src/demo`](https://github.com/jichu4n/qbjc/blob/master/monaco-qb/src/demo/).

For a live example, please check out the qbjc playground
([👉 **qbjc.dev** 👈](https://qbjc.dev))
which allows you to edit and run QBasic / QuickBASIC programs directly in the
browser.
