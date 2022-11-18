import { Alert, Box, IconButton, Slide, Snackbar, Typography } from "@mui/material"
import { DataGrid, esES } from "@mui/x-data-grid"
import moment from "moment";
import { useEffect, useState } from "react";
import { actualizar, guardar, listar } from "../connection/firebase";
import { useAuth } from "../context/AuthContext";
import { Navbar } from "./Navbar"
import PaidIcon from '@mui/icons-material/Paid';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
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
      setAlerta([true,'success','Apuesta actualizada, suerte!'])
    }else{
      await guardar('apuesta',nuevoObj);
      console.log('apuesta registrada',nuevoObj);
      await listarPartidos();
      setAlerta([true,'success','Apuesta registrada, suerte!'])
    }
  } catch (error) {
    setAlerta([true,'danger','No se pudo registrar tu apuesta'])
  }
}

const listarPartidos = async()=>{
  let part = await listar('partido');
  let bet = await listar('apuesta')
  console.log('partidos',bet,user);
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
  pivotActivos = alasql('select * from ? order by [fechaPartido]',[pivotActivos])
  console.log('partidos y apuestas', pivotPasado,pivotActivos);
  setPartidos(pivotPasado);
  setApuestas(pivotActivos);
}

const colPartidos = [
  {field:'puntos',headerName:'Puntos', minWidth:40,flex:1,type:'number'},
  {field:'equipoA',headerName:'Equipo', minWidth:90, flex:1, align:'center'
  , renderCell: (params) =><figure>
    <img title={`${params.row.equipoA}`} style={{justifyContent:'center'}} width='70' src={`../assets/${params.row.equipoA}.png`} alt='X'/>
    <figcaption style={{textAlign:'center'}}>{`${params.row.equipoA}`}</figcaption>
  </figure>},
  {field:'golesA',headerName:'Goles', minWidth:40,flex:1,type:'number',min:0,max:9},
  {field:'betA',headerName:'Apostado', minWidth:0,flex:1,type:'number',min:0,max:9},
  {field:'equipoB',headerName:'Equipo', minWidth:90, flex:1, align:'center'
  , renderCell: (params) =><figure>
    <img title={`${params.row.equipoB}`} style={{textAlign:'center'}} width='70' src={`../assets/${params.row.equipoB}.png`} alt='X'/>
    <figcaption style={{textAlign:'center'}}>{`${params.row.equipoB}`}</figcaption>
  </figure>},
  {field:'golesB',headerName:'Goles',minWidth:40,flex:1,type:'number'},
  {field:'betB',headerName:'Apostado', minWidth:40,flex:1,type:'number'},
  {field:'fechaPartidoStr',headerName:'Fecha Partido', minWidth:100,flex:1},
  {field:'id',headerName:'ID'},
  {field:'apuestaID',headerName:'apuestaID'},
  {field:'activo',headerName:'Activo'},
]
const colApuestas = [
  {field: 'Apostar', headerName: 'Apostar', sortable: false, minWidth:50,flex:1,
    renderCell: (params) => {
      return <IconButton onClick={()=>onApuesta(params.row)} title='Apostar' color={params.row.apuestaID? 'error':'success'}>
               {params.row.apuestaID? <CheckCircleIcon fontSize="large"/>:<PaidIcon fontSize="large"/>} 
            </IconButton>;
    },
  },
  {field:'equipoA',headerName:'Equipo', minWidth:90, flex:1, align:'center'
  , renderCell: (params) =><figure style={{textAlign:'center'}}>
    <img title={`${params.row.equipoA}`} width='70' src={`../assets/${params.row.equipoA}.png`} alt='X'/>
    <figcaption>{`${params.row.equipoA}`}</figcaption>
  </figure>},
  {field:'betA',headerName:'Goles', minWidth:40,flex:1,editable:true,type:'number',min:0,max:9,align:'center', renderCell:(params)=>{
    return <Typography variant="h4">{params.row.betA}</Typography>
  }},
  {field:'betB',headerName:'Goles', minWidth:40,flex:1,editable:true,type:'number', renderCell:(params)=>{
    return <Typography variant="h4">{params.row.betB}</Typography>
  }},
  {field:'equipoB',headerName:'Equipo', minWidth:90, flex:1, align:'center'
  , renderCell: (params) =><figure style={{textAlign:'center'}}>
    <img title={`${params.row.equipoB}`} width='70' src={`../assets/${params.row.equipoB}.png`} alt='X'/>
    <figcaption>{`${params.row.equipoB}`}</figcaption>
  </figure>},
  {field:'fechaPartidoStr',headerName:'Fecha Partido', minWidth:100,flex:1,editable:false},
  {field:'id',headerName:'ID'},
  {field:'apuestaID',headerName:'apuestaID'},
  {field:'activo',headerName:'Activo'},
]

  const handleClose = ()=>{
    setAlerta([false,'success','vacio']);
  }

  const slideAlert = (props) => {
    return <Slide {...props} direction="up" />;
  }

  return (
    <>
      <Navbar/>
      <Box component='main' sx={{backgroundColor:'whitesmoke',minHeight:'100vh',width:'100vw',display:'flex',flexDirection:{xs:'column',md:'row'},justifyContent:'center',gap:4}} >
        <Box sx={{ height:{xs:400,md:700}, width:{xs:'100vw',md:700},justifyContent:'center',mt:3,paddingX:0.5 }}>
          <Typography variant="h5" sx={{fontWeight:500,backgroundColor:'secondary.main',color:'persist.main',borderRadius:2,pl:4,mb:1}} >Apuestas disponibles</Typography>
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
        <Box sx={{ height:{xs:400,md:700}, width:{xs:'100vw',md:700},justifyContent:'center',mt:3, paddingX:0.5,
                '& .gana1': {backgroundColor: '#a5f2b3',}
                ,'& .gana3': { backgroundColor: '#52e36c',}
                ,'& .gana5': { backgroundColor: '#18d93a',}
                }}>
          <Typography variant="h5" sx={{fontWeight:500,backgroundColor:'secondary.main',color:'primary.main',borderRadius:2,pl:4,mb:1}} >Historial de tus Apuestas</Typography>
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
