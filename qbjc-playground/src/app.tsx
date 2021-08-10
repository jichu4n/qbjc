import '@fontsource/cascadia-mono';
import AppBar from '@material-ui/core/AppBar';
import CircularProgress from '@material-ui/core/CircularProgress';
import blue from '@material-ui/core/colors/blue';
import CssBaseline from '@material-ui/core/CssBaseline';
import Fab from '@material-ui/core/Fab';
import IconButton from '@material-ui/core/IconButton';
import {
  createMuiTheme,
  ThemeProvider,
  useTheme,
} from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import GitHubIcon from '@material-ui/icons/GitHub';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import SettingsIcon from '@material-ui/icons/Settings';
import StopIcon from '@material-ui/icons/Stop';
import {observer} from 'mobx-react';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import Split from 'react-split';
import './app.css';
import Editor from './editor';
import MessagesPane from './messages-pane';
import OutputScreenPane from './output-screen-pane';
import QbjcManager from './qbjc-manager';
import SettingsDialog from './settings-dialog';
import './split.css';

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

const SPLIT_GUTTER_SIZE = 6;

function SplashScreen({isReady}: {isReady: boolean}) {
  enum Status {
    VISIBLE = 'visible',
    TRANSITIONING = 'transitioning',
    HIDDEN = 'hidden',
  }
  const TRANSITION_DELAY_MS = 600;
  const [status, setStatus] = useState<Status>(Status.VISIBLE);
  const theme = useTheme();

  useEffect(() => {
    if (isReady && status === Status.VISIBLE) {
      setStatus(Status.TRANSITIONING);
      setTimeout(() => setStatus(Status.HIDDEN), TRANSITION_DELAY_MS);
    }
  }, [isReady, status, Status]);

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        zIndex: 200,
        backgroundColor: theme.palette.background.paper,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transition: `opacity ${TRANSITION_DELAY_MS}ms`,
        ...(status === Status.VISIBLE
          ? {
              opacity: 1,
            }
          : {}),
        ...(status === Status.TRANSITIONING
          ? {
              opacity: 0,
            }
          : {}),
        ...(status === Status.HIDDEN
          ? {
              display: 'none',
            }
          : {}),
      }}
    >
      <CircularProgress />
    </div>
  );
}

function Header({isReady}: {isReady: boolean}) {
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  return (
    <>
      <AppBar position="relative" color="default">
        <Toolbar>
          <Typography variant="h6" style={{flexGrow: 1}}>
            qbjc Playground
          </Typography>
          {isReady && (
            <Tooltip title="Settings">
              <IconButton
                aria-label="Edit settings"
                color="inherit"
                onClick={() => setIsSettingsDialogOpen(true)}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          )}
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
  const [dimensions, setDimensions] = useState<{
    horizontalSplit?: Array<number>;
    rightVerticalSplit?: Array<number>;
  } | null>({});

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <SplashScreen isReady={qbjcManager.isReady} />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: '100%',
          backgroundColor: darkTheme.palette.background.default,
        }}
      >
        <Header isReady={qbjcManager.isReady} />
        <Split
          minSize={300}
          sizes={[50, 50]}
          onDragEnd={(sizes: Array<number>) => {
            setDimensions({
              ...dimensions,
              horizontalSplit: sizes,
            });
          }}
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexGrow: 1,
            marginTop: 5,
          }}
          gutterSize={SPLIT_GUTTER_SIZE}
        >
          <div style={{position: 'relative'}}>
            <Editor
              onReady={(editor) => qbjcManager.init({editor})}
              style={{
                width: '100%',
                height: '100%',
                // @ts-ignore
                overflow: 'overlay',
              }}
            />
            <RunFab qbjcManager={qbjcManager} />
          </div>
          <Split
            direction="vertical"
            sizes={[80, 20]}
            minSize={100}
            expandToMin={true}
            onDragEnd={(sizes: Array<number>) => {
              setDimensions({
                ...dimensions,
                rightVerticalSplit: sizes,
              });
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
            gutterSize={SPLIT_GUTTER_SIZE}
          >
            <OutputScreenPane
              onReady={(terminal) => qbjcManager.init({terminal})}
              dimensions={dimensions}
              isRunning={qbjcManager.isRunning}
            />
            <MessagesPane
              qbjcManager={qbjcManager}
              onLocClick={useCallback(
                (loc) => qbjcManager.goToMessageLocInEditor(loc),
                [qbjcManager]
              )}
            />
          </Split>
        </Split>
      </div>
    </ThemeProvider>
  );
});

export default App;
