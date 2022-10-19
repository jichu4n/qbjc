import AppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import {useTheme} from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import FolderIcon from '@mui/icons-material/Folder';
import GitHubIcon from '@mui/icons-material/GitHub';
import HelpIcon from '@mui/icons-material/Help';
import LaunchIcon from '@mui/icons-material/Launch';
import SaveIcon from '@mui/icons-material/Save';
import SettingsIcon from '@mui/icons-material/Settings';
import {saveAs} from 'file-saver';
import React, {useCallback, useState} from 'react';
import EditorController from './editor-controller';
import HelpDialog from './help-dialog';
import OpenDialog from './open-dialog';
import SettingsDialog from './settings-dialog';

function AppHeader({
  isReady,
  editorController,
  sourceFileName,
  onChangeSourceFileName,
}: {
  isReady: boolean;
  editorController: EditorController | null;
  sourceFileName: string;
  onChangeSourceFileName: (sourceFileName: string) => void;
}) {
  const onSaveClick = useCallback(() => {
    if (!isReady || !editorController) {
      return;
    }
    const blob = new Blob([editorController.getText()], {
      type: 'text/plain;charset=utf-8',
    });
    saveAs(blob, sourceFileName);
  }, [isReady, editorController, sourceFileName]);

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
        <Toolbar
          style={{
            paddingRight: theme.spacing(1),
          }}
        >
          <Typography variant="h6" style={{flexGrow: 1}}>
            qbjc
          </Typography>
          {isReady && (
            <>
              <Tooltip title="Open program">
                <IconButton
                  aria-label="Open program"
                  color="inherit"
                  onClick={showOpenDialog}
                  size="large"
                >
                  <FolderIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Save program">
                <IconButton
                  aria-label="Save program"
                  color="inherit"
                  onClick={onSaveClick}
                  size="large"
                >
                  <SaveIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Settings">
                <IconButton
                  aria-label="Edit settings"
                  color="inherit"
                  onClick={showSettingsDialog}
                  size="large"
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
              size="large"
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
              size="large"
            >
              <GitHubIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <OpenDialog
        isOpen={isOpenDialogOpen}
        onClose={hideOpenDialog}
        editorController={editorController}
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
