import { useState } from 'react'
import { Box, Button, styled } from '@mui/material'
import { H4, Subtitle } from '@/components/typography/Typography'
import { PageContainer, PageHeader } from '@/components/layouts/PageLayout'
import AddIcon from '@mui/icons-material/Add'
import { useGetSubmissionsQuery } from '@/store/api'
import { SubmissionList } from './sub-components/SubmissionList'
import { SubmissionForm } from './sub-components/SubmissionForm'
import { SubmissionFilters, ALL_STATUSES } from './sub-components/SubmissionFilters'
import type { Submission, SubmissionsFilter } from '@/types/submission'

const PageTitle = styled(H4)(({ theme }) => ({
	marginBottom: theme.spacing(0.5),
}))

const HeaderAction = styled(Button)(({ theme }) => ({
	alignSelf: 'flex-start',
	[theme.breakpoints.up('sm')]: {
		alignSelf: 'auto',
	},
}))

export const SubmissionsPage = (): React.ReactElement => {
	const [filters, setFilters] = useState<SubmissionsFilter>({
		status: ALL_STATUSES,
		search: '',
	})
	const [formOpen, setFormOpen] = useState(false)
	const [editingSubmission, setEditingSubmission] = useState<Submission | undefined>()

	const queryParams = {
		...(filters.status !== ALL_STATUSES && { status: filters.status }),
		...(filters.search && { name: filters.search }),
	}

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

	return (
		<PageContainer maxWidth='lg'>
			<PageHeader>
				<Box>
					<PageTitle component='h2'>
						Submissions
					</PageTitle>
					<Subtitle>
						Manage and bind your insurance submissions
					</Subtitle>
				</Box>
				<HeaderAction variant='contained' startIcon={<AddIcon />} onClick={openCreateForm}>
					New Submission
				</HeaderAction>
			</PageHeader>

			<SubmissionFilters filters={filters} onFilterChange={setFilters} />

			<SubmissionList submissions={submissions} isLoading={isLoading} onEdit={openEditForm} />

			<SubmissionForm
				key={editingSubmission?.id ?? 'create'}
				open={formOpen}
				onClose={closeForm}
				submission={editingSubmission}
			/>
		</PageContainer>
	)
}
