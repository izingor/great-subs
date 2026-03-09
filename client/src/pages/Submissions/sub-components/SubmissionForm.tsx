import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useCreateSubmissionMutation, useUpdateSubmissionMutation } from '@/store/api'
import type { Submission } from '@/types/submission'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const submissionSchema = z.object({
	name: z.string().min(1, 'Name is required'),
})

type SubmissionFormValues = z.infer<typeof submissionSchema>

type SubmissionFormProps = {
	readonly open: boolean
	readonly onClose: () => void
	readonly submission?: Submission
}

export const SubmissionForm = ({ open, onClose, submission }: SubmissionFormProps): React.ReactElement => {
	const isEditMode = !!submission
	const [createSubmission, { isLoading: isCreating }] = useCreateSubmissionMutation()
	const [updateSubmission, { isLoading: isUpdating }] = useUpdateSubmissionMutation()
	const isSubmitting = isCreating || isUpdating

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<SubmissionFormValues>({
		resolver: zodResolver(submissionSchema),
		defaultValues: { name: submission?.name ?? '' },
	})

	const onSubmit = async (values: SubmissionFormValues): Promise<void> => {
		try {
			if (isEditMode && submission) {
				await updateSubmission({ id: submission.id, data: values }).unwrap()
				toast.success('Submission updated successfully')
			} else {
				await createSubmission(values).unwrap()
				toast.success('Submission created successfully')
			}
			reset()
			onClose()
		} catch {
			/* error middleware handles toast */
		}
	}

	const handleOpenChange = (isOpen: boolean): void => {
		if (!isOpen) {
			reset()
			onClose()
		}
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className='sm:max-w-md'>
				<DialogHeader>
					<DialogTitle>{isEditMode ? 'Edit Submission' : 'New Submission'}</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
					<div className='space-y-2'>
						<Label htmlFor='name'>Name</Label>
						<Input
							id='name'
							placeholder='Enter submission name'
							{...register('name')}
							aria-invalid={!!errors.name}
						/>
						{errors.name && <p className='text-sm text-destructive'>{errors.name.message}</p>}
					</div>
					<DialogFooter>
						<Button type='button' variant='ghost' onClick={onClose} disabled={isSubmitting}>
							Cancel
						</Button>
						<Button type='submit' disabled={isSubmitting}>
							{isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
							{isEditMode ? 'Update' : 'Create'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
