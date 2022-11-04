import { Route, Routes } from 'react-router-dom';
import './App.css';
import { Dashboard } from './components/Dashboard';
import { Home } from './components/Home';
import { Login } from './components/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Register } from './components/Register';
import { AuthProvider } from './context/AuthContext';

// let users = [2,4]
function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path='/login' element={<Login/>} />
        <Route path='/Register' element={<Register/>} />
        <Route path='/' element={<ProtectedRoute><Home/></ProtectedRoute>} />
        <Route path='/dashboard' element={<Dashboard/>} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
