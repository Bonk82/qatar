import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
// import FormControlLabel from '@mui/material/FormControlLabel';
// import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
// import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { crearUsuario } from '../connection/firebase';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Alert, Snackbar } from '@mui/material';

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

const theme = createTheme();

export const Register = () => {
  const [user, setUser] = useState({email:'',password:''});
  const [error, setError] = useState();
  const {signup}= useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError();
    const data = new FormData(event.currentTarget);
    console.log({
      email: data.get('email'),
      password: data.get('password'),
    });
    setUser({email:data.get('email'),password:data.get('password')})
    console.log('el user',user);
    // crearUsuario(data.get('email'),data.get('password'));
    try {
      await signup(user.email,user.password);
      navigate('/');
    } catch (error) {
      console.log(error.code,error.message);
      if(error.code === 'auth/invalid-email') setError('Correo invalido!');
      if(error.code === 'auth/weak-password') setError('La contraseña debe tener al menos 6 caracteres!');
      if(error.code === 'auth/email-already-in-use') setError('El correo ya fue registrado!');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            {/* <LockOutlinedIcon /> */}
          </Avatar>
          <Typography component="h1" variant="h5">
            Registrar Cuenta
          </Typography>
          {/* <Snackbar open={Boolean(error)} autoHideDuration={6000}>
            <Alert severity="success" sx={{ width: '100%' }}>{error}</Alert>
          </Snackbar> */}
          {error && (<Alert severity="error">{error}</Alert>)} 
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="firstName"
                  required
                  fullWidth
                  id="firstName"
                  label="Nombres"
                  type="text"
                  autoFocus
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Apellidos"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Correo Electrónico"
                  name="email"
                  placeholder='tucorreo@dominio.com'
                  autoComplete="email"
                  type="email"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Contraseña"
                  type="password"
                  id="password"
                  placeholder='******'
                  autoComplete="new-password"
                />
              </Grid>
              {/* <Grid item xs={12}>
                <FormControlLabel
                  control={<Checkbox value="allowExtraEmails" color="primary" />}
                  label="I want to receive inspiration, marketing promotions and updates via email."
                />
              </Grid> */}
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Registrarme
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="/login" variant="body2">
                  Ya tienes una cuenta? Iniciar Sesión
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Copyright sx={{ mt: 5 }} />
      </Container>
    </ThemeProvider>
  );
}
