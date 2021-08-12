export interface ExampleSpec {
  fileName: string;
  title: string;
  description: string;
  content: string;
}

const EXAMPLE_SPECS: Array<ExampleSpec> = [
  {
    fileName: 'nibbles.bas',
    title: 'NIBBLES.BAS',
    description: 'Classic snake game',
  },
  {
    fileName: 'cal.bas',
    title: 'CAL.BAS',
    description: 'Prints a formatted calendar',
  },
].map((spec) => ({
  ...spec,
  content: require(`!!raw-loader!../examples/${spec.fileName}`).default,
}));

export default EXAMPLE_SPECS;
