import type { ReactElement } from "react";
import { Button, CircularProgress } from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import BoltIcon from "@mui/icons-material/Bolt";
import { useBindSubmissionMutation } from "@/store";
import type { Submission } from "@/types";

type BindButtonProps = {
  readonly submission: Submission;
};

export const BindButton = ({ submission }: BindButtonProps): ReactElement => {
  const [bindSubmission, { isLoading: isBinding }] = useBindSubmissionMutation();

  const handleBind = async (): Promise<void> => {
    await bindSubmission(submission.id).unwrap();
  };

  const isActuallyBinding = isBinding || !!submission.claimed_at;
  const disabled = submission.status === "bound";

  if (isActuallyBinding) {
    return (
      <Button
        variant="outlined"
        color="inherit"
        size="small"
        disabled
        startIcon={<CircularProgress size={16} />}
      >
        Binding…
      </Button>
    );
  }

  if (submission.status === "bind_failed") {
    return (
      <Button
        variant="outlined"
        color="error"
        size="small"
        startIcon={<CancelIcon />}
        onClick={handleBind}
      >
        Retry
      </Button>
    );
  }

  return (
    <Button
      disabled={disabled}
      variant="contained"
      color="primary"
      size="small"
      onClick={handleBind}
      startIcon={<BoltIcon />}
    >
      Bind
    </Button>
  );
};
