import Paper from '@mui/material/Paper';
import {useTheme} from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import React, {ReactNode} from 'react';

function PaneHeader({
  title,
  icon,
  children,
}: {
  title: ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
}) {
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
        cursor: 'pointer',
      }}
    >
      <div style={{display: 'flex', padding: '0 8px 0 12px'}}>{icon}</div>
      <Typography
        variant="overline"
        color="textSecondary"
        style={{flexGrow: 1, paddingRight: '12px', marginTop: '0.2rem'}}
      >
        {title}
      </Typography>
      {children}
    </Paper>
  );
}

export default PaneHeader;
