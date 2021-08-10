import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import {useTheme} from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import BlockIcon from '@material-ui/icons/Block';
import ErrorIcon from '@material-ui/icons/Error';
import PlayCircleIcon from '@material-ui/icons/PlayCircleFilled';
import {observer} from 'mobx-react';
import {Loc} from 'qbjc';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import PaneHeader from './pane-header';
import QbjcManager, {
  QbjcMessageIconType,
  QbjcMessageType,
} from './qbjc-manager';

const QBJC_ICON_TYPE_MAP = {
  [QbjcMessageIconType.ERROR]: ErrorIcon,
  [QbjcMessageIconType.PLAY_CIRCLE]: PlayCircleIcon,
} as const;

const MessagesPane = observer(
  ({
    qbjcManager,
    onLocClick,
    style = {},
  }: {
    qbjcManager: QbjcManager;
    onLocClick: (loc: Loc) => void;
    style?: React.CSSProperties;
  }) => {
    const theme = useTheme();
    const QBJC_MESSAGE_TYPE_COLOR_MAP = useMemo(
      () =>
        ({
          [QbjcMessageType.ERROR]: theme.palette.warning.dark,
          [QbjcMessageType.INFO]: theme.palette.text.hint,
        } as const),
      [theme]
    );

    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const isScrolledToBottomRef = useRef<boolean>(true);
    const prevNumMessagesRef = useRef<number>(0);

    useEffect(() => {
      const {current: scrollContainerEl} = scrollContainerRef;
      const {current: prevNumMessages} = prevNumMessagesRef;
      const {current: isScrolledToBottom} = isScrolledToBottomRef;
      const numMessages = qbjcManager.messages.length;
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
        <PaneHeader title="Messages">
          <Tooltip title="Clear messages">
            <IconButton onClick={() => qbjcManager.clearMessages()}>
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
            {qbjcManager.messages.map(({loc, message, type, iconType}, idx) => {
              let iconElement: React.ReactNode = null;
              if (iconType) {
                const Icon = QBJC_ICON_TYPE_MAP[iconType];
                iconElement = (
                  <Icon
                    htmlColor={QBJC_MESSAGE_TYPE_COLOR_MAP[type]}
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
                      color: QBJC_MESSAGE_TYPE_COLOR_MAP[type],
                      marginTop: 3,
                      marginBottom: 3,
                      marginLeft: -28,
                    }}
                  />
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
