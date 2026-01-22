import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute';
// Create a placeholder Dashboard so we don't crash
// const Dashboard = () => <h1 className="text-3xl p-10">Welcome to the Dashboard</h1>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
          <Dashboard />
          </ProtectedRoute>

          } />
        
        {/* Default redirect to login */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;