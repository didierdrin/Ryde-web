import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import LiveMap from './pages/LiveMap';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';

// Placeholder components
const Placeholder = ({ title }) => (
  <div style={{ padding: '2rem' }}>
    <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{title}</h1>
    <p style={{ color: '#64748b' }}>This page is under construction.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />

        <Route path="/app" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="rides" element={<LiveMap />} />
          <Route path="drivers" element={<Placeholder title="Drivers Management" />} />
          <Route path="passengers" element={<Placeholder title="Passenger Management" />} />
          <Route path="payments" element={<Placeholder title="Payments & Transactions" />} />
          <Route path="subscription" element={<Placeholder title="Subscription Plans" />} />
        </Route>

        {/* Catch all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
