import type { ReactNode } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Container,
  styled,
} from "@mui/material";
import { ThemeToggle } from "./ThemeToggle";
import { Subtitle } from "@/components/typography/Typography";

type HeaderProps = {
  readonly children?: ReactNode;
};

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "light"
      ? "rgba(255, 255, 255, 0.8)"
      : "rgba(12, 15, 19, 0.8)",
  backdropFilter: "blur(8px)",
  borderBottom: `1px solid ${theme.palette.divider}`,
  boxShadow: "none",
  color: theme.palette.text.primary,
}));

export const Header = ({ children }: HeaderProps): React.ReactElement => (
  <StyledAppBar position="sticky">
    <Container maxWidth="lg">
      <Toolbar
        disableGutters
        sx={{ minHeight: "64px", justifyContent: "space-between" }}
      >
				<Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <img
            src="/logo.svg"
            alt="Sub Manager"
            style={{ height: 36, width: 36 }}
          />
          <Subtitle
            variant="h6"
            component="span"
            sx={{ fontWeight: 700, letterSpacing: "-0.5px", color: 'text.primary' }}
          >
            Sub Manager
          </Subtitle>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {children}
          <ThemeToggle />
        </Box>
      </Toolbar>
    </Container>
  </StyledAppBar>
);
