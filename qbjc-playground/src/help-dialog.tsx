import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Link from '@material-ui/core/Link';
import {useTheme} from '@material-ui/core/styles';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Typography from '@material-ui/core/Typography';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import InfoIcon from '@material-ui/icons/Info';
import BookshelfIcon from 'mdi-material-ui/Bookshelf';
import {observer} from 'mobx-react';
import React, {useState} from 'react';
import ExternalLink from './external-link';

function ResourcesTab() {
  return (
    <div>
      <Typography variant="h6">QBasic / QuickBASIC</Typography>
      <Typography variant="body1">
        <p>
          New to QBasic / QuickBASIC or need a refresher? Here are some
          resources to help get you started:
          <ul>
            <li>
              <ExternalLink href="https://en.wikibooks.org/wiki/QBasic">
                QBasic Wikibook (wikibooks.org)
              </ExternalLink>
            </li>
            <li>
              <ExternalLink href="https://www.qbasic.net/en/qbasic-tutorials/beginner/qbasic-beginner-1.htm">
                QBasic for Beginners (qbasic.net)
              </ExternalLink>
            </li>
            <li>
              <ExternalLink href="https://www.pcjs.org/documents/books/mspl13/basic/">
                Reference documentation from Microsoft (pcjs.org)
              </ExternalLink>
            </li>
          </ul>
        </p>
      </Typography>

      <Typography variant="h6">Compatibility</Typography>
      <Typography variant="body1">
        <p>
          qbjc supports a subset of QBasic / QuickBASIC functionality. See{' '}
          <ExternalLink href="https://github.com/jichu4n/qbjc#compatibility">
            compatibility guide
          </ExternalLink>{' '}
          for more information.
        </p>
        <p>
          Is there something you'd like to see supported in qbjc? Please file an
          issue or send a pull request at{' '}
          <ExternalLink href="https://github.com/jichu4n/qbjc">
            github.com/jichu4n/qbjc
          </ExternalLink>
          !
        </p>
      </Typography>
    </div>
  );
}

function AboutTab() {
  return (
    <div>
      <Typography variant="h6">What is qbjc?</Typography>
      <Typography variant="body1">
        <p>
          <b>qbjc</b> is a QBasic to JavaScript compiler.
        </p>
        <p>
          The qbjc playground at <Link href="https://qbjc.dev">qbjc.dev</Link>{' '}
          lets you edit and run QBasic / QuickBASIC programs directly in the
          browser.
        </p>
        <p>
          Visit the project homepage on GitHub to find out more:{' '}
          <ExternalLink href="https://github.com/jichu4n/qbjc">
            github.com/jichu4n/qbjc
          </ExternalLink>
        </p>
      </Typography>

      <Typography variant="h6">Who can see my source code?</Typography>
      <Typography variant="body1">
        <p>
          The source code you enter into the qbjc playground at{' '}
          <Link href="https://qbjc.dev">qbjc.dev</Link> is entirely private. It
          is compiled and executed locally in your browser, and your source code
          is never uploaded to qbjc.dev.
        </p>
      </Typography>

      <Typography variant="h6">
        Is qbjc built / supported by Microsoft?
      </Typography>
      <Typography variant="body1">
        <p>No, qbjc is NOT affliated with Microsoft in any way.</p>
        <p>
          qbjc is open source software distributed under the Apache 2.0 License.
          Please feel free to fork and contribute at{' '}
          <ExternalLink href="https://github.com/jichu4n/qbjc">
            github.com/jichu4n/qbjc
          </ExternalLink>
          !
        </p>
        <p>
          qbjc is developed by Chuan Ji. Find me on:
          <ul>
            <li>
              GitHub:{' '}
              <ExternalLink href="https://github.com/jichu4n">
                github.com/jichu4n
              </ExternalLink>
            </li>
            <li>
              Personal website:{' '}
              <ExternalLink href="https://jichu4n.com">
                jichu4n.com
              </ExternalLink>
            </li>
          </ul>
        </p>
      </Typography>
    </div>
  );
}

const HelpDialog = observer(
  ({isOpen, onClose}: {isOpen: boolean; onClose: () => void}) => {
    const theme = useTheme();
    const isFullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const [activeTab, setActiveTab] = useState<'resources' | 'about'>(
      'resources'
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
          <DialogTitle>Help</DialogTitle>
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
                label="Resources"
                icon={<BookshelfIcon />}
                value={'resources'}
              />
              <Tab label="About" icon={<InfoIcon />} value={'about'} />
            </Tabs>
            <div
              style={{
                backgroundColor: theme.palette.background.paper,
                // @ts-ignore
                overflowY: 'overlay',
                flex: 1,
                height: 300,
                paddingLeft: 20,
                paddingRight: 20,
              }}
            >
              {activeTab === 'resources' && <ResourcesTab />}
              {activeTab === 'about' && <AboutTab />}
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

export default HelpDialog;
