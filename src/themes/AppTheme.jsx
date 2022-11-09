import { ThemeProvider } from '@emotion/react';
import { CssBaseline } from '@mui/material';

import { qatarTheme } from './qatarTheme';


export const AppTheme = ({ children }) => {
  return (
    <ThemeProvider theme={ qatarTheme }>
      {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
      <CssBaseline />
      
      { children }
    </ThemeProvider>
  )
}
