import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#0052CC', // Jira Blue
            light: '#4C9AFF',
            dark: '#0747A6',
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: '#6554C0', // Jira Purple
            light: '#8777D9',
            dark: '#5243AA',
        },
        success: {
            main: '#00875A',
            light: '#36B37E',
            dark: '#006644',
        },
        warning: {
            main: '#FF991F',
            light: '#FFAB00',
            dark: '#FF8B00',
        },
        error: {
            main: '#DE350B',
            light: '#FF5630',
            dark: '#BF2600',
        },
        info: {
            main: '#0065FF',
            light: '#2684FF',
            dark: '#0052CC',
        },
        background: {
            default: '#F4F5F7',
            paper: '#FFFFFF',
        },
        text: {
            primary: '#172B4D',
            secondary: '#5E6C84',
            disabled: '#A5ADBA',
        },
        divider: '#DFE1E6',
    },
    typography: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
        h1: {
            fontSize: '2.5rem',
            fontWeight: 500,
            lineHeight: 1.2,
            color: '#172B4D',
        },
        h2: {
            fontSize: '2rem',
            fontWeight: 500,
            lineHeight: 1.3,
            color: '#172B4D',
        },
        h3: {
            fontSize: '1.75rem',
            fontWeight: 500,
            lineHeight: 1.4,
            color: '#172B4D',
        },
        h4: {
            fontSize: '1.5rem',
            fontWeight: 600,
            lineHeight: 1.4,
            color: '#172B4D',
        },
        h5: {
            fontSize: '1.25rem',
            fontWeight: 600,
            lineHeight: 1.5,
            color: '#172B4D',
        },
        h6: {
            fontSize: '1rem',
            fontWeight: 600,
            lineHeight: 1.5,
            color: '#172B4D',
        },
        body1: {
            fontSize: '0.875rem',
            lineHeight: 1.5,
            color: '#172B4D',
        },
        body2: {
            fontSize: '0.875rem',
            lineHeight: 1.43,
            color: '#5E6C84',
        },
        button: {
            textTransform: 'none',
            fontWeight: 500,
        },
    },
    shape: {
        borderRadius: 3,
    },
    shadows: [
        'none',
        '0px 1px 1px rgba(9, 30, 66, 0.25), 0px 0px 1px rgba(9, 30, 66, 0.31)',
        '0px 2px 4px rgba(9, 30, 66, 0.25), 0px 0px 1px rgba(9, 30, 66, 0.31)',
        '0px 3px 5px rgba(9, 30, 66, 0.2), 0px 0px 1px rgba(9, 30, 66, 0.31)',
        '0px 4px 8px rgba(9, 30, 66, 0.2), 0px 0px 1px rgba(9, 30, 66, 0.31)',
        '0px 5px 10px rgba(9, 30, 66, 0.2), 0px 0px 1px rgba(9, 30, 66, 0.31)',
        '0px 8px 12px rgba(9, 30, 66, 0.15), 0px 0px 1px rgba(9, 30, 66, 0.31)',
        '0px 10px 18px rgba(9, 30, 66, 0.15), 0px 0px 1px rgba(9, 30, 66, 0.31)',
        '0px 12px 24px rgba(9, 30, 66, 0.15), 0px 0px 1px rgba(9, 30, 66, 0.31)',
        ...Array(16).fill('0px 12px 24px rgba(9, 30, 66, 0.15), 0px 0px 1px rgba(9, 30, 66, 0.31)'),
    ],
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 3,
                    fontWeight: 500,
                    padding: '8px 12px',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                },
                contained: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0px 2px 4px rgba(9, 30, 66, 0.25)',
                    },
                },
                outlined: {
                    borderWidth: '1px',
                    '&:hover': {
                        borderWidth: '1px',
                        backgroundColor: 'rgba(9, 30, 66, 0.04)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 3,
                    boxShadow: '0px 1px 1px rgba(9, 30, 66, 0.25), 0px 0px 1px rgba(9, 30, 66, 0.31)',
                    transition: 'box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        boxShadow: '0px 4px 8px rgba(9, 30, 66, 0.2), 0px 0px 1px rgba(9, 30, 66, 0.31)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
                elevation1: {
                    boxShadow: '0px 1px 1px rgba(9, 30, 66, 0.25), 0px 0px 1px rgba(9, 30, 66, 0.31)',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            borderColor: '#DFE1E6',
                        },
                        '&:hover fieldset': {
                            borderColor: '#B3BAC5',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#0052CC',
                            borderWidth: '2px',
                        },
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 3,
                    fontWeight: 500,
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    boxShadow: '0px 1px 0px rgba(9, 30, 66, 0.13)',
                },
            },
        },
    },
});

export default theme;
