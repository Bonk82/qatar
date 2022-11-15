import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import { Admin } from './components/Admin';
import { Bet } from './components/Bet';
import { Dashboard } from './components/Dashboard';
import { Home } from './components/Home';
import { Info } from './components/Info';
import { Login } from './components/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Rank } from './components/Rank';
import { Register } from './components/Register';
import { AuthProvider } from './context/AuthContext';
import {AppTheme} from './themes/AppTheme'

// let users = [2,4]
function App() {
  return (
    <AuthProvider>
      <AppTheme>
        <Routes>
          <Route path='/login' element={<Login/>} />
          <Route path='/Register' element={<Register/>} />
          <Route path='/' element={<ProtectedRoute><Info/></ProtectedRoute>} />
          <Route path='/bet' element={<ProtectedRoute><Bet/></ProtectedRoute>} />
          <Route path='/ranking' element={<ProtectedRoute><Rank/></ProtectedRoute>} />
          <Route path='/admin' element={<ProtectedRoute><Admin/></ProtectedRoute>} />
          <Route path='/*' element={<ProtectedRoute><Navigate to='/' /></ProtectedRoute>} />
        </Routes>
      </AppTheme>
    </AuthProvider>
  );
}

export default App;
