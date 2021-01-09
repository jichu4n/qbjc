import '@fontsource/cascadia-mono';
import AppBar from '@material-ui/core/AppBar';
import Fab from '@material-ui/core/Fab';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import {createMuiTheme, ThemeProvider} from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import ErrorIcon from '@material-ui/icons/Error';
import GitHubIcon from '@material-ui/icons/GitHub';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PlayCircleIcon from '@material-ui/icons/PlayCircleFilled';
import StopIcon from '@material-ui/icons/Stop';
import {observer} from 'mobx-react';
import React, {useCallback, useEffect, useRef} from 'react';
import './app.css';
import Editor from './editor';
import QbjcManager, {
  QbjcMessageIconType,
  QbjcMessageType,
} from './qbjc-manager';
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

const QBJC_MESSAGE_TYPE_CONFIG = {
  [QbjcMessageType.ERROR]: {
    color: darkTheme.palette.warning.dark,
  },
  [QbjcMessageType.INFO]: {
    color: darkTheme.palette.text.hint,
  },
} as const;

const QBJC_ICON_TYPE_MAP = {
  [QbjcMessageIconType.ERROR]: ErrorIcon,
  [QbjcMessageIconType.PLAY_CIRCLE]: PlayCircleIcon,
} as const;

const QbjcMessages = observer(
  ({
    qbjcManager,
    style = {},
  }: {
    qbjcManager: QbjcManager;
    style?: React.CSSProperties;
  }) => {
    const listRef = useRef<HTMLUListElement | null>(null);
    const isScrolledToBottomRef = useRef<boolean>(true);
    const prevNumMessagesRef = useRef<number>(0);

    useEffect(() => {
      const {current: listEl} = listRef;
      const {current: prevNumMessages} = prevNumMessagesRef;
      const {current: isScrolledToBottom} = isScrolledToBottomRef;
      const numMessages = qbjcManager.messages.length;
      if (!listEl || numMessages === prevNumMessages) {
        return;
      }
      if (isScrolledToBottom) {
        listEl.scrollTop = listEl.scrollHeight;
      }
      prevNumMessagesRef.current = numMessages;
    });

    return (
      <List
        ref={listRef}
        dense={true}
        disablePadding={true}
        style={{
          backgroundColor: darkTheme.palette.background.paper,
          overflowY: 'auto',
          ...style,
        }}
        onScroll={useCallback(() => {
          const {current: listEl} = listRef;
          if (!listEl) {
            return;
          }
          isScrolledToBottomRef.current =
            listEl.scrollHeight - listEl.scrollTop - listEl.clientHeight < 1;
        }, [])}
      >
        {qbjcManager.messages.map(({loc, message, type, iconType}, idx) => {
          let iconElement: React.ReactNode = null;
          if (iconType) {
            const Icon = QBJC_ICON_TYPE_MAP[iconType];
            iconElement = (
              <Icon
                htmlColor={QBJC_MESSAGE_TYPE_CONFIG[type].color}
                style={{fontSize: darkTheme.typography.body2.fontSize}}
              />
            );
          }
          return (
            <ListItem
              key={idx}
              button={true}
              divider={true}
              style={{paddingTop: 0, paddingBottom: 0}}
              onClick={() => qbjcManager.goToMessageLocInEditor({loc})}
            >
              {iconElement && <ListItemIcon>{iconElement}</ListItemIcon>}
              <ListItemText
                primary={message}
                primaryTypographyProps={{
                  variant: 'caption',
                  style: {fontSize: '0.7rem'},
                }}
                inset={!iconElement}
                style={{
                  color: QBJC_MESSAGE_TYPE_CONFIG[type].color,
                  marginTop: 3,
                  marginBottom: 3,
                  marginLeft: -28,
                }}
              />
            </ListItem>
          );
        })}
      </List>
    );
  }
);

const App = observer(() => {
  const qbjcManagerRef = useRef<QbjcManager>(new QbjcManager());
  const qbjcManager = qbjcManagerRef.current;

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
            <QbjcMessages qbjcManager={qbjcManager} style={{height: '10rem'}} />
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
});

export default App;
