import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import LiveMap from './pages/LiveMap';
import Login from './pages/Login';
import Signup from './pages/Signup';
import LandingPage from './pages/LandingPage';
import Drivers from './pages/Drivers';
import Passengers from './pages/Passengers';
import Subscriptions from './pages/Subscriptions';
import Trips from './pages/Trips';
import Rentals from './pages/Rentals';
import Search from './pages/Search';
import Profile from './pages/Profile';
import api from './services/api';

function ProtectedRoute({ children }) {
  const { loading, user } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }
  if (!api.getToken() || !user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/app" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="rides" element={<LiveMap />} />
            <Route path="trips" element={<Trips />} />
            <Route path="rentals" element={<Rentals />} />
            <Route path="search" element={<Search />} />
            <Route path="drivers" element={<Drivers />} />
            <Route path="passengers" element={<Passengers />} />
            <Route path="subscription" element={<Subscriptions />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;