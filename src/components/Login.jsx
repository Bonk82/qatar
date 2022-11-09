import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
// import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Alert } from '@mui/material';
import { Google } from '@mui/icons-material';

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © Bonk '}
      {/* <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{' '} */}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

// const theme = createTheme();

export const Login = () => {
  const [user, setUser] = useState({email:'',password:''});
  const [error, setError] = useState();
  const {login, loginWithGoogle, resetPassword}= useAuth();
  const navigate = useNavigate();

  //mejor opcion para ir setenado los valores de cada control del form 
  // const handleChange = ({ target: { value, name } }) => setUser({ ...user, [name]: value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError();
    const data = new FormData(event.currentTarget);
    const usuario = {email: data.get('email'),password: data.get('password')}
    console.log(usuario);
    setUser(usuario)
    console.log('el user',user);//dentro de la misma funcion no agarra el valor actulizado del setState
    // crearUsuario(data.get('email'),data.get('password'));
    try {
      await login(usuario.email,usuario.password);
      navigate('/');
    } catch (error) {
      console.log(error.code,error.message);
      // if(error.code === 'auth/user-not-found') setError('Usuario no registrado!');
      setError('Correo o Contraseña Incorrectos!');
    }
  };

  const handleGoogleSignin = async () => {
    try {
      await loginWithGoogle();
      navigate("/");
    } catch (error) {
      setError(error.message);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!user.email) return setError("Write an email to reset password");
    try {
      await resetPassword(user.email);
      setError('We sent you an email. Check your inbox')
    } catch (error) {
      setError(error.message);
    }
  };
  
  return (
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5" color="primary.main">
            Iniciar Sesión
          </Typography>
          {error && (<Alert severity="error">{error}</Alert>)} 
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Correo Electrónico"
              name="email"
              autoComplete="email"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type="password"
              id="password"
              autoComplete="current-password"
            />
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Recordarme"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3 }}
            >
              Ingresar
            </Button>
            <Button type='button' title='Iniciar con tu cuenta Google' fullWidth onClick={handleGoogleSignin} variant="outlined" sx={{ mt: 1, mb: 2 }}><Google/> oogle</Button>
            <Grid container>
              {/* <Grid item xs>
                <Link href="#" variant="body2">
                  Olvidaste tu Contraseña
                </Link>
              </Grid> */}
              <Grid item>
                <Link href="/register" variant="body2">
                  {"No tienes cuenta? Regístrate"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Copyright sx={{ mt: 8, mb: 4 }} />
      </Container>
  )
}
