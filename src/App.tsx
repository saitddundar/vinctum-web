import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Nodes from "./pages/Nodes";
import Anomalies from "./pages/Anomalies";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/nodes" element={<Nodes />} />
          <Route path="/anomalies" element={<Anomalies />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
