import { useState } from "react";
import {
  TableRow,
  TableCell,
  Chip,
  IconButton,
  Button,
  CircularProgress,
  styled,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDeleteSubmissionMutation } from "@/store";
import type { Submission, SubmissionStatus } from "@/types";
import { H4, Subtitle } from "@/components";
import { BindButton } from "./BindButton";

const STATUS_COLOR: Record<
  SubmissionStatus,
  "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"
> = {
  new: "default",
  bound: "success",
  bind_failed: "error",
};

const formatStatus = (status: string): string =>
  status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ");

const StyledTableRow = styled(TableRow)({
  "&:last-child td, &:last-child th": { border: 0 },
});

const ResponsiveTableCell = styled(TableCell)(({ theme }) => ({
  display: "none",
  [theme.breakpoints.up("sm")]: {
    display: "table-cell",
  },
}));

const TableRowTitle = styled(H4)({
  fontSize: "1rem",
});

const DateText = styled(Subtitle)({
  fontSize: "0.875rem",
});

const ConfirmActionGroup = styled("div")({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: "8px",
});

const DefaultActionGroup = styled("div")({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: "4px",
});

type SubmissionRowProps = {
  readonly submission: Submission;
  readonly onEdit: (submission: Submission) => void;
};

export const SubmissionRow = ({
  submission,
  onEdit,
}: SubmissionRowProps): React.ReactElement => {
  const [deleteSubmission, { isLoading: isDeleting }] =
    useDeleteSubmissionMutation();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async (): Promise<void> => {
    await deleteSubmission(submission.id).unwrap();
    setShowDeleteConfirm(false);
  };

  const formattedDate = new Date(submission.created_at).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );

  return (
    <StyledTableRow hover>
      <TableCell component="th" scope="row">
        <TableRowTitle>{submission.name}</TableRowTitle>
      </TableCell>
      <TableCell>
        <Chip
          label={formatStatus(submission.status)}
          color={STATUS_COLOR[submission.status as SubmissionStatus]}
          size="small"
        />
      </TableCell>
      <ResponsiveTableCell>
        <DateText>{formattedDate}</DateText>
      </ResponsiveTableCell>
      <TableCell>
        <BindButton submission={submission} />
      </TableCell>
      <TableCell align="right">
        {showDeleteConfirm ? (
          <ConfirmActionGroup>
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                "Confirm"
              )}
            </Button>
            <Button
              variant="text"
              size="small"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
          </ConfirmActionGroup>
        ) : (
          <DefaultActionGroup>
            <IconButton size="small" onClick={() => onEdit(submission)}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </DefaultActionGroup>
        )}
      </TableCell>
    </StyledTableRow>
  );
};
