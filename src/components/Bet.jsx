import { Alert, Box, IconButton, Slide, Snackbar, Typography } from "@mui/material"
import { DataGrid, esES } from "@mui/x-data-grid"
import moment from "moment";
import { useEffect, useState } from "react";
import { actualizar, guardar, listar } from "../connection/firebase";
import { useAuth } from "../context/AuthContext";
import { Navbar } from "./Navbar"
import PaidIcon from '@mui/icons-material/Paid';
import alasql from "alasql";

export const Bet = () => {

  const {user } = useAuth();
  const [partidos, setPartidos] = useState([])
  // const [apuesta, setApuesta] = useState({golesA:0,golesB:0,partidoID:'',uid:user.uid});
  const [apuestas, setApuestas] = useState([]);
  const [alerta, setAlerta] = useState([false,'success','']);

  useEffect(() => {
    listarPartidos();
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

const onApuesta = async (e)=>{
  console.log('bet',e);
  try {
    const nuevoObj  = {golesA:e.betA,golesB:e.betB,partidoID:e.id,uid:user.uid}
    if(e.apuestaID){
      await actualizar('apuesta',e.apuestaID,nuevoObj);
      console.log('apuesta actualizada',nuevoObj);
      setAlerta(true,'success','Apuesta actualizada, suerte!')
    }else{
      await guardar('apuesta',nuevoObj);
      console.log('apuesta registrada',nuevoObj);
      setAlerta(true,'success','Apuesta registrada, suerte!')
    }
  } catch (error) {
    setAlerta(true,'danger','No se pudo registrar tu apuesta')
  }
}

const listarPartidos = async()=>{
  let part = await listar('partido');
  let bet = await listar('apuesta')
  bet = bet.filter(f=>f.uid===user.uid)
  part.map(e=>{
    e.fechaPartidoStr = moment(e.fechaPartido.toDate()).format('DD/MMM HH:mm');
    e.activo = moment(e.fechaPartido.toDate()).add(-10,'minutes') <= moment() ? 0 : 1 ;//TODO: cambiar days x minutes 
    e.betA = bet.filter(f=>f.partidoID === e.id)[0]?.golesA || 0;
    e.betB = bet.filter(f=>f.partidoID === e.id)[0]?.golesB || 0;
    e.apuestaID = bet.filter(f=>f.partidoID === e.id)[0]?.id;
    e.puntos = bet.filter(f=>f.partidoID === e.id)[0]?.puntos || 0;
    return e
  })

  let pivotPasado = part.filter(f=>f.activo === 0);
  let pivotActivos = part.filter(f=>f.activo === 1);

  // let respi = resp.sort((a,b)=> new Date(a.fechaPartido).getTime() - new Date(b.fechaPartido).getTime());
  pivotActivos = alasql('select * from ? order by fechaPartido',[pivotActivos])
  console.log('partidos y apuestas', pivotPasado,pivotActivos);
  setPartidos(pivotPasado);
  setApuestas(pivotActivos);
}

const colPartidos = [
  {field:'puntos',headerName:'Puntos', width: 70,type:'number'},
  {field:'equipoA',headerName:'Equipo', minWidth:110, flex:0.5, align:'center'
  , renderCell: (params) =><figure>
    <img title={`${params.row.equipoA}`} width='70' src={`../assets/${params.row.equipoA}.png`} alt='X'/>
    <figcaption>{`${params.row.equipoA}`}</figcaption>
  </figure>},
  {field:'golesA',headerName:'Goles', width: 70,type:'number',min:0,max:9},
  {field:'betA',headerName:'Apostado', width: 70,type:'number',min:0,max:9},
  {field:'equipoB',headerName:'Equipo', minWidth:110, flex:0.5, align:'center'
  , renderCell: (params) =><figure>
    <img title={`${params.row.equipoB}`} width='70' src={`../assets/${params.row.equipoB}.png`} alt='X'/>
    <figcaption>{`${params.row.equipoB}`}</figcaption>
  </figure>},
  {field:'golesB',headerName:'Goles', width: 70,type:'number'},
  {field:'betB',headerName:'Apostado', width: 70,type:'number'},
  {field:'fechaPartidoStr',headerName:'Fecha Partido', width: 120},
  {field:'id',headerName:'ID'},
  {field:'apuestaID',headerName:'apuestaID'},
  {field:'activo',headerName:'Activo'},
]
const colApuestas = [
  {field: 'Apostar', headerName: 'Apostar', sortable: false, width:80,
    renderCell: (params) => {
      return <IconButton onClick={()=>onApuesta(params.row)} title='Apostar' color='success'><PaidIcon fontSize="large"/></IconButton>;
    },
  },
  {field:'equipoA',headerName:'Equipo', minWidth:110, flex:0.5, align:'center'
  , renderCell: (params) =><figure style={{textAlign:'center'}}>
    <img title={`${params.row.equipoA}`} width='70' src={`../assets/${params.row.equipoA}.png`} alt='X'/>
    <figcaption>{`${params.row.equipoA}`}</figcaption>
  </figure>},
  {field:'betA',headerName:'Goles', width: 70,editable:true,type:'number',min:0,max:9,align:'center', renderCell:(params)=>{
    return <Typography variant="h3">{params.row.betA}</Typography>
  }},
  {field:'equipoB',headerName:'Equipo', minWidth:110, flex:0.5, align:'center'
  , renderCell: (params) =><figure style={{textAlign:'center'}}>
    <img title={`${params.row.equipoB}`} width='70' src={`../assets/${params.row.equipoB}.png`} alt='X'/>
    <figcaption>{`${params.row.equipoB}`}</figcaption>
  </figure>},
  {field:'betB',headerName:'Goles', width: 70,editable:true,type:'number', renderCell:(params)=>{
    return <Typography variant="h3">{params.row.betB}</Typography>
  }},
  {field:'fechaPartidoStr',headerName:'Fecha Partido', width: 120,editable:false},
  {field:'id',headerName:'ID'},
  {field:'apuestaID',headerName:'apuestaID'},
  {field:'activo',headerName:'Activo'},
]

  const handleClose = ()=>{
    setAlerta(false);
  }

  const slideAlert = (props) => {
    return <Slide {...props} direction="up" />;
  }

  return (
    <>
      <Navbar/>
      <Box component='main' sx={{backgroundColor:'whitesmoke',height:'100vh',width:'100vw',display:'flex',flexDirection:{xs:'column',md:'row'},justifyContent:'center',gap:2}} >
        <Box sx={{ height: 700, width:{xs:'98vw',md:700},justifyContent:'center',mt:3,paddingX:1 }}>
          <Typography variant="h5" sx={{fontWeight:500,backgroundColor:'secondary.main',borderRadius:2,pl:4}} color="primary" >Apuestas disponibles</Typography>
          <DataGrid
            rows={apuestas}
            columns={colApuestas}
            pageSize={10}
            rowsPerPageOptions={[10]}
            disableSelectionOnClick
            rowHeight={80}
            experimentalFeatures={{ newEditingApi: true }}
            columnVisibilityModel={{id:false,apuestaID:false,activo:false}}
            // sortModel={[{field:'fechaPartido'}]}
            localeText={esES.components.MuiDataGrid.defaultProps.localeText}
          />
        </Box>
        <Box sx={{ height: 700, width:{xs:'98vw',md:700},justifyContent:'center',mt:3, paddingX:1,
                '& .gana1': {backgroundColor: '#a5f2b3',}
                ,'& .gana3': { backgroundColor: '#52e36c',}
                ,'& .gana5': { backgroundColor: '#18d93a',}
                }}>
          <Typography variant="h5" sx={{fontWeight:500,backgroundColor:'secondary.main',borderRadius:2,pl:4}} color="primary" >Historial de tus Apuestas</Typography>
          <DataGrid
            rows={partidos}
            columns={colPartidos}
            pageSize={10}
            rowsPerPageOptions={[10]}
            disableSelectionOnClick
            experimentalFeatures={{ newEditingApi: true }}
            rowHeight={80}
            columnVisibilityModel={{id:false,apuestaID:false,activo:false}}
            localeText={esES.components.MuiDataGrid.defaultProps.localeText}
            // sortModel={[{field:'fechaPartido'}]}
            getCellClassName={(params) => {
              return params.row.puntos >= 5 ? 'gana5' : params.row.puntos >= 3 ? 'gana3' : params.row.puntos >= 1 ? 'gana1':'nada';
            }}
          />
        </Box>
      </Box>
      <Snackbar onClose={handleClose} open={alerta[0]} TransitionComponent={slideAlert} autoHideDuration={6000} anchorOrigin={{vertical:'top',horizontal:'right'}}>
        <Alert severity={alerta[1]} sx={{ width: '100%' }}> {alerta[2]}</Alert>
      </Snackbar>
    </>
  )
}
