import { CustomSelectBox, SearchInput, PageFilters } from "@/components";
import type { SubmissionsFilter } from "@/types";
import React from "react";

export const ALL_STATUSES = "all";

const STATUS_OPTIONS = [
  { value: ALL_STATUSES, label: "All statuses" },
  { value: "new", label: "New" },
  { value: "bound", label: "Bound" },
  { value: "bind_failed", label: "Failed" },
];

interface SubmissionFiltersProps {
  readonly filters: SubmissionsFilter;
  readonly onFilterChange: (filters: SubmissionsFilter) => void;
}

export const SubmissionFilters: React.FC<SubmissionFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  const handleSearch = (search: string): void => {
    onFilterChange({ ...filters, search, page: 1 });
  };

  const handleStatusChange = (status: string): void => {
    onFilterChange({ ...filters, status, page: 1 });
  };

  return (
    <PageFilters>
      <CustomSelectBox
        value={filters.status}
        onChange={handleStatusChange}
        options={STATUS_OPTIONS}
      />

      <SearchInput
        value={filters.search}
        onSearch={handleSearch}
        placeholder="Search by name…"
      />
    </PageFilters>
  );
};
