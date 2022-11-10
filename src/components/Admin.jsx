import { Box, Button, InputLabel, MenuItem, Select, TextField } from "@mui/material"
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment, { now } from "moment";
import { useEffect } from "react";
import { useState } from "react"
import { listar } from "../connection/firebase";
import { Navbar } from "./Navbar"

export const Admin = () => {
  useEffect(() => {
    cargarEquipos();
  }, [])
  
  const [equipos, setEquipos] = useState([]);
  const [partido, setPartido] = useState({equipoA:'',golesA:0,equipoB:'',golesB:0,fechaPartido:moment().toDate().setMinutes(0)})

  const cargarEquipos = async () =>{
    let resp = await listar('equipo');
    resp = resp.sort((a,b)=>a.nombre -b.nombre);
    console.log(resp);
    setEquipos(resp);
  }

  const handleSubmit = async(e)=>{
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const part = {nombre: data.get('equipoA'),factor: Number(data.get('golesA'))}
    console.log(partido,part);
    // try {
    //   const nuevoEquipo = await guardar('equipo',partido);
    //   setAlerta([true,'success','Equipo registrado con éxito!']);
    //   console.log(nuevoEquipo);
    //   document.querySelector('#nombre').value = '';
    //   document.querySelector('#factor').value = 1;
      
    //   document.querySelector('#nombre').focus();
    //   listarEquipos();
    // } catch (error) {
    //   console.log(error.code,error.message);
    // }
    // console.log('registrado');
  }

  const handleChange = ({target:{value,name}})=>{
    setPartido({...partido,[name]:value})
  }

  const handleChangeFecha = (newValue) => {
    setPartido({...partido,fechaPartido:newValue});
  };

  return (
    <>
    <Navbar/>
    <Box component='main' sx={{textAlign:'center'}} >
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1,marginTop: 8,display: 'flex', flexDirection: 'column', alignItems: 'center',width:500}}>
        <InputLabel id="equipoA">Equipo A</InputLabel>
        <Select
          labelId="equipoA"
          id="equipoA"
          name="equipoA"
          fullWidth
          value={partido.equipoA}
          label="Equipo A"
          onChange={handleChange}
        >{
          equipos.map(e=>{
            return <MenuItem key={e.nombre} value={e.nombre}>{e.nombre}</MenuItem>
          })
        }
        </Select>
        <InputLabel id="equipoB">Equipo B</InputLabel>
        <Select
          labelId="equipoB"
          id="equipoB"
          name="equipoB"
          fullWidth
          value={partido.equipoB}
          label="Equipo B"
          onChange={handleChange}
        >{
          equipos.map(e=>{
            return <MenuItem key={e.nombre} value={e.nombre}>{e.nombre}</MenuItem>
          })
        }
        </Select>
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
            views={['year','month','day','hours']}
            renderInput={(params) => <TextField {...params} />}
          />
        </LocalizationProvider>
        {/* <InputLabel id="fechaPartido">Horario</InputLabel>
        <Select
          labelId="fechaPartido"
          id="fechaPartido"
          name="fechaPartido"
          fullWidth
          value={partido.fechaPartido}
          label="fechaPartido"
          onChange={handleChange}
        >
          <MenuItem value='06:00'>06:00</MenuItem>
        </Select> */}
        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3 }}>Registrar</Button>
      </Box>
    </Box>
    </>
  )
}
