import { Box, Button, InputLabel, MenuItem, Select, TextField } from "@mui/material"
import { useEffect } from "react";
import { useState } from "react"
import { listar } from "../connection/firebase";
import { Navbar } from "./Navbar"

export const Admin = () => {
  useEffect(() => {
    cargarEquipos();
  }, [])
  
  const [equipos, setEquipos] = useState([]);
  const [partido, setPartido] = useState({equipoA:'',golesA:0,equipoB:'',golesB:0,fechaPartido:null})

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
        <TextField
          margin="normal"
          required
          fullWidth
          name="golesA"
          label="Goles"
          id="golesA"
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
    </Box>
    </>
  )
}
