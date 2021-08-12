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
import {DropzoneArea} from 'material-ui-dropzone';
import {observer} from 'mobx-react';
import React, {useCallback, useRef, useState} from 'react';
import EXAMPLES from './examples';

interface SelectedFileSpec {
  title: string;
  content: string;
}

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

function ExamplesTab({
  onSelect,
}: {
  onSelect: (fileSpec: SelectedFileSpec) => void;
}) {
  const onExampleClick = useCallback(
    (exampleIdx: number) => {
      onSelect(EXAMPLES[exampleIdx]);
    },
    [onSelect]
  );

  return (
    <List subheader={<li />}>
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
    </List>
  );
}

function UploadTab({
  onSelect,
}: {
  onSelect: (fileSpec: SelectedFileSpec) => void;
}) {
  const onChange = useCallback(
    async (selectedFiles: Array<File>) => {
      if (selectedFiles.length > 0) {
        const selectedFile = selectedFiles[0];
        onSelect({
          title: selectedFile.name,
          content: await selectedFile.text(),
        });
      }
    },
    [onSelect]
  );

  return (
    <div style={{padding: 20}}>
      <DropzoneArea
        acceptedFiles={['.bas']}
        filesLimit={1}
        showPreviews={false}
        showPreviewsInDropzone={false}
        onChange={onChange}
      />
    </div>
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

    const selectedFileSpec = useRef<SelectedFileSpec | null>(null);

    const [
      isOverwriteConfirmationDialogOpen,
      setIsOverwriteConfirmationDialogOpen,
    ] = useState(false);

    const openSelectedFile = useCallback(() => {
      if (!editor || !selectedFileSpec.current) {
        return;
      }
      editor.setValue(selectedFileSpec.current.content);
      selectedFileSpec.current = null;
      onClose();
    }, [editor, onClose]);

    const onSelect = useCallback(
      (fileSpec: SelectedFileSpec) => {
        if (!editor) {
          return;
        }
        const trimmedSource = editor.getValue().trim();
        const shouldConfirm =
          !!trimmedSource &&
          !_.some(EXAMPLES, ({content}) => trimmedSource === content.trim());

        selectedFileSpec.current = fileSpec;
        if (shouldConfirm) {
          setIsOverwriteConfirmationDialogOpen(true);
        } else {
          openSelectedFile();
        }
      },
      [editor, openSelectedFile]
    );

    const [activeTab, setActiveTab] = useState<'examples' | 'upload'>(
      'examples'
    );

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
              <Tab label="Local file" value={'upload'} />
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
              {activeTab === 'examples' && <ExamplesTab onSelect={onSelect} />}
              {activeTab === 'upload' && <UploadTab onSelect={onSelect} />}
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
          onConfirm={openSelectedFile}
          title={`Open ${selectedFileSpec.current?.title}`}
          content="This will overwrite the current editor contents. Are you sure?"
        />
      </>
    );
  }
);

export default OpenDialog;
