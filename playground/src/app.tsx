import '@fontsource/cascadia-mono';
import AppBar from '@material-ui/core/AppBar';
import Fab from '@material-ui/core/Fab';
import IconButton from '@material-ui/core/IconButton';
import {createMuiTheme, ThemeProvider} from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import GitHubIcon from '@material-ui/icons/GitHub';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import SettingsIcon from '@material-ui/icons/Settings';
import StopIcon from '@material-ui/icons/Stop';
import {observer} from 'mobx-react';
import React, {useCallback, useRef, useState} from 'react';
import './app.css';
import Editor from './editor';
import MessagesView from './messages-view';
import QbjcManager from './qbjc-manager';
import Screen from './screen';
import SettingsDialog from './settings-dialog';
import CssBaseline from '@material-ui/core/CssBaseline';
import blue from '@material-ui/core/colors/blue';

const darkTheme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      light: blue[300],
      main: blue[400],
      dark: blue[700],
      contrastText: 'white',
    },
  },
});

function Header() {
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  return (
    <>
      <AppBar position="relative" color="default">
        <Toolbar>
          <Typography variant="h6" style={{flexGrow: 1}}>
            qbjc Playground
          </Typography>
          <Tooltip title="Settings">
            <IconButton
              aria-label="Edit settings"
              color="inherit"
              onClick={() => setIsSettingsDialogOpen(true)}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="View project on GitHub">
            <IconButton
              aria-label="View project on GitHub"
              color="inherit"
              href="https://github.com/jichu4n/qbjc"
            >
              <GitHubIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <SettingsDialog
        isOpen={isSettingsDialogOpen}
        onClose={() => setIsSettingsDialogOpen(false)}
      />
    </>
  );
}

const RunFab = observer(({qbjcManager}: {qbjcManager: QbjcManager}) => {
  const isRunning = qbjcManager.isRunning;
  return (
    <Fab
      onClick={useCallback(async () => {
        if (isRunning) {
          qbjcManager.stop();
        } else {
          await qbjcManager.run();
        }
      }, [qbjcManager, isRunning])}
      color={isRunning ? 'secondary' : 'primary'}
      style={{
        position: 'absolute',
        right: '2rem',
        bottom: '2rem',
        zIndex: 10,
      }}
    >
      {isRunning ? <StopIcon /> : <PlayArrowIcon />}
    </Fab>
  );
});

const App = observer(() => {
  const qbjcManagerRef = useRef<QbjcManager>(new QbjcManager());
  const qbjcManager = qbjcManagerRef.current;

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: '100%',
          backgroundColor: darkTheme.palette.background.default,
        }}
      >
        <Header />
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexGrow: 1,
            marginTop: 2,
          }}
        >
          <div style={{position: 'relative', width: '50%', height: '100%'}}>
            <Editor
              onReady={(editor) => (qbjcManager.editor = editor)}
              style={{width: '100%', height: '100%'}}
            />
            <RunFab qbjcManager={qbjcManager} />
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '50%',
              height: '100%',
            }}
          >
            <Screen
              onReady={(terminal) => (qbjcManager.terminal = terminal)}
              style={{width: '100%', flexGrow: 1}}
            />
            <MessagesView
              messages={qbjcManager.messages}
              onLocClick={useCallback(
                (loc) => qbjcManager.goToMessageLocInEditor(loc),
                [qbjcManager]
              )}
              style={{height: '10rem'}}
            />
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
});

export default App;
