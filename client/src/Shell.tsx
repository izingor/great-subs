import { type ReactNode } from "react";
import { ToastContainer } from "react-toastify";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { ThemeProviderWrapper } from "@/providers/ThemeProviderWrapper";
import { useTheme } from "@mui/material/styles";
import "react-toastify/dist/ReactToastify.css";

type ShellProps = {
  readonly children: ReactNode;
};

const ToastWithTheme = (): React.ReactElement => {
  const theme = useTheme();
  return <ToastContainer position="bottom-right" theme={theme.palette.mode} />;
};

export const Shell = ({ children }: ShellProps): React.ReactElement => (
  <Provider store={store}>
    <ThemeProviderWrapper>
      {children}
      <ToastWithTheme />
    </ThemeProviderWrapper>
  </Provider>
);
