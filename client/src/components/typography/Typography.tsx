import { styled, Typography, type TypographyProps } from "@mui/material";

export const H1 = styled(
  (props: TypographyProps) => <Typography variant="h1" component="h1" {...props} />
)(({ theme }) => ({
  fontSize: "2.25rem",
  fontWeight: 800,
  letterSpacing: "-0.05em",
  lineHeight: 1.2,
  [theme.breakpoints.up("lg")]: {
    fontSize: "3rem",
  },
}));

export const H2 = styled(
  (props: TypographyProps) => <Typography variant="h2" component="h2" {...props} />
)(({ theme }) => ({
  fontSize: "1.875rem",
  fontWeight: 600,
  letterSpacing: "-0.025em",
  lineHeight: 1.25,
  borderBottom: `1px solid ${theme.palette.divider}`,
  paddingBottom: theme.spacing(1),
  "&:first-of-type": {
    marginTop: 0,
  },
}));

export const H3 = styled(
  (props: TypographyProps) => <Typography variant="h3" component="h3" {...props} />
)(() => ({
  fontSize: "1.5rem",
  fontWeight: 600,
  letterSpacing: "-0.025em",
  lineHeight: 1.3,
}));

export const H4 = styled(
  (props: TypographyProps) => <Typography variant="h4" component="h4" {...props} />
)(() => ({
  fontSize: "1.25rem",
  fontWeight: 600,
  letterSpacing: "-0.025em",
  lineHeight: 1.4,
}));

export const P = styled(
  (props: TypographyProps) => <Typography variant="body1" component="p" {...props} />
)(({ theme }) => ({
  fontSize: "1rem",
  lineHeight: 1.75,
  "&:not(:first-of-type)": {
    marginTop: theme.spacing(3),
  },
}));

export const Subtitle = styled(
  (props: TypographyProps) => <Typography variant="h6" component="p" {...props} />
)(({ theme }) => ({
  fontSize: "1.125rem",
  lineHeight: 1.75,
  color: theme.palette.text.secondary,
}));
