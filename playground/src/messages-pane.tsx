import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import {useTheme} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import ErrorIcon from '@material-ui/icons/Error';
import PlayCircleIcon from '@material-ui/icons/PlayCircleFilled';
import BlockIcon from '@material-ui/icons/Block';
import Paper from '@material-ui/core/Paper';
import {observer} from 'mobx-react';
import {Loc} from 'qbjc';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {
  QbjcMessage,
  QbjcMessageIconType,
  QbjcMessageType,
} from './qbjc-manager';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import PaneHeader from './pane-header';

const QBJC_ICON_TYPE_MAP = {
  [QbjcMessageIconType.ERROR]: ErrorIcon,
  [QbjcMessageIconType.PLAY_CIRCLE]: PlayCircleIcon,
} as const;

const MessagesPane = observer(
  ({
    messages,
    onLocClick,
    style = {},
  }: {
    messages: Array<QbjcMessage>;
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

    const listRef = useRef<HTMLUListElement | null>(null);
    const isScrolledToBottomRef = useRef<boolean>(true);
    const prevNumMessagesRef = useRef<number>(0);

    useEffect(() => {
      const {current: listEl} = listRef;
      const {current: prevNumMessages} = prevNumMessagesRef;
      const {current: isScrolledToBottom} = isScrolledToBottomRef;
      const numMessages = messages.length;
      if (!listEl || numMessages === prevNumMessages) {
        return;
      }
      if (isScrolledToBottom) {
        listEl.scrollTop = listEl.scrollHeight;
      }
      prevNumMessagesRef.current = numMessages;
    });

    return (
      <div style={{display: 'flex', flexDirection: 'column'}}>
        <PaneHeader title="Messages">
          <Tooltip title="Clear">
            <IconButton>
              <BlockIcon
                style={{fontSize: theme.typography.overline.fontSize}}
              />
            </IconButton>
          </Tooltip>
        </PaneHeader>
        <List
          ref={listRef}
          dense={true}
          disablePadding={true}
          style={{
            flexGrow: 1,
            //backgroundColor: theme.palette.background.paper,
            // @ts-ignore
            overflowY: 'overlay',
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
          {messages.map(({loc, message, type, iconType}, idx) => {
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
    );
  }
);

export default MessagesPane;
