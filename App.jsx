

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Beneficiaries from "./pages/Beneficiaries";
import RationCards from "./pages/RationCards";
import Stock from "./pages/Stock";
import Allocation from "./pages/Allocation";
import Distribution from "./pages/Distribution";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/beneficiaries" element={<Beneficiaries />} />
        <Route path="/ration-cards" element={<RationCards />} />
        <Route path="/stock" element={<Stock />} />
        <Route path="/allocation" element={<Allocation />} />
        <Route path="/distribution" element={<Distribution />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;