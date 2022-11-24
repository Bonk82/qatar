import { Alert, Backdrop, Box, Button, Checkbox, CircularProgress, FormControlLabel, FormGroup, IconButton, InputLabel, MenuItem, OutlinedInput, Select, Slide, Snackbar, TextField, Typography } from "@mui/material"
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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

let equiposAll = [];
let apuestasAll = [];

export const Admin = () => {
  const {user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false)
  const [partidos, setPartidos] = useState([])
  const [equipos, setEquipos] = useState([]);
  const [partido, setPartido] = useState({equipoA:'',golesA:0,equipoB:'',golesB:0,fechaPartido:moment().toDate().setMinutes(0),finalizado:false});
  const [alerta, setAlerta] = useState([false,'success','']);
  const [openSpinner, setOpenSpinner] = useState(false);

  useEffect(() => {
    (user.rol !== 'administrador') ? navigate('/'): setIsAdmin(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])
  
  useEffect(() => {
      cargarEquipos();
      listarPartidos();
      listarApuestas();
  }, [])

  const onChangeScore = async (e)=>{
    setOpenSpinner(true);
    // console.log('score',e);
    try {
      const nuevoObj  = {golesA:Number(e.golesA),golesB:Number(e.golesB),finalizado:true}
      await actualizar('partido',e.id,nuevoObj);
      await actualizarPuntuacion(e);
      await puntuarApuestas(e);
      // console.log('ya se actualizo');
    } catch (error) {
      setAlerta([true,'danger','Error al actualizar marcador'])
    } finally{
      await listarPartidos();
      setAlerta([true,'success','Marcador actualizado con éxito!'])
      setOpenSpinner(false);
    }
  }

  const actualizarPuntuacion = async (data) =>{
    // console.log(data);
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
    const apuestas = apuestasAll.filter(f=>f.partidoID === data.id);
    // console.log('las apuestas',apuestas,apuestasAll);
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
      // console.log('laApuesta',e);
      return e;
    });

    apuestas.forEach(async (e) => {
      try {
        await actualizar('apuesta',e.id,{puntos:e.puntos})
        // console.log('apuesta actualizada',e.id);
      } catch (error) {
        console.log(error);
      }
    });
  }

  const listarApuestas = async () =>{
    setOpenSpinner(true);
    apuestasAll = await listar('apuesta');
    setOpenSpinner(false);
  }

  const colPartidos = [
    {field: 'Acciones', headerName: 'Acciones', sortable: false, minWidth:50,flex:1,
      renderCell: (params) => {
        return <IconButton onClick={()=>onChangeScore(params.row)} title='Actualizar Score' color={params.row.finalizado? 'error':'success'}>
                {params.row.finalizado? <CheckCircleIcon fontSize="large"/>:<SaveAsIcon fontSize="large"/>} 
              </IconButton>;
      },
    },
    {field:'equipoA',headerName:'Equipo', minWidth:90, flex:0.5, align:'center'
    , renderCell: (params) =><figure style={{textAlign:'center'}}>
      <img title={`${params.row.equipoA}`} width='70' src={`../assets/${params.row.equipoA}.png`} alt='X'/>
      <figcaption>{`${params.row.equipoA}`}</figcaption>
    </figure>},
    {field:'golesA',headerName:'Goles', minWidth:50,flex:1,editable:true,type:'number',min:0,max:9,align:'center', renderCell:(params)=>{
      return <Typography variant="h4">{params.row.golesA}</Typography>
    }},
    {field:'golesB',headerName:'Goles', minWidth:50,flex:1,editable:true,type:'number',min:0,max:9,align:'center', renderCell:(params)=>{
      return <Typography variant="h4">{params.row.golesB}</Typography>
    }},
    {field:'equipoB',headerName:'Equipo', minWidth:90, flex:0.5, align:'center'
    , renderCell: (params) =><figure style={{textAlign:'center'}}>
      <img title={`${params.row.equipoB}`} width='70' src={`../assets/${params.row.equipoB}.png`} alt='X'/>
      <figcaption>{`${params.row.equipoB}`}</figcaption>
    </figure>},
    {field:'fechaPartidoStr',headerName:'Fecha Partido', minWidth:100,flex:1,editable:false},
    {field:'id',headerName:'ID'},
  ]

  // const colEquipos = [
  //   {field: 'Acciones', headerName: 'Acciones', sortable: false, minWidth:50,flex:1,
  //     renderCell: (params) => {
  //       return <IconButton onClick={()=>resetearEquipo(params.row)} title='Recetear' color='success'><SaveAsIcon fontSize="large"/></IconButton>;
  //     },
  //   },
  //   {field:'nombre',headerName:'Equipo', minWidth:100, flex:1, align:'center'},
  //   {field:'jugados',headerName:'Partidos', minWidth:50, flex:1, align:'center'},
  //   {field:'id',headerName:'ID'},
  // ]

  // const resetearEquipo = async (data)=>{
  //   console.log('equipo reset',data);
  //   const newEquipo = {
  //     jugados:0,
  //     ganados:0,
  //     empatados:0,
  //     perdidos:0,
  //     favor:0,
  //     contra:0,
  //     diferencia:0,
  //     puntos:0,
  //   }
  //   await actualizar('equipo',data.id,newEquipo);
  // }

  const cargarEquipos = async () =>{
    let resp = await listar('equipo');
    // let respi = resp.sort((a,b)=> a.nombre - b.nombre);
    let respi = alasql('select * from ? order by nombre',[resp])
    // console.log('equipos',respi);
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
    resp = await alasql('select * from ? order by fechaPartido',[resp])
    // console.log('partidos',resp);
    setPartidos(resp);
  }

  const handleSubmit = async(e)=>{
    e.preventDefault();
    if(!partido.equipoA || !partido.equipoB || new Date(partido.fechaPartido) < new Date('2022-11-20')){
      setAlerta([true,'warning','Debe llenar todos los campos']);
      return
    }
    setOpenSpinner(true);
    const data = new FormData(e.currentTarget);
    const part = {nombre: data.get('equipoA'),factor: Number(data.get('golesA'))}
    // console.log(partido,part);
    try {
      const nuevoPartido = await guardar('partido',partido);
      setAlerta([true,'success','Partido registrado con éxito!']);
      // console.log(nuevoPartido);
      document.querySelector('#equipoA').value = '';
      document.querySelector('#equipoB').value = '';
      document.querySelector('#equipoA').focus();
      setEquipos(equiposAll);
      listarPartidos();
      setOpenSpinner(false);
    } catch (error) {
      console.log(error.code,error.message);
      setOpenSpinner(false);
    }
    // console.log('registrado');
  }

  const handleChange = ({target:{value,name}})=>{
    setPartido({...partido,[name]:value})
    // console.log(document.querySelector('#faseGrupos').value);
    const grupo = equipos.filter(f=>f.nombre === value)[0]?.grupo;
    const pivot = equipos.filter(f=>f.grupo === grupo);
    setEquipos(pivot); 
  }

  const handleChangeFecha = (newValue) => {
    setPartido({...partido,fechaPartido:newValue});
  };

  const handleClose = ()=>{
    setAlerta([false,'success','vacio']);
  }

  const slideAlert = (props) => {
    return <Slide {...props} direction="up" />;
  }


  return (
    <>
    <Navbar/>
    {isAdmin && 
    <Box component='main' sx={{backgroundColor:'whitesmoke',minHeight:'100vh',width:'100vw',display:'flex',flexDirection:{xs:'column',md:'row'},justifyContent:'center',gap:2}} >
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{alignItems:'center',width:{xs:'100vw',md:700},mt:2,paddingX:0.5}}>
        <Typography variant="h5" color='primary' sx={{fontWeight:500,backgroundColor:'secondary.main',borderRadius:2,pl:4}}>Registro de Partidos</Typography>
        <FormGroup>
          <FormControlLabel sx={{pl:4}} control={<Checkbox id="faseGrupos" defaultChecked />} label="Fase de grupos" />
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
          size="small"
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
          size="small"
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
              renderInput={(params) => <TextField size="small" sx={{width:'50%'}} {...params} />}
            />
          </LocalizationProvider>
        </Box>
        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3}}>Registrar</Button>
      </Box>
      <Box sx={{ height:{xs:350,md:700}, width:{xs:'100vw',md:700},justifyContent:'center',mt:2,paddingX:0.5}}>
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
      {/* <Box sx={{ height:{xs:350,md:700}, width:{xs:'100vw',md:700},justifyContent:'center',mt:2,paddingX:0.5}}>
        <Typography variant="h5" color='primary' sx={{fontWeight:500,backgroundColor:'secondary.main',borderRadius:2,pl:4,mb:1}}>Recetear Equipos</Typography>
        <DataGrid
          rows={equipos}
          columns={colEquipos}
          pageSize={10}
          rowsPerPageOptions={[10]}
          disableSelectionOnClick
          experimentalFeatures={{ newEditingApi: true }}
          columnVisibilityModel={{id:false}}
          rowHeight={80}
          // sortModel={[{field:'fechaPartido'}]}
          localeText={esES.components.MuiDataGrid.defaultProps.localeText}
        />
      </Box> */}
    </Box>
    }
    <Snackbar onClose={handleClose} open={alerta[0]} TransitionComponent={slideAlert} autoHideDuration={6000} anchorOrigin={{vertical:'top',horizontal:'right'}}>
      <Alert severity={alerta[1]} sx={{ width: '100%' }}> {alerta[2]}</Alert>
    </Snackbar>
    <Backdrop sx={{ color: 'primary.main', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={openSpinner}>
      <CircularProgress color="inherit" size='7rem' thickness={5} />
    </Backdrop>
    </>
  )
}
