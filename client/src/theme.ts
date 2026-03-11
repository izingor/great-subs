import { createTheme, type Theme } from '@mui/material/styles'

const getDesignTokens = (mode: 'light' | 'dark') => ({
	palette: {
		mode,
		primary: {
			main: mode === 'light' ? 'hsl(184, 85%, 38%)' : 'hsl(184, 80%, 42%)',
		},
		secondary: {
			main: mode === 'light' ? 'hsl(188, 42%, 59%)' : 'hsl(188, 35%, 30%)',
		},
		error: {
			main: mode === 'light' ? 'hsl(0, 72%, 51%)' : 'hsl(0, 62%, 45%)',
		},
		background: {
			default: mode === 'light' ? 'hsl(0, 0%, 100%)' : 'hsl(220, 20%, 6%)',
			paper: mode === 'light' ? 'hsl(0, 0%, 100%)' : 'hsl(220, 18%, 10%)',
		},
		text: {
			primary: mode === 'light' ? 'hsl(196, 20%, 15%)' : 'hsl(210, 20%, 93%)',
			secondary: mode === 'light' ? 'hsl(196, 10%, 40%)' : 'hsl(210, 10%, 55%)',
		},
	},
	typography: {
		fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
	},
	shape: {
		borderRadius: 10,
	},
})

export const getTheme = (mode: 'light' | 'dark'): Theme => createTheme(getDesignTokens(mode))
