import { Alert, Box, IconButton, Slide, Snackbar, Typography } from "@mui/material"
import { DataGrid, esES } from "@mui/x-data-grid"
import moment from "moment";
import { useEffect, useState } from "react";
import { actualizar, guardar, listar } from "../connection/firebase";
import { useAuth } from "../context/AuthContext";
import { Navbar } from "./Navbar"
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
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
  {field:'fechaPartidoStr',headerName:'Fecha Partido', width: 120,editable:false},
  {field:'equipoA',headerName:'Equipo A', width: 150,editable:false},
  {field: 'imageA', headerName: 'EquipoA', width: 100, editable: false
  , renderCell: (params) => <img title={`${params.row.equipoA}`} width='70px' src={`../assets/${params.row.equipoA}.png`} alt='S/I'/>},
  {field:'golesA',headerName:'Goles A', width: 70,editable:true,type:'number',min:0,max:9},
  {field:'betA',headerName:'Apuesta A', width: 70,editable:true,type:'number',min:0,max:9},
  {field:'equipoB',headerName:'Equipo B', width: 150,editable:false},
  {field: 'imageB', headerName: 'EquipoA', width: 100, editable: false
  , renderCell: (params) => <img title={`${params.row.equipoB}`} width='70px' src={`../assets/${params.row.equipoB}.png`} alt='S/I'/>},
  {field:'golesB',headerName:'Goles B', width: 70,editable:true,type:'number'},
  {field:'betB',headerName:'Apuesta B', width: 70,editable:true,type:'number'},
  {field:'puntos',headerName:'Puntos', width: 70,type:'number'},
  {field:'id',headerName:'ID'},
  {field:'apuestaID',headerName:'apuestaID'},
  {field:'activo',headerName:'Activo'},
]
const colApuestas = [
  {field: 'Acciones', headerName: 'Acciones', sortable: false, width:80,
    renderCell: (params) => {
      return <IconButton onClick={()=>onApuesta(params.row)} title='Apostar' color='primary' size="large"><PaidIcon/></IconButton>;
    },
  },
  {field:'fechaPartidoStr',headerName:'Fecha Partido', width: 120,editable:false},
  {field: 'imageA', headerName: 'EquipoA', width: 100, editable: false
  , renderCell: (params) => <img title={`${params.row.equipoA}`} width='70px' src={`../assets/${params.row.equipoA}.png`} alt='S/I'/>},
  {field:'equipoA',headerName:'Equipo A', width: 150,editable:false},
  {field:'betA',headerName:'Goles A', width: 70,editable:true,type:'number',min:0,max:9},
  {field: 'imageB', headerName: 'EquipoB', width: 100, editable: false
  , renderCell: (params) => <img title={`${params.row.equipoB}`} width='70px' src={`../assets/${params.row.equipoB}.png`} alt='S/I'/>},
  {field:'equipoB',headerName:'Equipo B', width: 150,editable:false},
  {field:'betB',headerName:'Goles B', width: 70,editable:true,type:'number'},
  {field:'id',headerName:'ID'},
  {field:'apuestaID',headerName:'apuestaID'},
  {field:'activo',headerName:'Activo'},
]

  const handleClose = ()=>{
    setAlerta(false);
  }

  const slideAlert = (props) => {
    return <Slide {...props} direction="down" />;
  }

  return (
    <>
      <Navbar/>
      <Box component='main' sx={{backgroundColor:'whitesmoke',height:'100vh',width:'100vw',display:'flex',justifyContent:'center',gap:2}} >
        <Box sx={{ height: 450, width:{xs:'98vw',md:700},justifyContent:'center',mt:4,
                '& .gana1': {
                  backgroundColor: '#a5f2b3',
                },
                '& .gana3': {
                  backgroundColor: '#52e36c',
                },
                '& .gana5': {
                  backgroundColor: '#18d93a',
                } }}>
          <Typography variant="h5" sx={{fontWeight:500}} color="primary" >Historial Apuestas</Typography>
          <DataGrid
            rows={partidos}
            columns={colPartidos}
            pageSize={10}
            rowsPerPageOptions={[10]}
            disableSelectionOnClick
            experimentalFeatures={{ newEditingApi: true }}
            columnVisibilityModel={{id:false,apuestaID:false,activo:false,equipoA:false,equipoB:false}}
            localeText={esES.components.MuiDataGrid.defaultProps.localeText}
            // sortModel={[{field:'fechaPartido'}]}
            getCellClassName={(params) => {
              return params.row.puntos >= 5 ? 'gana5' : params.row.puntos >= 3 ? 'gana3' : params.row.puntos >= 1 ? 'gana1':'nada';
            }}
          />
        </Box>
        <Box sx={{ height: 450, width:{xs:'98vw',md:700},justifyContent:'center',mt:4 }}>
          <Typography variant="h5" sx={{fontWeight:500}} color="primary" >Apuestas disponibles</Typography>
          <DataGrid
            rows={apuestas}
            columns={colApuestas}
            pageSize={10}
            rowsPerPageOptions={[10]}
            disableSelectionOnClick
            experimentalFeatures={{ newEditingApi: true }}
            columnVisibilityModel={{id:false,apuestaID:false,activo:false,equipoA:false,equipoB:false}}
            // sortModel={[{field:'fechaPartido'}]}
            localeText={esES.components.MuiDataGrid.defaultProps.localeText}
          />
        </Box>
      </Box>
      <Snackbar onClose={handleClose} open={alerta[0]} TransitionComponent={slideAlert} autoHideDuration={3000} anchorOrigin={{vertical:'top',horizontal:'right'}}>
        <Alert severity={alerta[1]} sx={{ width: '100%' }}> {alerta[2]}</Alert>
      </Snackbar>
    </>
  )
}
