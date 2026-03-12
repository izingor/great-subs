import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  styled,
} from "@mui/material";
import { H4, P } from "@/components/typography/Typography";
import {
  useCreateSubmissionMutation,
  useUpdateSubmissionMutation,
} from "@/store/api";
import type { Submission } from "@/types/submission";

const submissionSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

type SubmissionFormValues = z.infer<typeof submissionSchema>;

type SubmissionFormProps = {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly submission?: Submission;
};

const DialogHeader = styled(H4)(({ theme }) => ({
  padding: theme.spacing(3, 3, 1),
}));

const DialogDescription = styled(P)(({ theme }) => ({
  marginTop: 0,
  marginBottom: theme.spacing(2),
  color: theme.palette.text.secondary,
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: theme.spacing(0, 3, 2),
}));

export const SubmissionForm = ({
  open,
  onClose,
  submission,
}: SubmissionFormProps): React.ReactElement => {
  const isEditMode = !!submission;
  const [createSubmission, { isLoading: isCreating }] =
    useCreateSubmissionMutation();
  const [updateSubmission, { isLoading: isUpdating }] =
    useUpdateSubmissionMutation();
  const isSubmitting = isCreating || isUpdating;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubmissionFormValues>({
    resolver: zodResolver(submissionSchema),
    defaultValues: { name: submission?.name ?? "" },
  });

  const onSubmit = async (values: SubmissionFormValues): Promise<void> => {
    const response =
      isEditMode && submission
        ? await updateSubmission({ id: submission.id, data: values })
        : await createSubmission(values);

    if (response?.data) {
      reset();
      onClose();
    }
  };

  const handleClose = (): void => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogHeader>
        {isEditMode ? "Edit Submission" : "New Submission"}
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <DialogDescription>
            {isEditMode
              ? "Update the submission details below."
              : "Fill in the details to create a new submission."}
          </DialogDescription>

          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                autoFocus
                margin="dense"
                id="name"
                label="Name"
                type="text"
                fullWidth
                variant="outlined"
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            )}
          />
        </DialogContent>
        <StyledDialogActions>
          <Button onClick={handleClose} disabled={isSubmitting} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={16} /> : null}
          >
            {isEditMode ? "Update" : "Create"}
          </Button>
        </StyledDialogActions>
      </form>
    </Dialog>
  );
};
