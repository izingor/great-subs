import { Container, Box, Stack, styled } from '@mui/material'

export const PageContainer = styled(Container)(({ theme }) => ({
	paddingTop: theme.spacing(4),
	paddingBottom: theme.spacing(4),
}))

export const PageHeader = styled(Box)(({ theme }) => ({
	marginBottom: theme.spacing(4),
	display: 'flex',
	flexDirection: 'column',
	[theme.breakpoints.up('sm')]: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		justifyContent: 'space-between',
	},
	gap: theme.spacing(2),
}))

export const PageFilters = styled(Stack)(({ theme }) => ({
	marginBottom: theme.spacing(3),
	flexDirection: 'column',
	[theme.breakpoints.up('sm')]: {
		flexDirection: 'row',
	},
	gap: theme.spacing(2),
}))
