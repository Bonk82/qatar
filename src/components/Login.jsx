import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
// import FormControlLabel from '@mui/material/FormControlLabel';
// import Checkbox from '@mui/material/Checkbox';
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
import { guardar, listar } from '../connection/firebase';
import { useEffect } from 'react';

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
  const [usuario, setUsuario] = useState({email:'',password:''});
  const [error, setError] = useState();
  const {login, loginWithGoogle, resetPassword}= useAuth();
  const navigate = useNavigate();
  // const logeado = useAuth();
  const {user} = useAuth();

  useEffect(() => {
    console.log('revisando',user);
    if(user?.rol) navigate('/');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])
  

  //mejor opcion para ir setenado los valores de cada control del form 
  // const handleChange = ({ target: { value, name } }) => setUser({ ...user, [name]: value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError();
    const data = new FormData(event.currentTarget);
    const usuario = {email: data.get('email'),password: data.get('password')}
    console.log(usuario);
    setUsuario(usuario)
    console.log('el user',usuario);//dentro de la misma funcion no agarra el valor actulizado del setState
    // crearUsuario(data.get('email'),data.get('password'));
    try {
      const resp = await login(usuario.email,usuario.password);
      console.log(resp);
      navigate('/');
    } catch (error) {
      console.log(error.code,error.message);
      // if(error.code === 'auth/user-not-found') setError('Usuario no registrado!');
      // setError('Correo o Contraseña Incorrectos!');
      (error.code === 'auth/too-many-requests' )? setError('Si no recuerdas tu contraseña, da clic en Olvidaste tu Contraseña'):setError('Correo o Contraseña Incorrectos!');
    }
  };

  const handleGoogleSignin = async () => {
    try {
      const resp = await loginWithGoogle();
      let yaRegistrado = await listar('usuario')
      yaRegistrado = yaRegistrado.filter(f=>f.userID===resp.user?.uid);
      console.log(resp,yaRegistrado);
      if(yaRegistrado.length === 0){
        const newUser = {nombre:resp.user?.displayName,tipo:'usuario',estado:'lectura',userID:resp.user?.uid,grupo:'UPRE'};
        await guardar('usuario',newUser);
      }
      navigate("/");
    } catch (error) {
      setError(error.message);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const data = document.getElementById('email').value;
    if (!data) return setError("Escribe un email valido");
    try {
      await resetPassword(data);
      setError('Ya te enviamos el correo, por favor revisa tus bandejas')
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
            {/* <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Recordarme"
            /> */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3 }}
            >
              Ingresar
            </Button>
            {/* <Button type='button' title='Iniciar con tu cuenta Google' fullWidth onClick={handleGoogleSignin} variant="outlined" sx={{ mt: 1, mb: 2 }}><Google/> oogle</Button> */}
            <Grid container sx={{mt:2}}>
              <Grid item xs>
                <Link sx={{cursor:'pointer'}} onClick={handleResetPassword} variant="body2">
                  Olvidaste tu Contraseña
                </Link>
              </Grid>
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
