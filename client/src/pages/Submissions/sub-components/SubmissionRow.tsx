import { useState } from 'react'
import { TableRow, TableCell, Chip, IconButton, Button, CircularProgress, styled } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import BoltIcon from '@mui/icons-material/Bolt'
import { useBindSubmissionMutation, useDeleteSubmissionMutation } from '@/store/api'
import type { Submission, SubmissionStatus } from '@/types/submission'
import { toast } from 'react-toastify'
import { H4, Subtitle } from '@/components/typography/Typography'

const STATUS_COLOR: Record<SubmissionStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
	new: 'default',
	bound: 'success',
	bind_failed: 'error',
}

const STATUS_LABEL: Record<SubmissionStatus, string> = {
	new: 'New',
	bound: 'Bound',
	bind_failed: 'Failed',
}

const StyledTableRow = styled(TableRow)({
	'&:last-child td, &:last-child th': { border: 0 },
})

const ResponsiveTableCell = styled(TableCell)(({ theme }) => ({
	display: 'none',
	[theme.breakpoints.up('sm')]: {
		display: 'table-cell',
	},
}))

const TableRowTitle = styled(H4)({
	fontSize: '1rem',
})

const DateText = styled(Subtitle)({
	fontSize: '0.875rem',
})

const ConfirmActionGroup = styled('div')({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'flex-end',
	gap: '8px',
})

const DefaultActionGroup = styled('div')<{ isHovered: boolean }>(({ isHovered }) => ({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'flex-end',
	opacity: isHovered ? 1 : 0,
	transition: 'opacity 0.2s',
	gap: '4px',
}))

type SubmissionRowProps = {
	readonly submission: Submission
	readonly onEdit: (submission: Submission) => void
}

export const SubmissionRow = ({ submission, onEdit }: SubmissionRowProps): React.ReactElement => {
	const [bindSubmission, { isLoading: isBinding, isSuccess: isBound, isError: isBindError }] =
		useBindSubmissionMutation({ fixedCacheKey: `bind-${submission.id}` })
	const [deleteSubmission, { isLoading: isDeleting }] = useDeleteSubmissionMutation()
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
	const [isHovered, setIsHovered] = useState(false)

	const handleBind = async (): Promise<void> => {
		try {
			const { attempts } = await bindSubmission(submission.id).unwrap()
			toast.success(`"${submission.name}" bound successfully in ${attempts} attempt${attempts === 1 ? '' : 's'}`)
		} catch {
			/* error middleware handles toast */
		}
	}

	const handleDelete = async (): Promise<void> => {
		try {
			await deleteSubmission(submission.id).unwrap()
			toast.success(`"${submission.name}" deleted`)
		} catch {
			/* error middleware handles toast */
		}
		setShowDeleteConfirm(false)
	}

	const renderBindButton = (): React.ReactElement => {
		if (submission.status === 'bound' || isBound) {
			return (
				<Chip
					icon={<CheckCircleIcon fontSize='small' />}
					label='Bound'
					color='success'
					variant='outlined'
					size='small'
				/>
			)
		}

		if (isBindError) {
			return (
				<Button
					variant='outlined'
					color='error'
					size='small'
					startIcon={<CancelIcon />}
					onClick={handleBind}
				>
					Retry
				</Button>
			)
		}

		if (isBinding) {
			return (
				<Button variant='outlined' color='inherit' size='small' disabled startIcon={<CircularProgress size={16} />}>
					Binding…
				</Button>
			)
		}

		return (
			<Button variant='contained' color='primary' size='small' onClick={handleBind} startIcon={<BoltIcon />}>
				Bind
			</Button>
		)
	}

	const formattedDate = new Date(submission.created_at).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	})

	return (
		<StyledTableRow
			hover
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<TableCell component='th' scope='row'>
				<TableRowTitle>
					{submission.name}
				</TableRowTitle>
			</TableCell>
			<TableCell>
				<Chip
					label={STATUS_LABEL[submission.status as SubmissionStatus] ?? submission.status}
					color={STATUS_COLOR[submission.status as SubmissionStatus]}
					size='small'
				/>
			</TableCell>
			<ResponsiveTableCell>
				<DateText>
					{formattedDate}
				</DateText>
			</ResponsiveTableCell>
			<TableCell>{renderBindButton()}</TableCell>
			<TableCell align='right'>
				{showDeleteConfirm ? (
					<ConfirmActionGroup>
						<Button variant='contained' color='error' size='small' onClick={handleDelete} disabled={isDeleting}>
							{isDeleting ? <CircularProgress size={16} color='inherit' /> : 'Confirm'}
						</Button>
						<Button variant='text' size='small' onClick={() => setShowDeleteConfirm(false)}>
							Cancel
						</Button>
					</ConfirmActionGroup>
				) : (
					<DefaultActionGroup isHovered={isHovered}>
						<IconButton size='small' onClick={() => onEdit(submission)}>
							<EditIcon fontSize='small' />
						</IconButton>
						<IconButton size='small' color='error' onClick={() => setShowDeleteConfirm(true)}>
							<DeleteIcon fontSize='small' />
						</IconButton>
					</DefaultActionGroup>
				)}
			</TableCell>
		</StyledTableRow>
	)
}
