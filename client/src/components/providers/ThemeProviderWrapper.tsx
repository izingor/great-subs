import { createContext, useMemo, useEffect, type ReactNode } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { getTheme } from "@/theme";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

type ThemeProviderWrapperProps = {
  readonly children: ReactNode;
};

export const ThemeProviderWrapper = ({
  children,
}: ThemeProviderWrapperProps): React.ReactElement => {
  const [mode, setMode] = useLocalStorage<"light" | "dark">("theme", "light");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("theme");
    if (!storedTheme) {
      const isDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      setMode(isDark ? "dark" : "light");
    }
  }, [setMode]);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
      },
    }),
    [setMode],
  );

  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};
