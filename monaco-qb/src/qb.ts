import {languages} from 'monaco-editor';

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
};

export const language: languages.IMonarchLanguage = {
  ignoreCase: true,
  tokenizer: {
    root: [
      // whitespace
      {include: '@whitespace'},
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
