import { Header } from "@/components/Header";
import { SubmissionsPage } from "@/pages/Submissions/SubmissionsPage";
import { Shell } from "@/components/Shell";

const App = (): React.ReactElement => (
  <Shell>
    <Header />
    <SubmissionsPage />
  </Shell>
);

export default App;
