import { Alert, Box, Slide, Snackbar, TextField, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { guardar, listar } from '../connection/firebase';
import { useAuth } from '../context/AuthContext';
import { Navbar } from './Navbar';
import { DataGrid } from '@mui/x-data-grid';
import { Public } from '@mui/icons-material';

export const Home = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  // const [alerta, setAlerta] = useState({open:false,tipo:'success',msg:''});
  const [alerta, setAlerta] = useState([false,'success','']);
  const [equipos, setEquipos] = useState([]);
  // console.log(user);

  const columnas = [
    {field:'nombre',headerName:'Equipo', width: 200},
    {field:'factor',headerName:'Factor', width: 70},
  ] 

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleSubmit = async(e)=>{
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const equipo = {nombre: data.get('nombre'),factor: Number(data.get('factor'))}
    console.log(equipo);
    if(!equipo.factor>0) {
      setAlerta([true,'warning','No puede registrar FACTOR = 0']);
      return;
    }
    try {
      const nuevoEquipo = await guardar('equipo',equipo);
      setAlerta([true,'success','Equipo registrado con éxito!']);
      console.log(nuevoEquipo);
      document.querySelector('#nombre').value = '';
      document.querySelector('#factor').value = 1;
      
      document.querySelector('#nombre').focus();
      listarEquipos();
    } catch (error) {
      console.log(error.code,error.message);
    }
    console.log('registrado');
  }

  const handleClose = ()=>{
    setAlerta(false);
  }

  const listarEquipos = async ()=>{
    const dtsEquipos = await listar('equipo');
    console.log({dtsEquipos});
    setEquipos (dtsEquipos);
  }

  const slideAlert = (props) => {
    return <Slide {...props} direction="down" />;
  }


  return (
    <>
      <Navbar/>
      <Typography>bienvenido {user.displayName || user.email}</Typography>
      <div style={{color:'primary.main'}}>Home <Button variant="contained" color='secondary' onClick={()=>listar('usuarios')}>Hello World</Button> <Button color='primary' onClick={handleLogout} variant="outlined">Cerrar Sesión</Button></div>
      <Box component='main' >
          <Typography>Esto es la prueba</Typography>
      </Box>
      <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box sx={{ height: 400, width: 300,justifyContent:'center' }}>
            <DataGrid
              rows={equipos}
              columns={columnas}
              pageSize={5}
              rowsPerPageOptions={[5]}
              disableSelectionOnClick
              experimentalFeatures={{ newEditingApi: true }}
            />
          </Box>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="nombre"
              label="Equipo"
              name="nombre"
              autoComplete="nombre"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="factor"
              label="Factor"
              id="factor"
              type='number'
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3 }}
            >
              Registrar
            </Button>
          </Box>

          <Box sx={{ height: 400, width: 900,justifyContent:'center',mt:5 }}>
            {equipos.map((e,i)=>{
              // console.log(e);
              return (
                <div>
                  <label key={e.id}>{e.nombre}</label>
                  <TextField key={i} label='goles'></TextField>
                </div>
              )
            })}
          </Box>
        </Box>
        <Snackbar onClose={handleClose} open={alerta[0]} TransitionComponent={slideAlert} autoHideDuration={3000} anchorOrigin={{vertical:'top',horizontal:'right'}}>
          <Alert severity={alerta[1]} sx={{ width: '100%' }}> {alerta[2]}</Alert>
        </Snackbar>
    </>
  )
}
