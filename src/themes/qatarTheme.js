import { createTheme } from '@mui/material';
import { purple, red } from '@mui/material/colors';

export const qatarTheme = createTheme({
    //Ocean boat blue	#1077C3; Picton blue	#49BCE3
    palette: {
        primary: {
            main: '#56042c'
        },
        secondary: {
            main: '#fec310'
        },
        error: {
            main: red.A400
        },
        info:{
            main:purple[300]
        }
    },
    typography:{
        fontFamily:['monospace','arial'],
    } 
})





