import _ from 'lodash';
import {
  action,
  computed,
  makeObservable,
  observable,
  reaction,
  toJS,
} from 'mobx';

export interface SourceFile {
  name: string;
  content: string;
}

export enum ConfigKey {
  SOURCE_FILES = 'v1/sourceFiles',
  CURRENT_SOURCE_FILE_NAME = 'v1/currentSourceFileName',
}

const DEFAULT_CONFIG = {
  [ConfigKey.SOURCE_FILES]: [{name: 'default', content: ''}],
  [ConfigKey.CURRENT_SOURCE_FILE_NAME]: 'default',
};

class ConfigManager {
  config = DEFAULT_CONFIG;

  constructor() {
    makeObservable(this, {
      config: observable,
      load: action,
      sourceFiles: computed,
      currentSourceFile: computed,
      updateCurrentSourceFileContent: action,
    });

    this.load();

    reaction(
      () => toJS(this.config),
      () => this.save()
    );
  }

  save() {
    for (const key of Object.values(ConfigKey)) {
      const defaultValue = JSON.stringify(DEFAULT_CONFIG[key]);
      const currentValue = JSON.stringify(this.config[key]);
      if (currentValue !== defaultValue) {
        localStorage.setItem(key, currentValue);
      }
    }
  }

  load() {
    if (typeof localStorage === 'undefined') {
      console.warn(`localStorage not available`);
      return;
    }
    for (const key of Object.values(ConfigKey)) {
      const rawValue = localStorage.getItem(key);
      if (rawValue) {
        let value: any;
        try {
          value = JSON.parse(rawValue);
        } catch (e) {
          console.warn(`Failed to parse value for key "${key}": "${rawValue}"`);
          continue;
        }
        Object.assign(this.config, {[key]: value});
      }
    }

    // Ensure current source file is sane.
    if (!this.currentSourceFile) {
      this.sourceFiles.push({
        name: this.config[ConfigKey.CURRENT_SOURCE_FILE_NAME],
        content: '',
      });
    }

    console.log(`Loaded config:`, toJS(this.config));
  }

  get sourceFiles(): Array<SourceFile> {
    return this.config[ConfigKey.SOURCE_FILES];
  }

  get currentSourceFile(): SourceFile {
    return _.find(this.sourceFiles, [
      'name',
      this.config[ConfigKey.CURRENT_SOURCE_FILE_NAME],
    ])!;
  }

  updateCurrentSourceFileContent(newContent: string) {
    this.currentSourceFile.content = newContent;
  }
}

const configManager = new ConfigManager();
export default configManager;
