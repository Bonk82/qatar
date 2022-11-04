
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Home = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  // console.log(user);
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error(error.message);
    }
  };


  return (
    <>
      <p className="text-xl mb-4">bienvenido {user.displayName || user.email}</p>
      <div>Home <Button variant="contained">Hello World</Button> <Button color='primary' onClick={handleLogout} variant="outlined">Cerrar Sesión</Button></div>
    </>
  )
}
