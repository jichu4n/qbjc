import Platform from './platform';

export default class NodePlatform implements Platform {
  writeStdout(s: string) {
    process.stdout.write(s);
  }
}
