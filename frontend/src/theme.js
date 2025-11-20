import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    typography: {
        fontFamily: 'Roboto, sans-serif',
        h5: {
            fontWeight: 600,
        },
    },
    palette: {
        primary: {
            main: '#334155',
        },
        secondary: {
            main: '#7B61FF',
        },
        background: {
            default: '#f4f6f8',
        },
    },
});

export default theme;