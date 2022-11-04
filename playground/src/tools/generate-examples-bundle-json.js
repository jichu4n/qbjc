/** @file Script to generate example data bundle (example-bundle.json). */
const fs = require('fs-extra');
const path = require('path');

if (require.main === module) {
  (async () => {
    const rootDirPath = path.join(__dirname, '..', '..');
    const examplesJsonFilePath = path.join(rootDirPath, 'src', 'examples.json');
    const outputExamplesBundleFilePath = path.join(
      rootDirPath,
      'src',
      'examples-bundle.json'
    );
    console.log(`> ${examplesJsonFilePath}`);
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
    console.log(`=> ${outputExamplesBundleFilePath}`);
    await fs.writeJson(outputExamplesBundleFilePath, exampleList);
  })();
}
