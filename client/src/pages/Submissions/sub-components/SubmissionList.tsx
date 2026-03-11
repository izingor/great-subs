import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Box } from '@mui/material'
import InboxIcon from '@mui/icons-material/Inbox'
import type { Submission } from '@/types/submission'
import { SubmissionRow } from './SubmissionRow'
import { Subtitle } from '@/components/typography/Typography'

type SubmissionListProps = {
	readonly submissions: Submission[] | undefined
	readonly isLoading: boolean
	readonly onEdit: (submission: Submission) => void
}

export const SubmissionList = ({ submissions, isLoading, onEdit }: SubmissionListProps): React.ReactElement => {
	if (isLoading) {
		return (
			<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8 }}>
				<CircularProgress sx={{ mb: 2 }} />
				<Subtitle>Loading submissions…</Subtitle>
			</Box>
		)
	}

	if (!submissions?.length) {
		return (
			<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8 }}>
				<InboxIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5, color: 'text.secondary' }} />
				<Subtitle>No submissions found</Subtitle>
			</Box>
		)
	}

	return (
		<TableContainer component={Paper} variant='outlined'>
			<Table sx={{ minWidth: 650 }}>
				<TableHead>
					<TableRow>
						<TableCell width='35%'>Name</TableCell>
						<TableCell width='15%'>Status</TableCell>
						<TableCell width='20%' sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Created</TableCell>
						<TableCell width='15%'>Action</TableCell>
						<TableCell width='15%' align='right'>Options</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{submissions.map((submission) => (
						<SubmissionRow key={submission.id} submission={submission} onEdit={onEdit} />
					))}
				</TableBody>
			</Table>
		</TableContainer>
	)
}
