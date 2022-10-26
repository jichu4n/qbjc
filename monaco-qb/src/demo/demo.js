require.config({paths: {vs: monacoRootUrl}});
require(['vs/editor/editor.main'], async () => {
  const localStorageKeys = {
    CONTENT: 'content',
  };
  let content = localStorage.getItem(localStorageKeys.CONTENT);
  if (!content) {
    content = await (await fetch('/nibbles.bas')).text();
  }
  const editor = monaco.editor.create(document.getElementById('container'), {
    value: content,
    language: 'vb',
    theme: 'vs-dark',
    minimap: {enabled: false},
  });
  editor.getModel().onDidChangeContent(() => {
    localStorage.setItem(
      localStorageKeys.CONTENT,
      editor.getModel().getValue()
    );
  });
});
