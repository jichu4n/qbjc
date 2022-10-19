import CircularProgress from '@mui/material/CircularProgress';
import {useTheme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';

function AppSplashScreen({isReady}: {isReady: boolean}) {
  enum Status {
    VISIBLE = 'visible',
    TRANSITIONING = 'transitioning',
    HIDDEN = 'hidden',
  }
  const TRANSITION_DELAY_MS = 600;
  const [status, setStatus] = useState<Status>(Status.VISIBLE);
  const theme = useTheme();

  useEffect(() => {
    if (isReady && status === Status.VISIBLE) {
      setStatus(Status.TRANSITIONING);
      setTimeout(() => setStatus(Status.HIDDEN), TRANSITION_DELAY_MS);
    }
  }, [isReady, status, Status]);

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        zIndex: 200,
        backgroundColor: theme.palette.background.paper,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transition: `opacity ${TRANSITION_DELAY_MS}ms`,
        ...(status === Status.VISIBLE
          ? {
              opacity: 1,
            }
          : {}),
        ...(status === Status.TRANSITIONING
          ? {
              opacity: 0,
            }
          : {}),
        ...(status === Status.HIDDEN
          ? {
              display: 'none',
            }
          : {}),
      }}
    >
      <CircularProgress />
    </div>
  );
}

export default AppSplashScreen;
