import { Box, styled } from '@mui/material'

export const StateContainer = styled(Box)(({ theme }) => ({
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	justifyContent: 'center',
	paddingTop: theme.spacing(8),
	paddingBottom: theme.spacing(8),
}))

export const StateIconContent = styled(Box)(({ theme }) => ({
	marginBottom: theme.spacing(2),
	opacity: 0.5,
	color: theme.palette.text.secondary,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	'& > svg': {
		fontSize: '3rem',
	},
}))
