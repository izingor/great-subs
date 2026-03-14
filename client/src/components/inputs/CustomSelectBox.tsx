import { MenuItem, Select, styled } from "@mui/material";

const StyledSelectBox = styled(Select<string>)(({ theme }) => ({
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    width: 180,
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderRadius: (theme.shape.borderRadius as number) * 2,
    transition: theme.transitions.create(["box-shadow", "border-color"]),
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    boxShadow: `0 0 0 2px ${theme.palette.primary.main}25`,
  },
}));

interface SelectBoxProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly options: { value: string; label: string }[];
}

export const CustomSelectBox = ({
  value,
  onChange,
  options,
}: SelectBoxProps) => {
  return (
    <StyledSelectBox 
      value={value} 
      onChange={(e) => onChange(e.target.value as string)} 
      size="small"
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </StyledSelectBox>
  );
};
