import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import LiveMap from './pages/LiveMap';
import Login from './pages/Login';
import Signup from './pages/Signup';
import LandingPage from './pages/LandingPage';
import Drivers from './pages/Drivers';
import Passengers from './pages/Passengers';
import Subscriptions from './pages/Subscriptions';
import Search from './pages/Search';

// Placeholder components
const Placeholder = ({ title }) => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
    <p className="text-gray-600">This page is under construction.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/app" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="rides" element={<LiveMap />} />
          <Route path="drivers" element={<Drivers />} />
          <Route path="passengers" element={<Passengers />} />
          <Route path="payments" element={<Placeholder title="Payments & Transactions" />} />
          <Route path="subscription" element={<Subscriptions />} />
          <Route path="search" element={<Search />} />
        </Route>

        {/* Catch all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;