import { Header } from "@/components/Header";
import { SubmissionsPage } from "@/pages";
import { Shell } from "@/Shell";

const App = (): React.ReactElement => (
  <Shell>
    <Header />
    <SubmissionsPage />
  </Shell>
);

export default App;
