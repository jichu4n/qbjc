import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Radio from '@mui/material/Radio';
import Slider from '@mui/material/Slider';
import {useTheme} from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import useMediaQuery from '@mui/material/useMediaQuery';
import _ from 'lodash';
import FileDocumentEditIcon from 'mdi-material-ui/FileDocumentEdit';
import HammerWrenchIcon from 'mdi-material-ui/HammerWrench';
import MonitorIcon from 'mdi-material-ui/Monitor';
import {observer} from 'mobx-react';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import configManager, {
  ConfigKey,
  EDITOR_KEYBINDINGS,
  EDITOR_THEMES,
  EDITOR_THEME_GROUPS,
} from './config-manager';

const SETTING_EDITOR_INPUT_WIDTH = 400;

function TextSettingEditorDialog({
  configKey,
  title,
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  configKey: ConfigKey;
}) {
  const [value, setValue] = useState(configManager.getKey(configKey) as string);
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers={true}>
        <TextField
          autoFocus={true}
          required={true}
          fullWidth={true}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{width: SETTING_EDITOR_INPUT_WIDTH, maxWidth: '100%'}}
          InputProps={{style: {fontSize: '0.9rem'}}}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button
          onClick={useCallback(() => {
            configManager.setKey(configKey, value.trim());
            onClose();
          }, [configKey, value, onClose])}
          disabled={!value.trim()}
          color="primary"
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function SliderSettingEditorDialog({
  isOpen,
  onClose,
  title,
  configKey,
  min,
  max,
  step,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  configKey: ConfigKey;
  min: number;
  max: number;
  step: number;
}) {
  const [value, setValue] = useState(configManager.getKey(configKey) as number);
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers={true}>
        <Slider
          value={value}
          onChange={(e, value) => setValue(value as number)}
          min={min}
          max={max}
          step={step}
          marks={true}
          valueLabelDisplay="on"
          style={{
            width: SETTING_EDITOR_INPUT_WIDTH,
            maxWidth: '100%',
            marginTop: 40,
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button
          onClick={useCallback(() => {
            configManager.setKey(configKey, value);
            onClose();
          }, [configKey, value, onClose])}
          color="primary"
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function SingleChoiceSettingEditorDialog({
  isOpen,
  onClose,
  title,
  configKey,
  groups,
  choices,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  configKey: ConfigKey;
  groups?: Array<{label: string; value: string}>;
  choices: Array<{label: string; value: string; group?: string}>;
}) {
  const [value, setValue] = useState(configManager.getKey(configKey) as string);
  const listRef = useRef<HTMLUListElement | null>(null);
  const selectedListItemRef = useRef<HTMLDivElement | null>(null);
  const didScrollToSelectedListItem = useRef(false);

  const scrollToSelectedListItem = useCallback(() => {
    if (!isOpen) {
      didScrollToSelectedListItem.current = false;
      return;
    }
    if (
      !listRef.current ||
      !selectedListItemRef.current ||
      didScrollToSelectedListItem.current
    ) {
      return;
    }
    selectedListItemRef.current.scrollIntoView(true);
    // Scroll up a bit more because the sticky list subheader covers the top of the list viewport.
    const isScrolledToBottom =
      listRef.current.scrollHeight -
        listRef.current.scrollTop -
        listRef.current.clientHeight <
      1;
    if (!isScrolledToBottom) {
      listRef.current.scrollTop -= 150;
    }
    didScrollToSelectedListItem.current = true;
  }, [isOpen]);
  useEffect(scrollToSelectedListItem);

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers={true}>
        <List
          subheader={<li />}
          style={{
            overflowX: 'hidden',
          }}
          ref={(node: HTMLUListElement | null) => {
            listRef.current = node;
            scrollToSelectedListItem();
          }}
        >
          {(groups || [null]).map((group, idx) => (
            <li key={group?.value ?? idx} style={{backgroundColor: 'inherit'}}>
              <ul style={{padding: 0, backgroundColor: 'inherit'}}>
                {group && (
                  <ListSubheader color="primary">{group.label}</ListSubheader>
                )}
                {choices.map((choice) => {
                  if (group && group.value !== choice.group) {
                    return null;
                  }
                  const isSelected = choice.value === value;
                  const onSelect = () => setValue(choice.value);
                  return (
                    <ListItem
                      key={choice.value}
                      selected={isSelected}
                      button={true}
                      onClick={onSelect}
                      style={{width: SETTING_EDITOR_INPUT_WIDTH}}
                      ref={
                        isSelected
                          ? (node) => {
                              selectedListItemRef.current = node;
                              scrollToSelectedListItem();
                            }
                          : null
                      }
                    >
                      <ListItemText
                        primary={choice.label}
                        primaryTypographyProps={{style: {fontSize: '0.9rem'}}}
                      />
                      <ListItemSecondaryAction>
                        <Radio
                          checked={isSelected}
                          onSelect={onSelect}
                          color="primary"
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  );
                })}
              </ul>
            </li>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button
          onClick={useCallback(() => {
            configManager.setKey(configKey, value);
            onClose();
          }, [configKey, value, onClose])}
          color="primary"
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const SettingsDialog = observer(
  ({isOpen, onClose}: {isOpen: boolean; onClose: () => void}) => {
    const theme = useTheme();
    const isFullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const [activeTab, setActiveTab] = useState<
      'editor' | 'outputScreen' | 'execution'
    >('editor');

    const [isEditorFontDialogOpen, setIsEditorFontDialogOpen] = useState(false);
    const [isEditorFontSizeDialogOpen, setIsEditorFontSizeDialogOpen] =
      useState(false);
    const [isEditorThemeDialogOpen, setIsEditorThemeDialogOpen] =
      useState(false);
    const [isEditorKeybindingsDialogOpen, setIsEditorKeybindingsDialogOpen] =
      useState(false);

    const [isScreenFontDialogOpen, setIsScreenFontDialogOpen] = useState(false);
    const [isScreenFontSizeDialogOpen, setIsScreenFontSizeDialogOpen] =
      useState(false);
    const [
      isScreenLetterSpacingDialogOpen,
      setIsScreenLetterSpacingDialogOpen,
    ] = useState(false);
    const [isScreenLineHeightDialogOpen, setIsScreenLineHeightDialogOpen] =
      useState(false);

    const [isExecutionDelayDialogOpen, setIsExecutionDelayDialogOpen] =
      useState(false);

    return (
      <>
        <Dialog
          fullScreen={isFullScreen}
          open={isOpen}
          onClose={onClose}
          fullWidth={true}
          maxWidth="sm"
          scroll="paper"
        >
          <DialogTitle>Settings</DialogTitle>
          <DialogContent dividers={true}>
            <div
              style={{
                display: 'flex',
              }}
            >
              <Tabs
                orientation="vertical"
                variant="scrollable"
                value={activeTab}
                onChange={(event, activeTab) => setActiveTab(activeTab)}
                style={{
                  borderRight: `1px solid ${theme.palette.divider}`,
                }}
                indicatorColor="primary"
                textColor="primary"
              >
                <Tab
                  label="Editor"
                  icon={<FileDocumentEditIcon />}
                  value={'editor'}
                />
                <Tab
                  label="Output"
                  icon={<MonitorIcon />}
                  value={'outputScreen'}
                />
                <Tab
                  label="Execution"
                  icon={<HammerWrenchIcon />}
                  value={'execution'}
                />
              </Tabs>
              <div
                style={{
                  backgroundColor: theme.palette.background.paper,
                  // @ts-ignore
                  overflowY: 'overlay',
                  flex: 1,
                  height: 300,
                  paddingLeft: 20,
                  paddingRight: 20,
                }}
              >
                <List subheader={<li />}>
                  {activeTab === 'editor' && (
                    <>
                      {/* Not yet implemented with Monaco. */}
                      {false && (
                        <ListItem
                          button={true}
                          onClick={() => setIsEditorThemeDialogOpen(true)}
                        >
                          <ListItemText
                            primary="Editor theme"
                            secondary={
                              _.find(EDITOR_THEMES, [
                                'value',
                                configManager.getKey(ConfigKey.EDITOR_THEME),
                              ])?.label
                            }
                          />
                        </ListItem>
                      )}
                      <ListItem
                        button={true}
                        onClick={() => setIsEditorFontDialogOpen(true)}
                      >
                        <ListItemText
                          primary="Editor font"
                          secondary={configManager.getKey(
                            ConfigKey.EDITOR_FONT_FAMILY
                          )}
                        />
                      </ListItem>
                      <ListItem
                        button={true}
                        onClick={() => setIsEditorFontSizeDialogOpen(true)}
                      >
                        <ListItemText
                          primary="Editor font size"
                          secondary={configManager.getKey(
                            ConfigKey.EDITOR_FONT_SIZE
                          )}
                        />{' '}
                      </ListItem>
                      {/* Not yet implemented with Monaco. */}
                      {false && (
                        <ListItem
                          button={true}
                          onClick={() => setIsEditorKeybindingsDialogOpen(true)}
                        >
                          <ListItemText
                            primary="Editor keybindings"
                            secondary={
                              _.find(EDITOR_KEYBINDINGS, [
                                'value',
                                configManager.getKey(
                                  ConfigKey.EDITOR_KEYBINDINGS
                                ),
                              ])?.label
                            }
                          />
                        </ListItem>
                      )}
                    </>
                  )}
                  {activeTab === 'outputScreen' && (
                    <>
                      <ListItem
                        button={true}
                        onClick={() => setIsScreenFontDialogOpen(true)}
                      >
                        <ListItemText
                          primary="Output screen font"
                          secondary={configManager.getKey(
                            ConfigKey.SCREEN_FONT_FAMILY
                          )}
                        />
                      </ListItem>
                      <ListItem
                        button={true}
                        onClick={() => setIsScreenFontSizeDialogOpen(true)}
                      >
                        <ListItemText
                          primary="Output screen font size"
                          secondary={configManager.getKey(
                            ConfigKey.SCREEN_FONT_SIZE
                          )}
                        />
                      </ListItem>
                      <ListItem
                        button={true}
                        onClick={() => setIsScreenLetterSpacingDialogOpen(true)}
                      >
                        <ListItemText
                          primary="Output screen letter spacing"
                          secondary={configManager.getKey(
                            ConfigKey.SCREEN_LETTER_SPACING
                          )}
                        />
                      </ListItem>
                      <ListItem
                        button={true}
                        onClick={() => setIsScreenLineHeightDialogOpen(true)}
                      >
                        <ListItemText
                          primary="Output screen line height"
                          secondary={`${configManager.getKey(
                            ConfigKey.SCREEN_LINE_HEIGHT
                          )}x`}
                        />
                      </ListItem>
                    </>
                  )}
                  {activeTab === 'execution' && (
                    <>
                      <ListItem
                        button={true}
                        onClick={() => setIsExecutionDelayDialogOpen(true)}
                      >
                        <ListItemText
                          primary="Statement execution delay"
                          secondary={`${configManager.getKey(
                            ConfigKey.EXECUTION_DELAY
                          )} μs`}
                        />
                      </ListItem>
                    </>
                  )}
                </List>
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>

        <TextSettingEditorDialog
          isOpen={isEditorFontDialogOpen}
          onClose={() => setIsEditorFontDialogOpen(false)}
          title="Editor font"
          configKey={ConfigKey.EDITOR_FONT_FAMILY}
        />
        <SliderSettingEditorDialog
          isOpen={isEditorFontSizeDialogOpen}
          onClose={() => setIsEditorFontSizeDialogOpen(false)}
          title="Editor font size"
          configKey={ConfigKey.EDITOR_FONT_SIZE}
          min={6}
          max={24}
          step={1}
        />
        <SingleChoiceSettingEditorDialog
          isOpen={isEditorThemeDialogOpen}
          onClose={() => setIsEditorThemeDialogOpen(false)}
          title="Editor theme"
          configKey={ConfigKey.EDITOR_THEME}
          groups={EDITOR_THEME_GROUPS}
          choices={EDITOR_THEMES}
        />
        <SingleChoiceSettingEditorDialog
          isOpen={isEditorKeybindingsDialogOpen}
          onClose={() => setIsEditorKeybindingsDialogOpen(false)}
          title="Editor keybindings"
          configKey={ConfigKey.EDITOR_KEYBINDINGS}
          choices={EDITOR_KEYBINDINGS}
        />

        <TextSettingEditorDialog
          isOpen={isScreenFontDialogOpen}
          onClose={() => setIsScreenFontDialogOpen(false)}
          title="Output screen font"
          configKey={ConfigKey.SCREEN_FONT_FAMILY}
        />
        <SliderSettingEditorDialog
          isOpen={isScreenFontSizeDialogOpen}
          onClose={() => setIsScreenFontSizeDialogOpen(false)}
          title="Output screen font size"
          configKey={ConfigKey.SCREEN_FONT_SIZE}
          min={6}
          max={24}
          step={1}
        />
        <SliderSettingEditorDialog
          isOpen={isScreenLetterSpacingDialogOpen}
          onClose={() => setIsScreenLetterSpacingDialogOpen(false)}
          title="Output screen letter spacing"
          configKey={ConfigKey.SCREEN_LETTER_SPACING}
          min={0}
          max={8}
          step={1}
        />
        <SliderSettingEditorDialog
          isOpen={isScreenLineHeightDialogOpen}
          onClose={() => setIsScreenLineHeightDialogOpen(false)}
          title="Output screen line height"
          configKey={ConfigKey.SCREEN_LINE_HEIGHT}
          min={1.0}
          max={2.0}
          step={0.05}
        />

        <SliderSettingEditorDialog
          isOpen={isExecutionDelayDialogOpen}
          onClose={() => setIsExecutionDelayDialogOpen(false)}
          title="Statement execution delay"
          configKey={ConfigKey.EXECUTION_DELAY}
          min={0}
          max={10}
          step={1}
        />
      </>
    );
  }
);

export default SettingsDialog;
