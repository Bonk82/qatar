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
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Alert, FormControl } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import { useState } from 'react';
import { guardar } from '../connection/firebase';


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

export const Register = () => {
  const [user, setUser] = useState({email:'',password:''});
  const [error, setError] = useState();
  const {signup}= useAuth();
  const navigate = useNavigate();
  const [grupo, setGrupo] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError();
    if(!grupo){
      setError('Debe seleccionar algun grupo');
      return true;
    } 
    const data = new FormData(event.currentTarget);
    console.log({
      email: data.get('email'),
      password: data.get('password'),
      nombre:data.get('nombre'),
      grupo:data.get('grupo')
    });
    setUser({email:data.get('email'),password:data.get('password')})
    console.log('el user',user);
    // crearUsuario(data.get('email'),data.get('password'));
    try {
      const resp = await signup(data.get('email'),data.get('password'));
      console.log('signup',resp);
      const newUser = {nombre:data.get('nombre'),tipo:'usuario',estado:'lectura',userID:resp.user?.uid,grupo};
      await guardar('usuario',newUser);
      navigate('/');
    } catch (error) {
      console.log(error.code,error.message);
      if(error.code === 'auth/invalid-email') setError('Correo invalido!');
      if(error.code === 'auth/weak-password') setError('La contraseña debe tener al menos 6 caracteres!');
      if(error.code === 'auth/email-already-in-use') setError('El correo ya fue registrado!');
    }
  };

  const handleChangeGrupo = (e)=>{
    setGrupo(e.target.value);
  }

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
          <Typography component="h1" variant="h5">
            Registrar Cuenta
          </Typography>
          {error && (<Alert severity="error">{error}</Alert>)} 
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <FormControl fullWidth sx={{pl:2}}>
                <InputLabel id="grupo" sx={{pl:2}}>Grupo</InputLabel>
                <Select
                  labelId="grupo"
                  id="demo-simple-select"
                  value={grupo}
                  label="Age"
                  onChange={handleChangeGrupo}
                  autoFocus
                >
                  <MenuItem value={'UPRE'}>UPRE</MenuItem>
                  <MenuItem value={'TUERCEBOTAS FUTBOL CLUB'}>TUERCEBOTAS FUTBOL CLUB</MenuItem>
                </Select>
              </FormControl>
              <Grid item xs={12}>
                <TextField
                  name="nombre"
                  required
                  fullWidth
                  id="nombre"
                  label="Nombre"
                  type="text"
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
  );
}
