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
    description: 'Perpetual calendar program',
  },
  {
    fileName: 'check.bas',
    title: 'CHECK.BAS',
    description: 'Checkbook-balancing program',
  },
  {
    fileName: 'strtonum.bas',
    title: 'STRTONUM.BAS',
    description: 'Converts a string to a number',
  },
].map((spec) => ({
  ...spec,
  content: require(`!!raw-loader!../examples/${spec.fileName}`).default,
}));

export default EXAMPLE_SPECS;
