import '@fontsource/cascadia-mono';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import blue from '@material-ui/core/colors/blue';
import CssBaseline from '@material-ui/core/CssBaseline';
import {createTheme, ThemeProvider} from '@material-ui/core/styles';
import {observer} from 'mobx-react';
import React, {useCallback, useRef, useState} from 'react';
import Split from 'react-split';
import AppHeader from './app-header';
import AppSplashScreen from './app-splash-screen';
import './app.css';
import Editor from './editor';
import MessagesPane from './messages-pane';
import OutputScreenPane from './output-screen-pane';
import QbjcManager from './qbjc-manager';
import RunFab from './run-fab';
import './split.css';

const darkTheme = createTheme({
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
      <AppSplashScreen isReady={qbjcManager.isReady} />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: '100%',
          backgroundColor: darkTheme.palette.background.default,
        }}
      >
        <AppHeader isReady={qbjcManager.isReady} />
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
