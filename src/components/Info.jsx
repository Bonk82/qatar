import { Backdrop, Box, CircularProgress, ToggleButton, ToggleButtonGroup } from "@mui/material"
import { DataGrid ,esES} from "@mui/x-data-grid";
import alasql from "alasql";
import moment from "moment";
import { useState } from "react";
import { listar } from "../connection/firebase";
// import { useAuth } from "../context/AuthContext";
import { Navbar } from "./Navbar"

// const [dtsResultados, setDtsResultados] = useState([]);
// const [dtsPosiciones,setDtsPosiciones]=useState([]);
// const dinamico=[];

export const Info = () => {
  const buttons = [
    <ToggleButton  key="resultados" value='resultados' onClick={()=>cargarGrilla('resultados')}>Resultados</ToggleButton>,
    <ToggleButton  key="posiciones" value='posiciones' onClick={()=>cargarGrilla('posiciones')}>Posiciones</ToggleButton>,
    <ToggleButton  key="dinamico" value='dinamico' onClick={()=>cargarGrilla('dinamico')}>Dinámico</ToggleButton>
  ];

  // const {tipoUsuario}= useAuth()

  const [grilla, setGrilla] = useState({mostrar:false,filas:[],columnas:[],tipo:''});
  const [openSpinner, setOpenSpinner] = useState(false);

  const cargarGrilla = async (tipo)=>{
    // console.log(tipo,tipoUsuario);
    setOpenSpinner(true);
    if(grilla.tipo === tipo){
      setGrilla({mostrar:false,filas:[],columnas:[],tipo:''})
      setOpenSpinner(false);
    }else{
      let columnas =[];
      let filas =[];
      let resultados = [];
      if(tipo==='resultados'){
        resultados = await listar('partido');
        resultados.map(e=>{
          e.fechaPartidoStr = moment(e.fechaPartido.toDate()).format('DD/MMM HH:mm');
          return e
        })
        // filas = resultados.filter(f=>f.finalizado)
        //                   .sort((a,b)=>new Date(a.fechaPartido).getTime() - new Date(b.fechaPartido).getTime());
        filas = alasql('select * from ? where finalizado = true order by fechaPartido',[resultados])
        columnas = [
          {field:'fechaPartidoStr',headerName:'Fecha', minWidth:100,flex:1},
          {field:'equipoA',headerName:'Equipo', minWidth:90, flex:0.5, align:'center'
          , renderCell: (params) =><figure>
            <img title={`${params.row.equipoA}`} width='70' src={`../assets/${params.row.equipoA}.png`} alt='X'/>
            <figcaption>{`${params.row.equipoA}`}</figcaption>
          </figure>},
          {field:'golesA',headerName:'Goles', minWidth:50,flex:1 ,type:'number'},
          {field:'equipoB',headerName:'Equipo',minWidth:90, flex:0.5, align:'center'
          , renderCell: (params) => <figure>
            <img title={`${params.row.equipoB}`} width='70' src={`../assets/${params.row.equipoB}.png`} alt='X'/>
            <figcaption>{`${params.row.equipoB}`}</figcaption>
          </figure>},
          {field:'golesB',headerName:'Goles', minWidth:50,flex:1 ,type:'number'},
        ] ;
      }
      if(tipo==='posiciones'){
        resultados = await listar('equipo');
        filas = alasql('select * from ? order by grupo,puntos desc,diferencia desc',[resultados])
        // console.log(filas);
        columnas = [
          {field:'grupo',headerName:'Grupo', minWidth:50,flex:1},
          {field:'nombre',headerName:'Equipo', minWidth:90, flex:1, align:'center'
          , renderCell: (params) =><figure>
            <img title={`${params.row.nombre}`} width='70' src={`../assets/${params.row.nombre}.png`} alt='X'/>
            <figcaption>{`${params.row.nombre}`}</figcaption>
          </figure>},
          {field:'jugados',headerName:'PJ',  minWidth:50,flex:1,type:'number'},
          {field:'ganados',headerName:'PG',  minWidth:50,flex:1,type:'number'},
          {field:'empatados',headerName:'PE',  minWidth:50,flex:1,type:'number'},
          {field:'perdidos',headerName:'PP',  minWidth:50,flex:1,type:'number'},
          {field:'favor',headerName:'GF',  minWidth:50,flex:1,type:'number'},
          {field:'contra',headerName:'GC',  minWidth:50,flex:1,type:'number'},
          {field:'diferencia',headerName:'GD',  minWidth:50,flex:1,type:'number'},
          {field:'puntos',headerName:'PTS',  minWidth:50,flex:1,type:'number'},
        ] ;
      }
      if(tipo==='dinamico'){
        resultados = await listar('equipo');
        filas = resultados;
        columnas = [
          {field:'nombre',headerName:'Equipo', minWidth:110, flex:1, align:'center'
          , renderCell: (params) =><figure>
            <img title={`${params.row.nombre}`} width='70' src={`../assets/${params.row.nombre}.png`} alt='X'/>
            <figcaption>{`${params.row.nombre}`}</figcaption>
          </figure>},
          {field:'factor',headerName:'Factor', width: 100},
        ] ;
      }
      setGrilla({mostrar:true,filas,columnas,tipo})
      setOpenSpinner(false);
    }
  }

  return (
    <>
    <Navbar/>
      <Box component='main' sx={{textAlign:'center',backgroundColor:"whitesmoke",width:'100vw'}} >
        <Box sx={{display: 'flex',flexDirection: 'column', alignItems: 'center','& > *': {m: 1, }}}>
          <ToggleButtonGroup size="large" value={grilla.tipo} color="primary" sx={{fontWeight:'bold'}} aria-label="Platform" exclusive >
            {buttons}
          </ToggleButtonGroup>
        </Box>
        {!grilla.mostrar && <Box sx={{display:'flex',justifyContent:'center'}}>
          <Box sx={{width:{xs:'100%',md:'80%'}}} >
            <img src="../assets/fixture.jpg" alt="Cargando Imagen" width='100%' />
          </Box>
        </Box>}
        {grilla.mostrar && <Box sx={{display:'flex',justifyContent:'center'}}>
          <Box sx={{width:{xs:'100%',md:'80%'},height: '85vh'}} >
          <DataGrid
              rows={grilla.filas}
              columns={grilla.columnas}
              pageSize={10}
              rowsPerPageOptions={[10]}
              disableSelectionOnClick
              autoHeight
              rowHeight={80}
              experimentalFeatures={{ newEditingApi: true }}
              localeText={esES.components.MuiDataGrid.defaultProps.localeText}
              // sortModel={grilla.orden}
            />
          </Box>
        </Box>}
      </Box>
      <Backdrop sx={{ color: 'primary.main', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={openSpinner}>
        <CircularProgress color="inherit" size='7rem' thickness={5} />
      </Backdrop>
    </>
  )
}
