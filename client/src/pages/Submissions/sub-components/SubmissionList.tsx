import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  styled,
  TablePagination,
} from "@mui/material";
import InboxIcon from "@mui/icons-material/Inbox";
import type { Submission } from "@/types";
import { SubmissionRow } from "./SubmissionRow";
import { Subtitle, StateContainer, StateIconContent } from "@/components";

const StyledTable = styled(Table)({
  minWidth: 650,
});

const ResponsiveTableCell = styled(TableCell)(({ theme }) => ({
  display: "none",
  [theme.breakpoints.up("sm")]: {
    display: "table-cell",
  },
}));

const LoadingSpinner = styled(CircularProgress)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

type SubmissionListProps = {
  readonly submissions: Submission[] | undefined;
  readonly total: number;
  readonly page: number;
  readonly size: number;
  readonly isLoading: boolean;
  readonly onPageChange: (newPage: number) => void;
  readonly onSizeChange: (newSize: number) => void;
  readonly onEdit: (submission: Submission) => void;
};

export const SubmissionList = ({
  submissions,
  total,
  page,
  size,
  isLoading,
  onPageChange,
  onSizeChange,
  onEdit,
}: SubmissionListProps): React.ReactElement => {
  if (isLoading) {
    return (
      <StateContainer>
        <LoadingSpinner />
        <Subtitle>Loading submissions…</Subtitle>
      </StateContainer>
    );
  }

  if (!submissions?.length) {
    return (
      <StateContainer>
        <StateIconContent>
          <InboxIcon />
        </StateIconContent>
        <Subtitle>No submissions found</Subtitle>
      </StateContainer>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <StyledTable>
        <TableHead>
          <TableRow>
            <TableCell width="35%">Name</TableCell>
            <TableCell width="15%">Status</TableCell>
            <ResponsiveTableCell width="20%">Created</ResponsiveTableCell>
            <TableCell width="15%">Action</TableCell>
            <TableCell width="15%" align="right">
              Options
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {submissions.map((submission) => (
            <SubmissionRow
              key={submission.id}
              submission={submission}
              onEdit={onEdit}
            />
          ))}
        </TableBody>
      </StyledTable>
      <TablePagination
        component="div"
        count={total}
        page={Math.max(0, page - 1)}
        onPageChange={(_, newPage) => onPageChange(newPage + 1)}
        rowsPerPage={size}
        onRowsPerPageChange={(e) => onSizeChange(parseInt(e.target.value, 10))}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </TableContainer>
  );
};
