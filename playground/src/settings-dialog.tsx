import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import Radio from '@material-ui/core/Radio';
import Slider from '@material-ui/core/Slider';
import {useTheme} from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import _ from 'lodash';
import {observer} from 'mobx-react';
import React, {useCallback, useRef, useState, useEffect} from 'react';
import configManager, {
  ConfigKey,
  EDITOR_THEMES,
  EDITOR_THEME_GROUPS,
} from './config-manager';

const SETTING_EDITOR_INPUT_WIDTH = 300;

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
      <DialogContent>
        <TextField
          autoFocus={true}
          required={true}
          fullWidth={true}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{width: SETTING_EDITOR_INPUT_WIDTH}}
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
      <DialogContent>
        <Slider
          value={value}
          onChange={(e, value) => setValue(value as number)}
          min={min}
          max={max}
          step={step}
          marks={true}
          valueLabelDisplay="on"
          style={{width: SETTING_EDITOR_INPUT_WIDTH, marginTop: 40}}
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
  groups: Array<{label: string; value: string}>;
  choices: Array<{label: string; value: string; group?: string}>;
}) {
  const theme = useTheme();
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
      <List
        subheader={<li />}
        style={{
          overflowY: 'auto',
          maxHeight: 400,
          backgroundColor: theme.palette.background.paper,
        }}
        ref={(node) => {
          listRef.current = node;
          scrollToSelectedListItem();
        }}
      >
        {(groups || [null]).map((group) => (
          <li key={group?.value} style={{backgroundColor: 'inherit'}}>
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
    const isFullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const [isEditorFontDialogOpen, setIsEditorFontDialogOpen] = useState(false);
    const [
      isEditorFontSizeDialogOpen,
      setIsEditorFontSizeDialogOpen,
    ] = useState(false);
    const [isEditorThemeDialogOpen, setIsEditorThemeDialogOpen] = useState(
      false
    );

    const [isScreenFontDialogOpen, setIsScreenFontDialogOpen] = useState(false);
    const [
      isScreenFontSizeDialogOpen,
      setIsScreenFontSizeDialogOpen,
    ] = useState(false);
    const [
      isScreenLetterSpacingDialogOpen,
      setIsScreenLetterSpacingDialogOpen,
    ] = useState(false);

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
          <List
            subheader={<li />}
            style={{
              overflowY: 'auto',
              maxHeight: 400,
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <li style={{backgroundColor: 'inherit'}}>
              <ul style={{padding: 0, backgroundColor: 'inherit'}}>
                <ListSubheader color="primary">Editor</ListSubheader>
                <ListItem
                  button={true}
                  onClick={() => setIsEditorThemeDialogOpen(true)}
                >
                  <ListItemText
                    primary="Theme"
                    secondary={
                      _.find(EDITOR_THEMES, [
                        'value',
                        configManager.getKey(ConfigKey.EDITOR_THEME),
                      ])?.label
                    }
                  />
                </ListItem>
                <ListItem
                  button={true}
                  onClick={() => setIsEditorFontDialogOpen(true)}
                >
                  <ListItemText
                    primary="Font"
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
                    primary="Font size"
                    secondary={configManager.getKey(ConfigKey.EDITOR_FONT_SIZE)}
                  />
                </ListItem>
              </ul>
            </li>
            <li style={{backgroundColor: 'inherit'}}>
              <ul style={{padding: 0, backgroundColor: 'inherit'}}>
                <ListSubheader color="primary">Output screen</ListSubheader>
                <ListItem
                  button={true}
                  onClick={() => setIsScreenFontDialogOpen(true)}
                >
                  <ListItemText
                    primary="Font"
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
                    primary="Font size"
                    secondary={configManager.getKey(ConfigKey.SCREEN_FONT_SIZE)}
                  />
                </ListItem>
                <ListItem
                  button={true}
                  onClick={() => setIsScreenLetterSpacingDialogOpen(true)}
                >
                  <ListItemText
                    primary="Letter spacing"
                    secondary={configManager.getKey(ConfigKey.SCREEN_LETTER_SPACING)}
                  />
                </ListItem>
              </ul>
            </li>
          </List>
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
      </>
    );
  }
);

export default SettingsDialog;
