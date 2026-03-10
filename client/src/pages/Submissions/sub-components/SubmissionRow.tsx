import { useState } from 'react'
import { Loader2, CheckCircle2, XCircle, Pencil, Trash2, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TableRow, TableCell } from '@/components/ui/table'
import { useBindSubmissionMutation, useDeleteSubmissionMutation } from '@/store/api'
import type { Submission, SubmissionStatus } from '@/types/submission'
import { toast } from 'sonner'

const STATUS_VARIANT: Record<SubmissionStatus, 'default' | 'secondary' | 'destructive'> = {
	new: 'default',
	bound: 'secondary',
	bind_failed: 'destructive',
}

const STATUS_LABEL: Record<SubmissionStatus, string> = {
	new: 'New',
	bound: 'Bound',
	bind_failed: 'Failed',
}

type SubmissionRowProps = {
	readonly submission: Submission
	readonly onEdit: (submission: Submission) => void
}

export const SubmissionRow = ({ submission, onEdit }: SubmissionRowProps): React.ReactElement => {
	const [bindSubmission, { isLoading: isBinding, isSuccess: isBound, isError: isBindError }] =
		useBindSubmissionMutation({ fixedCacheKey: `bind-${submission.id}` })
	const [deleteSubmission, { isLoading: isDeleting }] = useDeleteSubmissionMutation()
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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
				<Badge variant='secondary' className='gap-1'>
					<CheckCircle2 className='h-3 w-3' /> Bound
				</Badge>
			)
		}

		if (isBindError) {
			return (
				<Button variant='destructive' size='sm' onClick={handleBind} className='gap-1'>
					<XCircle className='h-3.5 w-3.5' /> Retry
				</Button>
			)
		}

		if (isBinding) {
			return (
				<Button variant='secondary' size='sm' disabled className='gap-1'>
					<Loader2 className='h-3.5 w-3.5 animate-spin' /> Binding…
				</Button>
			)
		}

		return (
			<Button variant='default' size='sm' onClick={handleBind} className='gap-1'>
				<Zap className='h-3.5 w-3.5' /> Bind
			</Button>
		)
	}

	const formattedDate = new Date(submission.created_at).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	})

	return (
		<TableRow className='group'>
			<TableCell className='font-medium'>{submission.name}</TableCell>
			<TableCell>
				<Badge variant={STATUS_VARIANT[submission.status as SubmissionStatus]}>
					{STATUS_LABEL[submission.status as SubmissionStatus] ?? submission.status}
				</Badge>
			</TableCell>
			<TableCell className='hidden sm:table-cell text-muted-foreground'>{formattedDate}</TableCell>
			<TableCell>{renderBindButton()}</TableCell>
			<TableCell className='text-right'>
				<div className='flex items-center justify-end gap-1'>
					{showDeleteConfirm ? (
						<>
							<Button variant='destructive' size='sm' onClick={handleDelete} disabled={isDeleting}>
								{isDeleting ? <Loader2 className='h-3.5 w-3.5 animate-spin' /> : 'Confirm'}
							</Button>
							<Button variant='ghost' size='sm' onClick={() => setShowDeleteConfirm(false)}>
								Cancel
							</Button>
						</>
					) : (
						<>
							<Button
								variant='ghost'
								size='icon'
								className='h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity'
								onClick={() => onEdit(submission)}
							>
								<Pencil className='h-4 w-4' />
							</Button>
							<Button
								variant='ghost'
								size='icon'
								className='h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive'
								onClick={() => setShowDeleteConfirm(true)}
							>
								<Trash2 className='h-4 w-4' />
							</Button>
						</>
					)}
				</div>
			</TableCell>
		</TableRow>
	)
}
