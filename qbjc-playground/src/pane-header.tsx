import Paper from '@material-ui/core/Paper';
import {useTheme} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React, {ReactNode} from 'react';

function PaneHeader({title, children}: {title: string; children?: ReactNode}) {
  const theme = useTheme();
  return (
    <Paper
      elevation={2}
      square={true}
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Typography
        variant="overline"
        color="textSecondary"
        style={{flexGrow: 1, padding: '0 0.5rem'}}
      >
        {title}
      </Typography>
      {children}
    </Paper>
  );
}

export default PaneHeader;
