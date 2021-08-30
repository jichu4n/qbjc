import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import {useTheme} from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import FolderIcon from '@material-ui/icons/Folder';
import GitHubIcon from '@material-ui/icons/GitHub';
import HelpIcon from '@material-ui/icons/Help';
import LaunchIcon from '@material-ui/icons/Launch';
import SaveIcon from '@material-ui/icons/Save';
import SettingsIcon from '@material-ui/icons/Settings';
import {Ace} from 'ace-builds';
import {saveAs} from 'file-saver';
import React, {useCallback, useState} from 'react';
import HelpDialog from './help-dialog';
import OpenDialog from './open-dialog';
import SettingsDialog from './settings-dialog';

function AppHeader({
  isReady,
  editor,
  sourceFileName,
  onChangeSourceFileName,
}: {
  isReady: boolean;
  editor: Ace.Editor | null;
  sourceFileName: string;
  onChangeSourceFileName: (sourceFileName: string) => void;
}) {
  const onSaveClick = useCallback(() => {
    if (!isReady || !editor) {
      return;
    }
    const blob = new Blob([editor.getValue()], {
      type: 'text/plain;charset=utf-8',
    });
    saveAs(blob, sourceFileName);
  }, [isReady, editor, sourceFileName]);

  const theme = useTheme();

  const [isOpenDialogOpen, setIsOpenDialogOpen] = useState(false);
  const showOpenDialog = useCallback(() => setIsOpenDialogOpen(true), []);
  const hideOpenDialog = useCallback(() => setIsOpenDialogOpen(false), []);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const showSettingsDialog = useCallback(
    () => setIsSettingsDialogOpen(true),
    []
  );
  const hideSettingsDialog = useCallback(
    () => setIsSettingsDialogOpen(false),
    []
  );
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);
  const showHelpDialog = useCallback(() => setIsHelpDialogOpen(true), []);
  const hideHelpDialog = useCallback(() => setIsHelpDialogOpen(false), []);

  return (
    <>
      <AppBar position="relative" color="default">
        <Toolbar>
          <Typography variant="h6" style={{flexGrow: 1}}>
            qbjc playground
          </Typography>
          {isReady && (
            <>
              <Tooltip title="Open program">
                <IconButton
                  aria-label="Open program"
                  color="inherit"
                  onClick={showOpenDialog}
                >
                  <FolderIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Save program">
                <IconButton
                  aria-label="Save program"
                  color="inherit"
                  onClick={onSaveClick}
                >
                  <SaveIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Settings">
                <IconButton
                  aria-label="Edit settings"
                  color="inherit"
                  onClick={showSettingsDialog}
                >
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
          <Tooltip title="Help">
            <IconButton
              aria-label="Help"
              color="inherit"
              onClick={showHelpDialog}
            >
              <HelpIcon />
            </IconButton>
          </Tooltip>
          <Tooltip
            title={
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                View on GitHub
                <LaunchIcon
                  style={{
                    fontSize: theme.typography.overline.fontSize,
                    marginLeft: '0.1rem',
                  }}
                />
              </div>
            }
          >
            <IconButton
              aria-label="View on GitHub"
              color="inherit"
              href="https://github.com/jichu4n/qbjc"
              target="_blank"
            >
              <GitHubIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <OpenDialog
        isOpen={isOpenDialogOpen}
        onClose={hideOpenDialog}
        editor={editor}
        onChangeSourceFileName={onChangeSourceFileName}
      />
      <SettingsDialog
        isOpen={isSettingsDialogOpen}
        onClose={hideSettingsDialog}
      />
      <HelpDialog isOpen={isHelpDialogOpen} onClose={hideHelpDialog} />
    </>
  );
}

export default AppHeader;
