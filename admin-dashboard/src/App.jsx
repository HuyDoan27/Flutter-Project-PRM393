import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import "antd/dist/reset.css";

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
