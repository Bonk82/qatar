import { Alert, Box, Button, InputLabel, MenuItem, OutlinedInput, Select, Slide, Snackbar, TextField, Typography } from "@mui/material"
import { DataGrid } from "@mui/x-data-grid";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import alasql from "alasql";
import moment, { now } from "moment";
import { useEffect } from "react";
import { useState } from "react"
import { guardar, listar, listarEquipos } from "../connection/firebase";
import { Navbar } from "./Navbar"


export const Admin = () => {

  useEffect(() => {
    cargarEquipos();
    listarPartidos();
  }, [])

  const colPartidos = [
    {field:'equipoA',headerName:'Equipo A', width: 140,editable:false},
    {field:'golesA',headerName:'Goles A', width: 80,editable:true,type:'number',min:0,max:9},
    {field:'equipoB',headerName:'Equipo B', width: 140,editable:false},
    {field:'golesB',headerName:'Goles B', width: 80,editable:true,type:'number'},
    {field:'fechaPartido',headerName:'Fecha Partido', width: 500,editable:false},
  ]
  
  const [partidos, setPartidos] = useState([])
  const [equipos, setEquipos] = useState([]);
  const [partido, setPartido] = useState({equipoA:'',golesA:0,equipoB:'',golesB:0,fechaPartido:moment().toDate().setMinutes(0),finalizado:false});
  const [alerta, setAlerta] = useState([false,'success','']);

  const cargarEquipos = async () =>{
    let resp = await listar('equipo');
    // let respi = resp.sort((a,b)=> a.nombre - b.nombre);
    let respi = alasql('select * from ? order by nombre',[resp])
    console.log('equipos',respi);
    setEquipos(respi);
  }

  const listarPartidos = async()=>{
    let resp = await listar('partido');
    resp.map(e=>{
      e.fechaPartido = moment(e.fechaPartido.toDate()).format('DD/MMM HH:mm');
      return e
    })
    resp = resp.sort((a,b)=> new Date(a.fechaPartido) - new Date(b.fechaPartido));
    console.log(resp);
    setPartidos(resp);
  }

  const handleSubmit = async(e)=>{
    e.preventDefault();
    if(!partido.equipoA || !partido.equipoB || new Date(partido.fechaPartido) < new Date('2022-11-20')){
      setAlerta([true,'warning','Debe llenar todos los campos']);
      return
    }
    const data = new FormData(e.currentTarget);
    const part = {nombre: data.get('equipoA'),factor: Number(data.get('golesA'))}
    console.log(partido,part);
    try {
      const nuevoPartido = await guardar('partido',partido);
      setAlerta([true,'success','Partido registrado con éxito!']);
      console.log(nuevoPartido);
      document.querySelector('#equipoA').value = '';
      document.querySelector('#equipoB').value = '';
      document.querySelector('#equipoA').focus();
      listarPartidos();
    } catch (error) {
      console.log(error.code,error.message);
    }
    console.log('registrado');
  }

  const handleChange = ({target:{value,name}})=>{
    setPartido({...partido,[name]:value})
  }

  const handleChangeFecha = (newValue) => {
    setPartido({...partido,fechaPartido:newValue});
  };

  const handleClose = ()=>{
    setAlerta(false);
  }

  const slideAlert = (props) => {
    return <Slide {...props} direction="down" />;
  }

  return (
    <>
    <Navbar/>
    <Box component='main' sx={{backgroundColor:'whitesmoke',height:'100vh',width:'100vw',display:'flex',justifyContent:'center'}} >
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{alignItems:'center',width:{xs:'100vw',md:700}}}>
        <InputLabel color="primary" >Equipo A</InputLabel>
        <Select
          labelId="equipoA"
          id="equipoA"
          name="equipoA"
          input={<OutlinedInput />}
          fullWidth
          value={partido.equipoA}
          label="Equipo A"
          displayEmpty
          onChange={handleChange}
        >{
          equipos.map(e=>{
            return <MenuItem key={e.nombre} value={e.nombre}>{e.nombre}</MenuItem>
          })
        }
        </Select>
        <InputLabel color="primary" >Equipo B</InputLabel>
        <Select
          labelId="equipoB"
          id="equipoB"
          name="equipoB"
          fullWidth
          value={partido.equipoB}
          label="Equipo B"
          input={<OutlinedInput />}
          onChange={handleChange}
        >{
          equipos.map(e=>{
            return <MenuItem key={e.nombre} value={e.nombre}>{e.nombre}</MenuItem>
          })
        }
        </Select>
        <Box sx={{mt:2}}>
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <DateTimePicker
              label="Fecha y Hora Partido"
              fullWidth
              value={partido.fechaPartido}
              onChange={handleChangeFecha}
              ampm = {false}
              // maxDate={'20221218'}
              // maxTime={'15:00:00'}
              // minTime={'06:00:00'}
              inputFormat='DD/MM/YYYY HH:mm'
              disablePast
              views={['year','month','day','hours']}
              renderInput={(params) => <TextField {...params} />}
            />
          </LocalizationProvider>
        </Box>
        <Box sx={{ height: 450, width:{xs:'98vw',md:700},justifyContent:'center',mt:4 }}>
            <DataGrid
              rows={partidos}
              columns={colPartidos}
              pageSize={10}
              rowsPerPageOptions={[10]}
              disableSelectionOnClick
              experimentalFeatures={{ newEditingApi: true }}
            />
          </Box>
        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3}}>Registrar</Button>
      </Box>
    </Box>
    <Snackbar onClose={handleClose} open={alerta[0]} TransitionComponent={slideAlert} autoHideDuration={3000} anchorOrigin={{vertical:'top',horizontal:'right'}}>
      <Alert severity={alerta[1]} sx={{ width: '100%' }}> {alerta[2]}</Alert>
    </Snackbar>
    </>
  )
}
