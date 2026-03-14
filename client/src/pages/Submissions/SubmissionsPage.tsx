import { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import { Box, Button, styled } from "@mui/material";
import { PageContainer, PageHeader, H4, Subtitle } from "@/components";
import { useGetSubmissionsQuery } from "@/store";
import {
  SubmissionList,
  SubmissionForm,
  SubmissionFilters,
  ALL_STATUSES,
} from "./sub-components";
import type { Submission, SubmissionsFilter } from "@/types";

const PageTitle = styled(H4)(({ theme }) => ({
  marginBottom: theme.spacing(0.5),
}));

const HeaderAction = styled(Button)(({ theme }) => ({
  alignSelf: "flex-start",
  [theme.breakpoints.up("sm")]: {
    alignSelf: "auto",
  },
}));

export const SubmissionsPage = (): React.ReactElement => {
  const [filters, setFilters] = useState<SubmissionsFilter>({
    status: ALL_STATUSES,
    search: "",
    page: 1,
    size: 10,
  });
  const [formOpen, setFormOpen] = useState(false);
  const [editingSubmission, setEditingSubmission] = useState<
    Submission | undefined
  >();

  const queryParams = {
    ...(filters.status !== ALL_STATUSES && { status: filters.status }),
    ...(filters.search && { name: filters.search }),
    page: filters.page,
    size: filters.size,
  };

  const { data: submissions, isLoading } = useGetSubmissionsQuery(queryParams);

  const openCreateForm = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.currentTarget.blur();
    setEditingSubmission(undefined);
    setFormOpen(true);
  };

  const openEditForm = (
    submission: Submission,
    e?: React.MouseEvent<HTMLButtonElement>
  ): void => {
    e?.currentTarget.blur();
    setEditingSubmission(submission);
    setFormOpen(true);
  };

  const closeForm = (): void => {
    setFormOpen(false);
    setEditingSubmission(undefined);
  };

  return (
    <PageContainer maxWidth="lg">
      <PageHeader>
        <Box>
          <PageTitle component="h2">Submissions</PageTitle>
          <Subtitle>Manage and bind your insurance submissions</Subtitle>
        </Box>
        <HeaderAction
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateForm}
          aria-haspopup="dialog"
          aria-expanded={formOpen}
        >
          New Submission
        </HeaderAction>
      </PageHeader>

      <SubmissionFilters filters={filters} onFilterChange={setFilters} />

      <SubmissionList
        submissions={submissions?.items}
        total={submissions?.total ?? 0}
        page={filters.page}
        size={filters.size}
        isLoading={isLoading}
        onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
        onSizeChange={(size) =>
          setFilters((prev) => ({ ...prev, size, page: 1 }))
        }
        onEdit={openEditForm}
      />

      <SubmissionForm
        key={editingSubmission?.id ?? "create"}
        open={formOpen}
        onClose={closeForm}
        submission={editingSubmission}
      />
    </PageContainer>
  );
};
