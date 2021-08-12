import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import {useTheme} from '@material-ui/core/styles';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import DescriptionIcon from '@material-ui/icons/Description';
import {Ace} from 'ace-builds';
import {observer} from 'mobx-react';
import React, {useCallback, useState} from 'react';
import EXAMPLES from './examples';
// @ts-ignore
window.EXAMPLES = EXAMPLES;

const OpenDialog = observer(
  ({
    isOpen,
    onClose,
    editor,
  }: {
    isOpen: boolean;
    onClose: () => void;
    editor: Ace.Editor | null;
  }) => {
    const theme = useTheme();
    const isFullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const onExampleClick = useCallback(
      (exampleIdx: number) => {
        if (!editor) {
          return;
        }
        const {content} = EXAMPLES[exampleIdx];
        editor.setValue(content);
        onClose();
      },
      [editor, onClose]
    );

    const [activeTab, setActiveTab] = useState<'examples'>('examples');

    return (
      <>
        <Dialog
          fullScreen={isFullScreen}
          open={isOpen}
          onClose={onClose}
          fullWidth={true}
          maxWidth="sm"
          scroll="paper"
        >
          <DialogTitle>Open program</DialogTitle>
          <div
            style={{
              display: 'flex',
            }}
          >
            <Tabs
              orientation="vertical"
              variant="scrollable"
              value={activeTab}
              onChange={(event, activeTab) => setActiveTab(activeTab)}
              style={{
                borderRight: `1px solid ${theme.palette.divider}`,
              }}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="Examples" value={'examples'} />
            </Tabs>
            <div
              style={{
                backgroundColor: theme.palette.background.paper,
                // @ts-ignore
                overflowY: 'overlay',
                flex: 1,
                height: 300,
              }}
            >
              <List subheader={<li />}>
                {activeTab === 'examples' && (
                  <>
                    {EXAMPLES.map(({fileName, title, description}, idx) => (
                      <ListItem
                        key={fileName}
                        button={true}
                        onClick={() => onExampleClick(idx)}
                      >
                        <ListItemIcon>
                          <DescriptionIcon />
                        </ListItemIcon>
                        <ListItemText primary={title} secondary={description} />
                      </ListItem>
                    ))}
                  </>
                )}
              </List>
            </div>
          </div>
          <DialogActions>
            <Button onClick={onClose} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
);

export default OpenDialog;
