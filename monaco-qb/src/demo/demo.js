require.config({paths: {vs: monacoRootUrl}});
require(['vs/editor/editor.main'], async () => {
  const localStorageKeys = {
    CONTENT: 'content',
    THEME: 'theme',
  };

  const themeList = await (
    await fetch(`${monacoThemesRootUrl}/themes/themelist.json`)
  ).json();
  const themeData = Object.fromEntries(
    await Promise.all(
      Object.entries(themeList).map(async ([themeKey, themeName]) => [
        themeKey,
        await (
          await fetch(`${monacoThemesRootUrl}/themes/${themeName}.json`)
        ).json(),
      ])
    )
  );

  const themeSelect = document.getElementById('themeSelect');
  for (const [themeKey, themeJson] of Object.entries(themeData)) {
    monaco.editor.defineTheme(themeKey, themeJson);
    const themeOption = document.createElement('option');
    themeOption.value = themeKey;
    themeOption.text = themeList[themeKey];
    themeSelect.add(themeOption);
  }
  const initialTheme =
    localStorage.getItem(localStorageKeys.THEME) || 'vs-dark';
  monaco.editor.setTheme(initialTheme);
  themeSelect.value = initialTheme;
  themeSelect.style.visibility = 'visible';
  themeSelect.addEventListener('change', (ev) => {
    const themeKey = themeSelect.value;
    monaco.editor.setTheme(themeKey);
    localStorage.setItem(localStorageKeys.THEME, themeKey);
  });

  let initialContent = localStorage.getItem(localStorageKeys.CONTENT);
  if (!initialContent) {
    initialContent = await (await fetch('/src/demo/nibbles.bas')).text();
  }

  const editor = monaco.editor.create(document.getElementById('container'), {
    value: initialContent,
    language: 'vb',
    minimap: {enabled: false},
    scrollBeyondLastLine: false,
  });

  editor.getModel().onDidChangeContent(() => {
    localStorage.setItem(
      localStorageKeys.CONTENT,
      editor.getModel().getValue()
    );
  });
});
