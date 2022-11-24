import { Alert, Backdrop, Box, CircularProgress, IconButton, Slide, Snackbar, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material"
import { DataGrid, esES } from "@mui/x-data-grid"
import moment from "moment";
import { useEffect, useState } from "react";
import { actualizar, guardar, listar } from "../connection/firebase";
import { useAuth } from "../context/AuthContext";
import { Navbar } from "./Navbar"
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import alasql from "alasql";
import SaveAsIcon from '@mui/icons-material/SaveAs';

let apuestasAll = [];
let partidosAll = [];
let usuariosAll = [];

export const Bet = () => {

  const {user } = useAuth();
  const [partidos, setPartidos] = useState([])
  // const [apuesta, setApuesta] = useState({golesA:0,golesB:0,partidoID:'',uid:user.uid});
  const [apuestas, setApuestas] = useState([]);
  const [alerta, setAlerta] = useState([false,'success','']);
  const [openSpinner, setOpenSpinner] = useState(false);
  const [grilla, setGrilla] = useState({mostrar:false,filas:[],columnas:[],tipo:''});

  useEffect(() => {
    listarPartidos();
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

const onApuesta = async (e)=>{
  // console.log('bet',e);
  if(moment(e.fechaPartido.toDate()).add(-10,'minutes') <= moment()){
    setAlerta([true,'error','Ya no se permiten apuestas para este Parido!']);
    return true;
  }
  setOpenSpinner(true);
  try {
    const nuevoObj  = {golesA:Number(e.betA),golesB:Number(e.betB),partidoID:e.id,uid:user.uid}
    if(e.apuestaID){
      await actualizar('apuesta',e.apuestaID,nuevoObj);
      // console.log('apuesta actualizada',nuevoObj);
      setAlerta([true,'success','Apuesta actualizada, suerte!'])
    }else{
      await guardar('apuesta',nuevoObj);
      // console.log('apuesta registrada',nuevoObj);
      await listarPartidos();
      setAlerta([true,'success','Apuesta registrada, suerte!'])
    }
  } catch (error) {
    setAlerta([true,'danger','No se pudo registrar tu apuesta'])
  } finally{
    setOpenSpinner(false);
  }
}

const listarPartidos = async()=>{
  partidosAll = await listar('partido');
  apuestasAll = await listar('apuesta');
  let part = [...partidosAll];
  let bet = [...apuestasAll];
  // console.log('partidos',bet,user);
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
  pivotActivos = await alasql('select * from ? order by [fechaPartido]',[pivotActivos]);
  pivotPasado = await alasql('select * from ? order by [fechaPartido] desc',[pivotPasado]);
  // console.log('partidos y apuestas', pivotPasado,pivotActivos);
  setPartidos(pivotPasado);
  setApuestas(pivotActivos);
  setGrilla({mostrar:true,filas:pivotActivos,columnas:colApuestas,tipo:'Apostar'})
}

const colPartidos = [
  {field:'puntos',headerName:'Puntos', minWidth:40,flex:1,type:'number'},
  {field:'equipoA',headerName:'Equipo', minWidth:90, flex:1, align:'center'
  , renderCell: (params) =><figure style={{textAlign:'center'}}>
    <img title={`${params.row.equipoA}`} width='70' src={`../assets/${params.row.equipoA}.png`} alt='X'/>
    <figcaption >{`${params.row.equipoA}`} : {`${params.row.golesA}`}</figcaption>
  </figure>},
  {field:'betA',headerName:'Goles',editable:false, minWidth:40,flex:1},
  {field:'betB',headerName:'Goles',editable:false, minWidth:40,flex:1},
  {field:'equipoB',headerName:'Equipo', minWidth:90, flex:1, align:'center'
  , renderCell: (params) =><figure style={{textAlign:'center'}}>
    <img title={`${params.row.equipoB}`} width='70' src={`../assets/${params.row.equipoB}.png`} alt='X'/>
    <figcaption >{`${params.row.equipoB}`} : {`${params.row.golesB}`}</figcaption>
  </figure>},
  {field:'fechaPartidoStr',headerName:'Fecha Partido', minWidth:100,flex:1}
]

const colApuestas = [
  {field: 'Apostar', headerName: 'Apostar', sortable: false, minWidth:50,flex:1,
    renderCell: (params) => {
      return <IconButton onClick={()=>onApuesta(params.row)} title='Apostar' color={params.row.apuestaID? 'error':'success'}>
               {params.row.apuestaID? <CheckCircleIcon fontSize="large"/>:<SaveAsIcon fontSize="large"/>} 
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

  const buttons = [
    <ToggleButton  key="apuestasDisponibles" value='Apostar' onClick={()=>cargarGrilla('Apostar')}>Apostar</ToggleButton>,
    <ToggleButton  key="userApuestas" value='Historial Personal' onClick={()=>cargarGrilla('Historial Personal')}>Historial Personal</ToggleButton>,
    <ToggleButton  key="fechaApuestas" value='Apuestas del Grupo' onClick={()=>cargarGrilla('Apuestas del Grupo')}>Apuestas del Grupo</ToggleButton>
  ];

  const cargarGrilla = async (tipo)=>{
    // console.log(tipo);
    setOpenSpinner(true);
    if(grilla.tipo === tipo){
      setGrilla({mostrar:false,filas:[],columnas:[],tipo:'',orden:{}})
      setOpenSpinner(false);
    }else{
      let columnas =[];
      let filas =[];
      if(tipo==='Apostar'){
        filas = apuestas; 
        columnas = colApuestas;
      }
      if(tipo==='Historial Personal'){
        filas = partidos; 
        columnas = colPartidos;
      }
      if(tipo==='Apuestas del Grupo'){
        usuariosAll = await listar('usuario');
        partidosAll = await listar('partido')
        filas = await alasql(`select a.id, a.golesA betA, a.golesB betB, a.uid,p.equipoA,p.equipoB,p.fechaPartido,u.nombre
        from ? a inner join ? p on a.partidoID = p.id inner join ? u on a.uid = u.userID
        where u.grupo = '${user.grupo}' order by p.fechaPartido.toDate(), u.nombre`,[apuestasAll,partidosAll,usuariosAll]);

        filas = await filas.filter(f=>moment(f.fechaPartido.toDate()) < moment());
        filas = await filas.sort((a,b)=>b.fechaPartido.toDate() - a.fechaPartido.toDate())

        columnas = [
          {field:'nombre',headerName:'Usuario', minWidth:120,flex:1},
          {field:'equipoA',headerName:'Equipo', minWidth:90, flex:1, align:'center'
          , renderCell: (params) =><figure style={{textAlign:'center'}}>
            <img title={`${params.row.equipoA}`} width='70' src={`../assets/${params.row.equipoA}.png`} alt='X'/>
            <figcaption>{`${params.row.equipoA}`}</figcaption>
          </figure>},
          {field:'betA',headerName:'Goles',editable:false, minWidth:40,flex:1,align:'center', renderCell:(params)=>{
            return <Typography variant="h4">{params.row.betA}</Typography>
          }},
          {field:'betB',headerName:'Goles',editable:false, minWidth:40,flex:1, renderCell:(params)=>{
            return <Typography variant="h4">{params.row.betB}</Typography>
          }},
          {field:'equipoB',headerName:'Equipo', minWidth:90, flex:1, align:'center'
          , renderCell: (params) =><figure style={{textAlign:'center'}}>
            <img title={`${params.row.equipoB}`} width='70' src={`../assets/${params.row.equipoB}.png`} alt='X'/>
            <figcaption>{`${params.row.equipoB}`}</figcaption>
          </figure>},
          {field:'id',headerName:'ID'}
        ]
        // console.log(filas,user.grupo,apuestasAll,partidosAll,usuariosAll);
      }
      setGrilla({mostrar:true,filas,columnas,tipo})
      setOpenSpinner(false);
    }
  }



  return (
    <>
      <Navbar/>
      <Box component='main' sx={{backgroundColor:'whitesmoke',width:'100vw'}} >
        <Box sx={{display: 'flex',flexDirection: 'column',justifyContent:'center', alignItems: 'center','& > *': {m: 1, }}}>
          <ToggleButtonGroup size="large" value={grilla.tipo} color="primary" sx={{fontWeight:'bold'}} aria-label="Platform" exclusive >
            {buttons}
          </ToggleButtonGroup>
        </Box>
        {grilla.mostrar && 
          <Box sx={{ height:{xs:600,md:800}, display:'flex',justifyContent:'center',flexDirection:'column',paddingX:{xs:0.5,md:40} }}>
            <Typography variant="h5" sx={{fontWeight:500,backgroundColor:'secondary.main',color:'persist.main',borderRadius:2,pl:4,mb:1}} >{grilla.tipo}</Typography>
            <DataGrid
              rows={grilla.filas}
              columns={grilla.columnas}
              pageSize={10}
              rowsPerPageOptions={[10]}
              disableSelectionOnClick
              rowHeight={80}
              experimentalFeatures={{ newEditingApi: true }}
              columnVisibilityModel={{id:false,apuestaID:false,activo:false}}
              sx={{fontSize:12}}
              // sortModel={[{field:'fechaPartido'}]}
              localeText={esES.components.MuiDataGrid.defaultProps.localeText}
            />
          </Box>}
      </Box>
      <Snackbar onClose={handleClose} open={alerta[0]} TransitionComponent={slideAlert} autoHideDuration={6000} anchorOrigin={{vertical:'top',horizontal:'right'}}>
        <Alert severity={alerta[1]} sx={{ width: '100%' }}> {alerta[2]}</Alert>
      </Snackbar>
      <Backdrop sx={{ color: 'primary.main', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={openSpinner}>
        <CircularProgress color="inherit" size='7rem' thickness={5} />
      </Backdrop>
    </>
  )
}
