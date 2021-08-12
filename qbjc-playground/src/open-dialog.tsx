import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
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
import _ from 'lodash';
import {observer} from 'mobx-react';
import React, {useCallback, useRef, useState} from 'react';
import EXAMPLES from './examples';

function ConfirmationDialog({
  isOpen,
  onClose,
  title,
  content,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{content}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button
          onClick={useCallback(() => {
            onClose();
            onConfirm();
          }, [onClose, onConfirm])}
          color="primary"
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}

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

    const selectedFileSpec = useRef<{
      title: string;
      content: string;
    } | null>(null);

    const [
      isOverwriteConfirmationDialogOpen,
      setIsOverwriteConfirmationDialogOpen,
    ] = useState(false);

    const onConfirmOpen = useCallback(() => {
      if (!editor || !selectedFileSpec.current) {
        return;
      }
      editor.setValue(selectedFileSpec.current.content);
      selectedFileSpec.current = null;
      onClose();
    }, [editor, selectedFileSpec, onClose]);

    const onExampleClick = useCallback(
      (exampleIdx: number) => {
        if (!editor) {
          return;
        }
        const trimmedSource = editor.getValue().trim();
        const shouldConfirm =
          !!trimmedSource &&
          !_.some(EXAMPLES, ({content}) => trimmedSource === content.trim());

        selectedFileSpec.current = EXAMPLES[exampleIdx];
        if (shouldConfirm) {
          setIsOverwriteConfirmationDialogOpen(true);
        } else {
          onConfirmOpen();
        }
      },
      [editor, onConfirmOpen]
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

        <ConfirmationDialog
          isOpen={isOverwriteConfirmationDialogOpen}
          onClose={() => setIsOverwriteConfirmationDialogOpen(false)}
          onConfirm={onConfirmOpen}
          title="Open program"
          content="This will overwrite the current editor contents. Are you sure?"
        />
      </>
    );
  }
);

export default OpenDialog;
