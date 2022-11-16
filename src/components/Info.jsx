import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material"
import { DataGrid ,esES} from "@mui/x-data-grid";
import alasql from "alasql";
import moment from "moment";
import { useState } from "react";
import { listar } from "../connection/firebase";
import { useAuth } from "../context/AuthContext";
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

  const {tipoUsuario}= useAuth()

  const [grilla, setGrilla] = useState({mostrar:false,filas:[],columnas:[],tipo:'',orden:{}});

  const cargarGrilla = async (tipo)=>{
    console.log(tipo,tipoUsuario);
    if(grilla.tipo === tipo){
      setGrilla({mostrar:false,filas:[],columnas:[],tipo:'',orden:{}})
    }else{
      let columnas =[];
      let filas =[];
      let resultados = [];
      let orden={};
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
          {field:'fechaPartidoStr',headerName:'Fecha', minWidth:120},
          {field:'equipoA',headerName:'Equipo', minWidth:110, flex:0.5, align:'center'
          , renderCell: (params) =><figure>
            <img title={`${params.row.equipoA}`} width='70' src={`../assets/${params.row.equipoA}.png`} alt='X'/>
            <figcaption>{`${params.row.equipoA}`}</figcaption>
          </figure>},
          {field:'golesA',headerName:'Goles', width:70 ,type:'number'},
          {field:'equipoB',headerName:'Equipo',minWidth:110, flex:0.5, align:'center'
          , renderCell: (params) => <figure>
            <img title={`${params.row.equipoB}`} width='70' src={`../assets/${params.row.equipoB}.png`} alt='X'/>
            <figcaption>{`${params.row.equipoB}`}</figcaption>
          </figure>},
          {field:'golesB',headerName:'Goles', width:70 ,type:'number'},
        ] ;
        orden=[{field:'fechaPartido'}];
      }
      if(tipo==='posiciones'){
        resultados = await listar('equipo');
        filas = alasql('select * from ? order by grupo,puntos desc,diferencia desc',[resultados])
        console.log(filas);
        columnas = [
          {field:'grupo',headerName:'Grupo', width: 70},
          {field:'nombre',headerName:'Equipo', minWidth:110, flex:1, align:'center'
          , renderCell: (params) =><figure>
            <img title={`${params.row.nombre}`} width='70' src={`../assets/${params.row.nombre}.png`} alt='X'/>
            <figcaption>{`${params.row.nombre}`}</figcaption>
          </figure>},
          {field:'jugados',headerName:'PJ', width: 70,type:'number'},
          {field:'ganados',headerName:'PG', width: 70,type:'number'},
          {field:'empatados',headerName:'PE', width: 70,type:'number'},
          {field:'perdidos',headerName:'PP', width: 70,type:'number'},
          {field:'favor',headerName:'GF', width: 70,type:'number'},
          {field:'contra',headerName:'GC', width: 70,type:'number'},
          {field:'diferencia',headerName:'GD', width: 70,type:'number'},
          {field:'puntos',headerName:'PTS', width: 70,type:'number'},
        ] ;
        orden=[{field:'pts',sort:'desc'}];
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
      setGrilla({mostrar:true,filas,columnas,tipo,orden})
    }
  }

  return (
    <>
    <Navbar/>
      <Box component='main' sx={{textAlign:'center'}} >
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
    </>
  )
}
