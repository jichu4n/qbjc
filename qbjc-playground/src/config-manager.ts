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
  EDITOR_FONT_FAMILY = 'v1/editorFontFamily',
  EDITOR_FONT_SIZE = 'v1/editorFontSize',
  EDITOR_THEME = 'v1/editorTheme',
  EDITOR_KEYBINDINGS = 'v1/editorKeybindings',
  SCREEN_FONT_FAMILY = 'v1/outputScreenFontFamily',
  SCREEN_FONT_SIZE = 'v1/outputScreenFontSize',
  SCREEN_LETTER_SPACING = 'v1/outputScreenLetterSpacing',
  SCREEN_LINE_HEIGHT = 'v1/outputScreenLineHeight',
  EXECUTION_DELAY = 'v1/executionDelayUs',
}

export const DEFAULT_SOURCE_FILE_NAME = 'source.bas';

const DEFAULT_CONFIG = {
  [ConfigKey.SOURCE_FILES]: [{name: DEFAULT_SOURCE_FILE_NAME, content: ''}],
  [ConfigKey.CURRENT_SOURCE_FILE_NAME]: DEFAULT_SOURCE_FILE_NAME,
  [ConfigKey.EDITOR_FONT_FAMILY]: 'Cascadia Mono',
  [ConfigKey.EDITOR_FONT_SIZE]: 14,
  [ConfigKey.EDITOR_THEME]: 'nord_dark',
  [ConfigKey.EDITOR_KEYBINDINGS]: '',
  [ConfigKey.SCREEN_FONT_FAMILY]: 'Cascadia Mono',
  [ConfigKey.SCREEN_FONT_SIZE]: 14,
  [ConfigKey.SCREEN_LETTER_SPACING]: 0,
  [ConfigKey.SCREEN_LINE_HEIGHT]: 1.0,
  [ConfigKey.EXECUTION_DELAY]: 0,
};

export const EDITOR_THEME_GROUPS = [
  {label: 'Light themes', value: 'light'},
  {label: 'Dark themes', value: 'dark'},
];

export const EDITOR_THEMES = [
  {label: 'Ambiance', value: 'ambiance', group: 'dark'},
  {label: 'Chaos', value: 'chaos', group: 'dark'},
  {label: 'Chrome', value: 'chrome', group: 'light'},
  {label: 'Clouds', value: 'clouds', group: 'light'},
  {label: 'Clouds midnight', value: 'clouds_midnight', group: 'dark'},
  {label: 'Cobalt', value: 'cobalt', group: 'dark'},
  {label: 'Crimson Editor', value: 'crimson_editor', group: 'light'},
  {label: 'Dawn', value: 'dawn', group: 'light'},
  {label: 'Dracula', value: 'dracula', group: 'dark'},
  {label: 'Dreamweaver', value: 'dreamweaver', group: 'light'},
  {label: 'Eclipse', value: 'eclipse', group: 'light'},
  {label: 'Github', value: 'github', group: 'light'},
  {label: 'Gob', value: 'gob', group: 'dark'},
  {label: 'Gruvbox', value: 'gruvbox', group: 'dark'},
  {label: 'Idle Fingers', value: 'idle_fingers', group: 'dark'},
  {label: 'Iplastic', value: 'iplastic', group: 'light'},
  {label: 'Katzenmilch', value: 'katzenmilch', group: 'light'},
  {label: 'KR Theme', value: 'kr_theme', group: 'dark'},
  {label: 'Kuroir', value: 'kuroir', group: 'light'},
  {label: 'Merbivore', value: 'merbivore', group: 'dark'},
  {label: 'Merbivore Soft', value: 'merbivore_soft', group: 'dark'},
  {label: 'Mono Industrial', value: 'mono_industrial', group: 'dark'},
  {label: 'Monokai', value: 'monokai', group: 'dark'},
  {label: 'Nord Dark', value: 'nord_dark', group: 'dark'},
  {label: 'Pastel On Dark', value: 'pastel_on_dark', group: 'dark'},
  {label: 'Solarized Dark', value: 'solarized_dark', group: 'dark'},
  {label: 'Solarized Light', value: 'solarized_light', group: 'light'},
  {label: 'SQL Server', value: 'sqlserver', group: 'light'},
  {label: 'Terminal', value: 'terminal', group: 'dark'},
  {label: 'Textmate', value: 'textmate', group: 'light'},
  {label: 'Tomorrow', value: 'tomorrow', group: 'light'},
  {label: 'Tomorrow Night Blue', value: 'tomorrow_night_blue', group: 'dark'},
  {
    label: 'Tomorrow Night Bright',
    value: 'tomorrow_night_bright',
    group: 'dark',
  },
  {
    label: 'Tomorrow Night Eighties',
    value: 'tomorrow_night_eighties',
    group: 'dark',
  },
  {label: 'Tomorrow Night', value: 'tomorrow_night', group: 'dark'},
  {label: 'Twilight', value: 'twilight', group: 'dark'},
  {label: 'Vibrant Ink', value: 'vibrant_ink', group: 'dark'},
  {label: 'Xcode', value: 'xcode', group: 'light'},
];

export const EDITOR_KEYBINDINGS = [
  {label: 'Default', value: ''},
  {label: 'Vim', value: 'vim'},
  {label: 'Emacs', value: 'emacs'},
  {label: 'Sublime Text', value: 'sublime'},
  {label: 'Visual Studio Code', value: 'vscode'},
];

class ConfigManager {
  config = DEFAULT_CONFIG;

  constructor() {
    makeObservable(this, {
      config: observable,
      setKey: action,
      load: action,
      sourceFiles: computed,
      currentSourceFile: computed,
      setSourceFileName: action,
      setSourceFileContent: action,
    });

    this.load();

    reaction(
      () => toJS(this.config),
      () => this.save()
    );
  }

  getKey(key: ConfigKey): any {
    return this.config[key];
  }

  setKey(key: ConfigKey, value: any) {
    (this.config as {[key: string]: any})[key] = value;
  }

  save() {
    for (const key of Object.values(ConfigKey)) {
      const defaultValue = JSON.stringify(DEFAULT_CONFIG[key]);
      const currentValue = JSON.stringify(this.config[key]);
      if (currentValue === defaultValue) {
        localStorage.removeItem(key);
      } else {
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
        this.setKey(key, value);
      }
    }

    // Ensure current source file is sane.
    if (!this.currentSourceFile) {
      this.sourceFiles.push({
        name: this.getKey(ConfigKey.CURRENT_SOURCE_FILE_NAME),
        content: '',
      });
    }

    console.log(`Loaded config:`, toJS(this.config));
  }

  get sourceFiles(): Array<SourceFile> {
    return this.getKey(ConfigKey.SOURCE_FILES);
  }

  get currentSourceFile(): SourceFile {
    return _.find(this.sourceFiles, [
      'name',
      this.getKey(ConfigKey.CURRENT_SOURCE_FILE_NAME),
    ])!;
  }

  setSourceFileName(sourceFile: SourceFile, newSourceFileName: string) {
    sourceFile.name = newSourceFileName;
  }

  setSourceFileContent(sourceFile: SourceFile, newContent: string) {
    sourceFile.content = newContent;
  }
}

const configManager = new ConfigManager();
export default configManager;
