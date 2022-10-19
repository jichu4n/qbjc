import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import {useTheme} from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import useMediaQuery from '@mui/material/useMediaQuery';
import _ from 'lodash';
import {DropzoneArea} from 'react-mui-dropzone';
import BookshelfIcon from 'mdi-material-ui/Bookshelf';
import FileCodeIcon from 'mdi-material-ui/FileCode';
import LaptopIcon from 'mdi-material-ui/Laptop';
import {observer} from 'mobx-react';
import React, {useCallback, useRef, useState} from 'react';
import EditorController from './editor-controller';
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
          <ListItemAvatar>
            <Avatar>
              <FileCodeIcon color="action" />
            </Avatar>
          </ListItemAvatar>
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
    <div
      style={{
        display: 'flex',
        flex: 1,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
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
    editorController,
    onChangeSourceFileName,
  }: {
    isOpen: boolean;
    onClose: () => void;
    editorController: EditorController | null;
    onChangeSourceFileName: (sourceFileName: string) => void;
  }) => {
    const theme = useTheme();
    const isFullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const selectedFileSpecRef = useRef<SelectedFileSpec | null>(null);

    const [
      isOverwriteConfirmationDialogOpen,
      setIsOverwriteConfirmationDialogOpen,
    ] = useState(false);

    const openSelectedFile = useCallback(() => {
      const selectedFileSpec = selectedFileSpecRef.current;
      if (!editorController || !selectedFileSpec) {
        return;
      }
      editorController.setText(selectedFileSpec.content);
      onChangeSourceFileName(selectedFileSpec.title);
      selectedFileSpecRef.current = null;
      onClose();
    }, [editorController, onClose, onChangeSourceFileName]);

    const onSelect = useCallback(
      (fileSpec: SelectedFileSpec) => {
        if (!editorController) {
          return;
        }
        const trimmedSource = editorController.getText().trim();
        const shouldConfirm =
          !!trimmedSource &&
          !_.some(EXAMPLES, ({content}) => trimmedSource === content.trim());

        selectedFileSpecRef.current = fileSpec;
        if (shouldConfirm) {
          setIsOverwriteConfirmationDialogOpen(true);
        } else {
          openSelectedFile();
        }
      },
      [editorController, openSelectedFile]
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
              <Tab
                label="Examples"
                icon={<BookshelfIcon />}
                value={'examples'}
              />
              <Tab label="Computer" icon={<LaptopIcon />} value={'upload'} />
            </Tabs>
            <div
              style={{
                // @ts-ignore
                overflowY: 'overlay',
                flex: 1,
                height: 300,
                paddingLeft: 20,
                paddingRight: 20,
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
          title={`Open ${selectedFileSpecRef.current?.title}`}
          content="This will overwrite the current editor contents. Are you sure?"
        />
      </>
    );
  }
);

export default OpenDialog;
