import {createMuiTheme, ThemeProvider} from '@material-ui/core/styles';
import React from 'react';
import './app.css';
import Editor from './editor';

const darkTheme = createMuiTheme({
  palette: {
    type: 'dark',
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          height: '100%',
          width: '100%',
          backgroundColor: darkTheme.palette.background.default,
        }}
      >
        <Editor style={{flexGrow: 1}} />
      </div>
    </ThemeProvider>
  );
}

export default App;
