import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader2, Inbox } from 'lucide-react'
import { Subtitle } from '@/components/typography/Typography'
import type { Submission } from '@/types/submission'
import { SubmissionRow } from './SubmissionRow'

type SubmissionListProps = {
	readonly submissions: Submission[] | undefined
	readonly isLoading: boolean
	readonly onEdit: (submission: Submission) => void
}

export const SubmissionList = ({ submissions, isLoading, onEdit }: SubmissionListProps): React.ReactElement => {
	if (isLoading) {
		return (
			<div className='flex flex-col items-center justify-center py-16 text-muted-foreground'>
				<Loader2 className='h-8 w-8 animate-spin mb-3' />
				<Subtitle>Loading submissions…</Subtitle>
			</div>
		)
	}

	if (!submissions?.length) {
		return (
			<div className='flex flex-col items-center justify-center py-16 text-muted-foreground'>
				<Inbox className='h-12 w-12 mb-3 opacity-50' />
				<Subtitle>No submissions found</Subtitle>
			</div>
		)
	}

	return (
		<div className='rounded-lg border bg-card'>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className='w-[35%]'>Name</TableHead>
						<TableHead className='w-[15%]'>Status</TableHead>
						<TableHead className='hidden sm:table-cell w-[20%]'>Created</TableHead>
						<TableHead className='w-[15%]'>Action</TableHead>
						<TableHead className='w-[15%] text-right'>Options</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{submissions.map((submission) => (
						<SubmissionRow key={submission.id} submission={submission} onEdit={onEdit} />
					))}
				</TableBody>
			</Table>
		</div>
	)
}
