import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import {Theme, useTheme} from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import BlockIcon from '@mui/icons-material/Block';
import ErrorIcon from '@mui/icons-material/Error';
import PlayCircleIcon from '@mui/icons-material/PlayCircleFilled';
import CodeBracesBoxIcon from 'mdi-material-ui/CodeBracesBox';
import MessageTextIcon from 'mdi-material-ui/MessageText';
import {runInAction} from 'mobx';
import {observer} from 'mobx-react';
import {CompileResult, Loc} from 'qbjc';
import React, {useCallback, useEffect, useRef} from 'react';
import PaneHeader from './pane-header';
import {QbjcMessage, QbjcMessageType} from './qbjc-manager';

function getMessageDisplayProps(theme: Theme, messageType: QbjcMessageType) {
  const MESSAGE_DISPLAY_PROPS = {
    [QbjcMessageType.ERROR]: {
      iconClass: ErrorIcon,
      color: theme.palette.warning.dark,
    },
    [QbjcMessageType.INFO]: {
      iconClass: null,
      color: theme.palette.text.secondary,
    },
    [QbjcMessageType.EXECUTION]: {
      iconClass: PlayCircleIcon,
      color: theme.palette.text.secondary,
    },
  };
  return MESSAGE_DISPLAY_PROPS[messageType];
}

const MessagesPane = observer(
  ({
    messages,
    onLocClick,
    onShowCompileResultClick,
    style = {},
  }: {
    messages: Array<QbjcMessage>;
    onLocClick: (loc: Loc) => void;
    onShowCompileResultClick: (compileResult: CompileResult) => void;
    style?: React.CSSProperties;
  }) => {
    const theme = useTheme();

    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const isScrolledToBottomRef = useRef<boolean>(true);
    const prevNumMessagesRef = useRef<number>(0);

    useEffect(() => {
      const {current: scrollContainerEl} = scrollContainerRef;
      const {current: prevNumMessages} = prevNumMessagesRef;
      const {current: isScrolledToBottom} = isScrolledToBottomRef;
      const numMessages = messages.length;
      if (!scrollContainerEl || numMessages === prevNumMessages) {
        return;
      }
      if (isScrolledToBottom) {
        scrollContainerEl.scrollTop = scrollContainerEl.scrollHeight;
      }
      prevNumMessagesRef.current = numMessages;
    });

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          ...style,
        }}
      >
        <PaneHeader
          title="Messages"
          icon={
            <MessageTextIcon
              style={{
                fontSize: theme.typography.overline.fontSize,
              }}
            />
          }
        >
          <Tooltip title="Clear messages">
            <IconButton
              onClick={() =>
                runInAction(() => {
                  messages.length = 0;
                })
              }
              size="large"
            >
              <BlockIcon
                style={{
                  fontSize: theme.typography.overline.fontSize,
                  color: theme.palette.text.secondary,
                }}
              />
            </IconButton>
          </Tooltip>
        </PaneHeader>
        <div
          ref={scrollContainerRef}
          style={{
            // This magic combo of flexGrow, height: 0, and overflowY makes this div take up the
            // full height in the parent but prevents it from growing to accomodate the list
            // content. ¯\_(ツ)_/¯
            flexGrow: 1,
            height: 0,
            // @ts-ignore
            overflowY: 'overlay',
          }}
          onScroll={useCallback(() => {
            const {current: scrollContainerEl} = scrollContainerRef;
            if (!scrollContainerEl) {
              return;
            }
            isScrolledToBottomRef.current =
              scrollContainerEl.scrollHeight -
                scrollContainerEl.scrollTop -
                scrollContainerEl.clientHeight <
              1;
          }, [])}
        >
          <List dense={true} disablePadding={true}>
            {messages.map(({loc, message, type, compileResult}, idx) => {
              const {iconClass: Icon, color} = getMessageDisplayProps(
                theme,
                type
              );
              let iconElement: React.ReactNode = null;
              if (Icon) {
                iconElement = (
                  <Icon
                    htmlColor={color}
                    style={{fontSize: theme.typography.body2.fontSize}}
                  />
                );
              }
              return (
                <ListItem
                  key={idx}
                  button={true}
                  divider={true}
                  style={{paddingTop: 0, paddingBottom: 0}}
                  onClick={() => (loc ? onLocClick(loc) : null)}
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
                      color,
                      marginTop: 3,
                      marginBottom: 3,
                      marginLeft: -28,
                    }}
                  />
                  {compileResult && (
                    <ListItemSecondaryAction style={{marginRight: -6}}>
                      <Tooltip title="View compiled JavaScript code">
                        <Button
                          startIcon={
                            <CodeBracesBoxIcon
                              style={{
                                fontSize: theme.typography.overline.fontSize,
                                color: theme.palette.text.secondary,
                                marginRight: -2,
                              }}
                            />
                          }
                          onClick={() =>
                            onShowCompileResultClick(compileResult)
                          }
                          style={{
                            marginRight: -2,
                            color,
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.6rem',
                              marginTop: '0.2rem',
                            }}
                          >
                            Compiled code
                          </span>
                        </Button>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
              );
            })}
          </List>
        </div>
      </div>
    );
  }
);

export default MessagesPane;
