import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogActions, Button, TextField, CircularProgress } from '@mui/material'
import { H4, P } from '@/components/typography/Typography'
import { useCreateSubmissionMutation, useUpdateSubmissionMutation } from '@/store/api'
import type { Submission } from '@/types/submission'
import { toast } from 'react-toastify'

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
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<SubmissionFormValues>({
		resolver: zodResolver(submissionSchema),
		defaultValues: { name: submission?.name ?? '' },
	})

	const onSubmit = async (values: SubmissionFormValues): Promise<void> => {
		const result =
			isEditMode && submission
				? await updateSubmission({ id: submission.id, data: values })
				: await createSubmission(values)

		if ('data' in result) {
			toast.success(isEditMode ? 'Submission updated successfully' : 'Submission created successfully')
			reset()
			onClose()
		}
	}

	const handleClose = (): void => {
		reset()
		onClose()
	}

	return (
		<Dialog open={open} onClose={handleClose} fullWidth maxWidth='sm'>
			<H4 sx={{ px: 3, pt: 3, pb: 1 }}>{isEditMode ? 'Edit Submission' : 'New Submission'}</H4>
			<form onSubmit={handleSubmit(onSubmit)}>
				<DialogContent>
					<P sx={{ mb: 2, mt: 0, color: 'text.secondary' }}>
						{isEditMode
							? 'Update the submission details below.'
							: 'Fill in the details to create a new submission.'}
					</P>
					
					<Controller
						name='name'
						control={control}
						render={({ field }) => (
							<TextField
								{...field}
								autoFocus
								margin='dense'
								id='name'
								label='Name'
								type='text'
								fullWidth
								variant='outlined'
								error={!!errors.name}
								helperText={errors.name?.message}
							/>
						)}
					/>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2 }}>
					<Button onClick={handleClose} disabled={isSubmitting} color='inherit'>
						Cancel
					</Button>
					<Button type='submit' variant='contained' disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={16} /> : null}>
						{isEditMode ? 'Update' : 'Create'}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	)
}
