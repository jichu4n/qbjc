import * as monaco from 'monaco-editor';
import '..';
import './styles.css';

enum LocalStorageKeys {
  CONTENT = 'content',
  THEME = 'theme',
}

async function loadThemes() {
  const themeList = await (await fetch('/themes/themelist.json')).json();
  const themeData = Object.fromEntries(
    await Promise.all(
      Object.entries(themeList).map(async ([themeKey, themeName]) => [
        themeKey,
        await (await fetch(`/themes/${themeName}.json`)).json(),
      ])
    )
  ) as {[key: string]: monaco.editor.IStandaloneThemeData};

  const themeSelect = document.getElementById(
    'themeSelect'
  ) as HTMLSelectElement;
  for (const [themeKey, themeJson] of Object.entries(themeData)) {
    monaco.editor.defineTheme(themeKey, themeJson);
    const themeOption = document.createElement('option');
    themeOption.value = themeKey;
    themeOption.text = themeList[themeKey];
    themeSelect.add(themeOption);
  }
  const initialTheme =
    localStorage.getItem(LocalStorageKeys.THEME) || 'vs-dark';
  monaco.editor.setTheme(initialTheme);
  themeSelect.value = initialTheme;
  themeSelect.style.visibility = 'visible';

  themeSelect.addEventListener('change', () => {
    const themeKey = themeSelect.value;
    monaco.editor.setTheme(themeKey);
    localStorage.setItem(LocalStorageKeys.THEME, themeKey);
  });
}

async function loadInitialContent() {
  let initialContent = localStorage.getItem(LocalStorageKeys.CONTENT);
  if (!initialContent) {
    initialContent = await (await fetch('/examples/nibbles.bas')).text();
  }
  return initialContent;
}

async function setupEditor() {
  const editor = monaco.editor.create(document.getElementById('editor')!, {
    value: await loadInitialContent(),
    language: 'qb',
    minimap: {enabled: false},
    scrollBeyondLastLine: false,
  });
  const editorModel = editor.getModel()!;

  editorModel.onDidChangeContent(() => {
    localStorage.setItem(LocalStorageKeys.CONTENT, editorModel.getValue());
  });
}

(async () => {
  await loadThemes();
  await setupEditor();
})();
