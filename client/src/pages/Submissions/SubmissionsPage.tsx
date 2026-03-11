import { useState, useMemo } from 'react'
import { Container, Box, Button, TextField, Select, MenuItem, InputAdornment, IconButton, Stack } from '@mui/material'
import { H4, Subtitle } from '@/components/typography/Typography'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import { useGetSubmissionsQuery } from '@/store/api'
import { SubmissionList } from './sub-components/SubmissionList'
import { SubmissionForm } from './sub-components/SubmissionForm'
import type { Submission } from '@/types/submission'

const ALL_STATUSES = 'all'

export const SubmissionsPage = (): React.ReactElement => {
	const [statusFilter, setStatusFilter] = useState(ALL_STATUSES)
	const [searchQuery, setSearchQuery] = useState('')
	const [formOpen, setFormOpen] = useState(false)
	const [editingSubmission, setEditingSubmission] = useState<Submission | undefined>()

	const queryParams = useMemo(
		() => ({
			...(statusFilter !== ALL_STATUSES && { status: statusFilter }),
			...(searchQuery && { name: searchQuery }),
		}),
		[statusFilter, searchQuery],
	)

	const { data: submissions, isLoading } = useGetSubmissionsQuery(queryParams)

	const openCreateForm = (): void => {
		setEditingSubmission(undefined)
		setFormOpen(true)
	}

	const openEditForm = (submission: Submission): void => {
		setEditingSubmission(submission)
		setFormOpen(true)
	}

	const closeForm = (): void => {
		setFormOpen(false)
		setEditingSubmission(undefined)
	}

	const clearSearch = (): void => setSearchQuery('')

	return (
		<Container maxWidth='lg' sx={{ py: 4 }}>
			<Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'flex-end' }, justifyContent: 'space-between', gap: 2 }}>
				<Box>
					<H4 component='h2' sx={{ mb: 0.5 }}>
						Submissions
					</H4>
					<Subtitle>
						Manage and bind your insurance submissions
					</Subtitle>
				</Box>
				<Button variant='contained' startIcon={<AddIcon />} onClick={openCreateForm} sx={{ alignSelf: { xs: 'flex-start', sm: 'auto' } }}>
					New Submission
				</Button>
			</Box>

			<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
				<Select
					value={statusFilter}
					onChange={(e) => setStatusFilter(e.target.value)}
					size='small'
					sx={{ width: { xs: '100%', sm: 180 } }}
				>
					<MenuItem value={ALL_STATUSES}>All statuses</MenuItem>
					<MenuItem value='new'>New</MenuItem>
					<MenuItem value='bound'>Bound</MenuItem>
					<MenuItem value='bind_failed'>Failed</MenuItem>
				</Select>

				<TextField
					placeholder='Search by name…'
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					size='small'
					fullWidth
					InputProps={{
						startAdornment: (
							<InputAdornment position='start'>
								<SearchIcon fontSize='small' />
							</InputAdornment>
						),
						endAdornment: searchQuery ? (
							<InputAdornment position='end'>
								<IconButton size='small' onClick={clearSearch} edge='end'>
									<CloseIcon fontSize='small' />
								</IconButton>
							</InputAdornment>
						) : null,
					}}
				/>
			</Stack>

			<SubmissionList submissions={submissions} isLoading={isLoading} onEdit={openEditForm} />

			<SubmissionForm
				key={editingSubmission?.id ?? 'create'}
				open={formOpen}
				onClose={closeForm}
				submission={editingSubmission}
			/>
		</Container>
	)
}
