import { useState, useMemo } from 'react'
import { Plus, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { H2, Subtitle } from '@/components/typography/Typography'
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
		<div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
			<div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
				<div>
					<H2 className='border-none pb-0'>Submissions</H2>
					<Subtitle className='mt-1'>Manage and bind your insurance submissions</Subtitle>
				</div>
				<Button onClick={openCreateForm} className='gap-2 self-start sm:self-auto'>
					<Plus className='h-4 w-4' /> New Submission
				</Button>
			</div>

			<div className='mb-6 flex flex-col gap-3 sm:flex-row'>
				<Select value={statusFilter} onValueChange={setStatusFilter}>
					<SelectTrigger className='w-full sm:w-44'>
						<SelectValue placeholder='Filter by status' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value={ALL_STATUSES}>All statuses</SelectItem>
						<SelectItem value='new'>New</SelectItem>
						<SelectItem value='bound'>Bound</SelectItem>
						<SelectItem value='bind_failed'>Failed</SelectItem>
					</SelectContent>
				</Select>

				<div className='relative flex-1'>
					<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
					<Input
						placeholder='Search by name…'
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className='pl-9 pr-9'
					/>
					{searchQuery && (
						<button
							type='button'
							onClick={clearSearch}
							className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
						>
							<X className='h-4 w-4' />
						</button>
					)}
				</div>
			</div>

			<SubmissionList submissions={submissions} isLoading={isLoading} onEdit={openEditForm} />

			<SubmissionForm
				key={editingSubmission?.id ?? 'create'}
				open={formOpen}
				onClose={closeForm}
				submission={editingSubmission}
			/>
		</div>
	)
}
