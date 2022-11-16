import { Alert, Box, Button, Checkbox, FormControlLabel, FormGroup, IconButton, InputLabel, MenuItem, OutlinedInput, Select, Slide, Snackbar, TextField, Typography } from "@mui/material"
import { DataGrid, esES } from "@mui/x-data-grid";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import alasql from "alasql";
import moment from "moment";
import { useEffect } from "react";
import { useState } from "react"
import { actualizar, guardar, listar } from "../connection/firebase";
import { Navbar } from "./Navbar"
import SaveAsIcon from '@mui/icons-material/SaveAs';
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

let equiposAll = [];

export const Admin = () => {
  const {user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false)
  const [partidos, setPartidos] = useState([])
  const [equipos, setEquipos] = useState([]);
  const [partido, setPartido] = useState({equipoA:'',golesA:0,equipoB:'',golesB:0,fechaPartido:moment().toDate().setMinutes(0),finalizado:false});
  const [alerta, setAlerta] = useState([false,'success','']);

  useEffect(() => {
    (user.rol !== 'administrador') ? navigate('/'): setIsAdmin(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])
  
  useEffect(() => {
      cargarEquipos();
      listarPartidos();
  }, [])

  const onChangeScore = async (e)=>{
    console.log('score',e);
    try {
      const nuevoObj  = {golesA:e.golesA,golesB:e.golesB,finalizado:true}
      await actualizar('partido',e.id,nuevoObj);
      await actualizarPuntuacion(e);
      await puntuarApuestas(e);
      console.log('ya se actualizo');
    } catch (error) {
      setAlerta(true,'danger','Marcador actualizado con éxito!')
    } finally{
      setAlerta(true,'success','Marcador actualizado con éxito!')
    }
  }

  const actualizarPuntuacion = async (data) =>{
    console.log(data);
    let ptsA=0;
    if(data.golesA > data.golesB) ptsA=3;
    if(data.golesA === data.golesB) ptsA=1;
    //para equipo A
    let elEquipo = equiposAll.filter(f=>f.nombre === data.equipoA)[0];
    let equipoAct = {
      jugados : parseInt(elEquipo.jugados || 0)+1,
      ganados : parseInt(elEquipo.ganados || 0) + ptsA===3?1:0,
      empatados : parseInt(elEquipo.empatados || 0) + ptsA===1?1:0,
      perdidos : parseInt(elEquipo.pertidos || 0) + ptsA===0?1:0,
      favor : parseInt(elEquipo.favor || 0) + data.golesA,
      contra : parseInt(elEquipo.contra || 0) + data.golesB,
      diferencia : parseInt(elEquipo.diferencia || 0) + (data.golesA - data.golesB),
      puntos : parseInt(elEquipo.puntos || 0) + ptsA,      
    }
    await actualizar('equipo',elEquipo.id,equipoAct);
    //para equipo B
    elEquipo = equiposAll.filter(f=>f.nombre === data.equipoB)[0];
    equipoAct = {
      jugados : parseInt(elEquipo.jugados || 0)+1,
      ganados : parseInt(elEquipo.ganados || 0) + ptsA===0?1:0,
      empatados : parseInt(elEquipo.empatados || 0) + ptsA===1?1:0,
      perdidos : parseInt(elEquipo.pertidos || 0) + ptsA===3?1:0,
      favor : parseInt(elEquipo.favor || 0) + data.golesB,
      contra : parseInt(elEquipo.contra || 0) + data.golesA,
      diferencia : parseInt(elEquipo.diferencia || 0) + (data.golesB - data.golesA),
      puntos : parseInt(elEquipo.puntos || 0) + (ptsA===0?3:ptsA===3?0:1),      
    }
    await actualizar('equipo',elEquipo.id,equipoAct);
  }

  const puntuarApuestas = async (data) =>{
    const apuestas = await listar('apuesta');
    const factorA = equiposAll.filter(f=>f.nombre === data.equipoA)[0]?.factor;
    const factorB = equiposAll.filter(f=>f.nombre === data.equipoB)[0]?.factor;
    apuestas.map(e=>{
      let puntaje = 0
      if(data.golesA === e.golesA) puntaje+=1;
      if(data.golesB === e.golesB) puntaje+=1;
      if(data.golesA === e.golesA && data.golesB === e.golesB) puntaje+=1;
      if(data.golesA > data.golesB && e.golesA > e.golesB) puntaje += (2*factorA)
      if(data.golesA < data.golesB && e.golesA < e.golesB) puntaje += (2*factorB)
      if(data.golesA === data.golesB && e.golesA === e.golesB) puntaje += 2
      //TODO: agregar la valoracion del factor de equipo y el tiempo antes del partido
      e.puntos = puntaje;
      console.log('laApuesta',e);
      return e;
    });

    apuestas.forEach(async (e) => {
      try {
        await actualizar('apuesta',e.id,{puntos:e.puntos})
        console.log('apuesta actualizada',e.id);
      } catch (error) {
        console.log(error);
      }
    });
  }

  const colPartidos = [
    {field: 'Acciones', headerName: 'Acciones', sortable: false, width:80,
      renderCell: (params) => {
        return <IconButton onClick={()=>onChangeScore(params.row)} title='Actualizar Score' color='success'><SaveAsIcon fontSize="large"/></IconButton>;
      },
    },
    {field:'equipoA',headerName:'Equipo', minWidth:110, flex:0.5, align:'center'
    , renderCell: (params) =><figure style={{textAlign:'center'}}>
      <img title={`${params.row.equipoA}`} width='70' src={`../assets/${params.row.equipoA}.png`} alt='X'/>
      <figcaption>{`${params.row.equipoA}`}</figcaption>
    </figure>},
    {field:'golesA',headerName:'Goles', width: 70,editable:true,type:'number',min:0,max:9,align:'center', renderCell:(params)=>{
      return <Typography variant="h3">{params.row.golesA}</Typography>
    }},
    {field:'equipoB',headerName:'Equipo', minWidth:110, flex:0.5, align:'center'
    , renderCell: (params) =><figure style={{textAlign:'center'}}>
      <img title={`${params.row.equipoB}`} width='70' src={`../assets/${params.row.equipoB}.png`} alt='X'/>
      <figcaption>{`${params.row.equipoB}`}</figcaption>
    </figure>},
    {field:'golesB',headerName:'Goles', width: 70,editable:true,type:'number',min:0,max:9,align:'center', renderCell:(params)=>{
      return <Typography variant="h3">{params.row.golesB}</Typography>
    }},
    {field:'fechaPartidoStr',headerName:'Fecha Partido', width: 120,editable:false},
    {field:'id',headerName:'ID'},
  ]

  const cargarEquipos = async () =>{
    let resp = await listar('equipo');
    // let respi = resp.sort((a,b)=> a.nombre - b.nombre);
    let respi = alasql('select * from ? order by nombre',[resp])
    console.log('equipos',respi);
    equiposAll = respi;
    setEquipos(respi);
  }

  const listarPartidos = async()=>{
    let resp = await listar('partido');
    resp.map(e=>{
      e.fechaPartidoStr = moment(e.fechaPartido.toDate()).format('DD/MMM HH:mm');
      return e
    })
    // let respi = resp.sort((a,b)=> new Date(a.fechaPartido).getTime() - new Date(b.fechaPartido).getTime());
    resp = alasql('select * from ? order by fechaPartido',[resp])
    console.log('partidos',resp);
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
      setEquipos(equiposAll);
      listarPartidos();
    } catch (error) {
      console.log(error.code,error.message);
    }
    console.log('registrado');
  }

  const handleChange = ({target:{value,name}})=>{
    setPartido({...partido,[name]:value})
    console.log(document.querySelector('#faseGrupos').value);
    const grupo = equipos.filter(f=>f.nombre === value)[0]?.grupo;
    const pivot = equipos.filter(f=>f.grupo === grupo);
    setEquipos(pivot); 
  }

  const handleChangeFecha = (newValue) => {
    setPartido({...partido,fechaPartido:newValue});
  };

  const handleClose = ()=>{
    setAlerta(false);
  }

  const slideAlert = (props) => {
    return <Slide {...props} direction="up" />;
  }


  return (
    <>
    <Navbar/>
    {isAdmin && 
    <Box component='main' sx={{backgroundColor:'whitesmoke',height:'100vh',width:'100vw',display:'flex',flexDirection:{xs:'column',md:'row'},justifyContent:'center',gap:2}} >
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{alignItems:'center',width:{xs:'100vw',md:700},mt:2,paddingX:1}}>
        <Typography variant="h5" color='primary' sx={{fontWeight:500,backgroundColor:'secondary.main',borderRadius:2,pl:4}}>Registro de Partidos</Typography>
        <FormGroup>
          <FormControlLabel control={<Checkbox id="faseGrupos" defaultChecked />} label="Fase de grupos" />
        </FormGroup>
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
        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3}}>Registrar</Button>
      </Box>
      <Box sx={{ height: 450, width:{xs:'100vw',md:700},justifyContent:'center',mt:2,paddingX:1 }}>
        <Typography variant="h5" color='primary' sx={{fontWeight:500,backgroundColor:'secondary.main',borderRadius:2,pl:4,mb:1}}>Actualización de Resultados</Typography>
        <DataGrid
          rows={partidos}
          columns={colPartidos}
          pageSize={10}
          rowsPerPageOptions={[10]}
          disableSelectionOnClick
          experimentalFeatures={{ newEditingApi: true }}
          columnVisibilityModel={{id:false}}
          rowHeight={80}
          // sortModel={[{field:'fechaPartido'}]}
          localeText={esES.components.MuiDataGrid.defaultProps.localeText}
        />
      </Box>
    </Box>
    }
    <Snackbar onClose={handleClose} open={alerta[0]} TransitionComponent={slideAlert} autoHideDuration={6000} anchorOrigin={{vertical:'top',horizontal:'right'}}>
      <Alert severity={alerta[1]} sx={{ width: '100%' }}> {alerta[2]}</Alert>
    </Snackbar>
    </>
  )
}
