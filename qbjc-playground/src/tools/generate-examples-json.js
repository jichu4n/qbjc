/** @file Script to update file contents in examples.json. */
const fs = require('fs-extra');
const path = require('path');

if (require.main === module) {
  (async () => {
    const rootDirPath = path.join(__dirname, '..', '..');
    const examplesJsonFilePath = path.join(rootDirPath, 'src', 'examples.json');
    console.log(`Updating ${examplesJsonFilePath}`);
    const exampleMetaList = await fs.readJson(examplesJsonFilePath);
    const exampleList = await Promise.all(
      exampleMetaList.map(async (exampleMeta) => {
        const exampleFilePath = path.join(
          rootDirPath,
          'examples',
          exampleMeta.fileName
        );
        console.log(`> ${exampleFilePath}`);
        return {
          ...exampleMeta,
          content: await fs.readFile(exampleFilePath, 'utf-8'),
        };
      })
    );
    await fs.writeJson(examplesJsonFilePath, exampleList, {spaces: 2});
  })();
}
