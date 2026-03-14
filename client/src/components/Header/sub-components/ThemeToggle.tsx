import { useContext } from "react";
import { IconButton } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useTheme } from "@mui/material/styles";
import { ColorModeContext } from "@/providers";

export const ThemeToggle = (): React.ReactElement => {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  const toggleTheme = (): void => {
    colorMode.toggleColorMode();
  };

  const isDark = theme.palette.mode === "dark";

  return (
    <IconButton onClick={toggleTheme} color="inherit" aria-label="Toggle theme">
      {isDark ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  );
};
