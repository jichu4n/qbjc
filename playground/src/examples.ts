export interface ExampleSpec {
  fileName: string;
  title: string;
  description: string;
  content: string;
}

// To update / add examples, update examples.json manually. The build process
// runs tools/generate-examples.json to update the file contents based on the
// files in the examples directory.
const EXAMPLE_SPECS: Array<ExampleSpec> = require('./examples.json');
export default EXAMPLE_SPECS;

export const DEFAULT_EXAMPLE = EXAMPLE_SPECS[0];
