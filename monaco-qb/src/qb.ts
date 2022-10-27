import {languages} from 'monaco-editor';
import {Keywords} from 'qbjc/dist/parser/lexer';

export const languageId = 'qb';

export const languageExtensionPoint: languages.ILanguageExtensionPoint = {
  id: languageId,
  extensions: ['.bas'],
  aliases: ['QBasic', 'QuickBASIC', 'qb'],
};

export const languageConfiguration: languages.LanguageConfiguration = {
  comments: {
    lineComment: "'",
  },
  brackets: [
    ['[', ']'],
    ['(', ')'],
    ['def', 'end def'],
    ['function', 'end function'],
    ['if', 'end if'],
    ['select', 'end select'],
    ['sub', 'end sub'],
    ['type', 'end type'],
  ],
  autoClosingPairs: [
    {open: '[', close: ']', notIn: ['string', 'comment']},
    {open: '(', close: ')', notIn: ['string', 'comment']},
    {open: '"', close: '"', notIn: ['string', 'comment']},
  ],
};

export const language: languages.IMonarchLanguage = {
  ignoreCase: true,
  brackets: [
    {token: 'delimiter.array', open: '[', close: ']'},
    {token: 'delimiter.parenthesis', open: '(', close: ')'},

    {token: 'keyword.tag-def', open: 'def', close: 'end def'},
    {token: 'keyword.tag-function', open: 'function', close: 'end function'},
    {token: 'keyword.tag-if', open: 'if', close: 'end if'},
    {token: 'keyword.tag-select', open: 'select', close: 'end select'},
    {token: 'keyword.tag-sub', open: 'sub', close: 'end sub'},
    {token: 'keyword.tag-type', open: 'type', close: 'end type'},

    {token: 'keyword.tag-do', open: 'do', close: 'loop'},
    {token: 'keyword.tag-for', open: 'for', close: 'next'},
  ],
  keywords: Object.values(Keywords),
  tagwords: [
    'def',
    'function',
    'if',
    'select',
    'sub',
    'do',
    'loop',
    'for',
    'next',
  ],
  tokenizer: {
    root: [
      {include: '@whitespace'},

      // End tags
      [/next(?!\w)/, {token: 'keyword.tag-for'}],
      [/loop(?!\w)/, {token: 'keyword.tag-do'}],
      [
        /end\s+(?!for|do)(def|function|if|select|sub|type)/,
        {token: 'keyword.tag-$1'},
      ],

      // identifiers, tagwords, and keywords
      [
        /[a-zA-Z_]\w*/,
        {
          cases: {
            '@tagwords': {token: 'keyword.tag-$0'},
            '@keywords': {token: 'keyword.$0'},
            '@default': 'identifier',
          },
        },
      ],
    ],

    whitespace: [
      [/[ \t\r\n]+/, ''],
      [/(\'|REM(?!\w)).*$/, 'comment'],
    ],
  },
};

export function setupLanguage() {
  languages.register(languageExtensionPoint);
  languages.onLanguage(languageId, () => {
    languages.setLanguageConfiguration(languageId, languageConfiguration);
    languages.setMonarchTokensProvider(languageId, language);
  });
}
