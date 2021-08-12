import Paper from '@material-ui/core/Paper';
import {useTheme} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React, {ReactNode} from 'react';

function PaneHeader({
  title,
  icon,
  children,
}: {
  title: string;
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
      }}
    >
      <div style={{display: 'flex', padding: '0 8px 0 12px'}}>{icon}</div>
      <Typography
        variant="overline"
        color="textSecondary"
        style={{flexGrow: 1, paddingRight: '12px'}}
      >
        {title}
      </Typography>
      {children}
    </Paper>
  );
}

export default PaneHeader;
