import Fab from '@material-ui/core/Fab';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import StopIcon from '@material-ui/icons/Stop';
import {observer} from 'mobx-react';
import React, {useCallback} from 'react';
import QbjcManager from './qbjc-manager';

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

export default RunFab;
