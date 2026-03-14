import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { IconButton, InputAdornment, TextField, styled } from "@mui/material";
import { debounce } from "@mui/material/utils";
import React, { useMemo, useRef, useState } from "react";

const StyledSearchInput = styled(TextField)(({ theme }) => ({
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    maxWidth: 400,
  },
  "& .MuiOutlinedInput-root": {
    borderRadius: (theme.shape.borderRadius as number) * 2,
    transition: theme.transitions.create(["box-shadow", "border-color"]),
    "&.Mui-focused": {
      boxShadow: `0 0 0 2px ${theme.palette.primary.main}25`,
    },
  },
}));

interface SearchInputProps {
  readonly value: string;
  readonly onSearch: (value: string) => void;
  readonly placeholder?: string;
  readonly delay?: number;
}

export const SearchInput = ({
  value,
  onSearch,
  placeholder = "Search…",
  delay = 500,
}: SearchInputProps): React.ReactElement => {
  const [inputValue, setInputValue] = useState(value);
  const prevValueRef = useRef(value);

  // Sync local state if external value changes (without useEffect)
  if (prevValueRef.current !== value) {
    prevValueRef.current = value;
    setInputValue(value);
  }

  const onSearchRef = useRef(onSearch);
  onSearchRef.current = onSearch;

  const debouncedSearch = useMemo(
    () => debounce((v: string) => onSearchRef.current(v), delay),
    [delay]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const nextValue = e.target.value;
    setInputValue(nextValue);
    debouncedSearch(nextValue);
  };

  const handleClear = (): void => {
    setInputValue("");
    debouncedSearch.clear();
    onSearchRef.current("");
  };

  return (
    <StyledSearchInput
      placeholder={placeholder}
      value={inputValue}
      onChange={handleChange}
      size="small"
      fullWidth
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" color="primary" />
            </InputAdornment>
          ),
          endAdornment: inputValue ? (
            <InputAdornment position="end">
              <IconButton size="small" onClick={handleClear} edge="end">
                <CloseIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null,
        },
      }}
    />
  );
};
