import type { ReactNode } from "react";
import { AppBar, Toolbar, Box, Container, styled } from "@mui/material";
import { Subtitle } from "@/components/typography";
import { ThemeToggle } from "./sub-components";

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

const LogoText = styled(Subtitle)({
  fontWeight: 600,
  color: "inherit",
  margin: 0,
});

const LogoIcon = styled("img")({
  height: 36,
  width: 36,
});

const LogoContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 1.5,
});

const StyledToolbar = styled(Toolbar)({
  minHeight: "64px",
  justifyContent: "space-between",
});

const HeaderActions = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
}));

export const Header = ({ children }: HeaderProps): React.ReactElement => (
  <StyledAppBar position="sticky" elevation={0}>
    <Container maxWidth="lg">
      <StyledToolbar disableGutters>
        <LogoContainer>
          <LogoIcon src="/logo.svg" alt="Sub Manager" />
          <LogoText variant="h6" component="span">
            Subs Manager
          </LogoText>
        </LogoContainer>
        <HeaderActions>
          {children}
          <ThemeToggle />
        </HeaderActions>
      </StyledToolbar>
    </Container>
  </StyledAppBar>
);
