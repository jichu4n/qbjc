/** @file Script to generate Monaco themes bundle (monaco-themes-bundle.json). */
const fs = require('fs-extra');
const path = require('path');

if (require.main === module) {
  (async () => {
    const themeListJsonPath = require.resolve(
      'monaco-themes/themes/themelist.json'
    );
    const themeDirPath = path.dirname(themeListJsonPath);
    const rootDirPath = path.join(__dirname, '..', '..');
    const outputThemesBundleFilePath = path.join(
      rootDirPath,
      'src',
      'monaco-themes-bundle.json'
    );

    console.log(`> ${themeListJsonPath}`);
    const themeList = await fs.readJson(themeListJsonPath);
    const themeBundle = {};
    for (const [themeKey, themeName] of Object.entries(themeList)) {
      const themeFilePath = path.join(themeDirPath, `${themeName}.json`);
      console.log(`> ${themeFilePath}`);
      themeBundle[themeKey] = {
        name: themeName,
        data: await fs.readJson(themeFilePath),
      };
    }

    console.log(`=> ${outputThemesBundleFilePath}`);
    await fs.writeJson(outputThemesBundleFilePath, themeBundle);
  })();
}
