import AppBar from '@material-ui/core/AppBar';
import Fab from '@material-ui/core/Fab';
import IconButton from '@material-ui/core/IconButton';
import {createMuiTheme, ThemeProvider} from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import GitHubIcon from '@material-ui/icons/GitHub';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import {Ace} from 'ace-builds';
import React, {useCallback, useRef} from 'react';
import {Terminal} from 'xterm';
import './app.css';
import Editor from './editor';
import QbjcManager from './qbjc-manager';
import Screen from './screen';

const darkTheme = createMuiTheme({
  palette: {
    type: 'dark',
  },
});

function Header() {
  return (
    <AppBar position="relative" color="default">
      <Toolbar>
        <Typography variant="h6" style={{flexGrow: 1}}>
          qbjc Playground
        </Typography>
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
  );
}

function App() {
  const editorRef = useRef<Ace.Editor | null>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const qbjcManagerRef = useRef<QbjcManager | null>(null);

  return (
    <ThemeProvider theme={darkTheme}>
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
              onInit={useCallback((editor) => (editorRef.current = editor), [])}
              style={{width: '100%', height: '100%'}}
            />
            <Fab
              onClick={useCallback(async () => {
                const {current: editor} = editorRef;
                const {current: terminal} = terminalRef;
                const {current: qbjcManager} = qbjcManagerRef;
                if (!qbjcManager || !editor || !terminal) {
                  return;
                }
                terminal.focus();
                await qbjcManager.compileAndRun(editor.getValue());
              }, [])}
              color="primary"
              style={{
                position: 'absolute',
                right: '2rem',
                bottom: '2rem',
                zIndex: 10,
              }}
            >
              <PlayArrowIcon />
            </Fab>
          </div>
          <Screen
            onInit={(terminal) => {
              terminalRef.current = terminal;
              qbjcManagerRef.current = new QbjcManager(terminal);
            }}
            style={{width: '50%', height: '100%'}}
          />
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
