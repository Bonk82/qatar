import { Box, Button, ButtonGroup } from "@mui/material"
import { DataGrid ,esES} from "@mui/x-data-grid";
import { useState } from "react";
import { listar } from "../connection/firebase";
import { useAuth } from "../context/AuthContext";
import { Navbar } from "./Navbar"

// const [dtsResultados, setDtsResultados] = useState([]);
// const [dtsPosiciones,setDtsPosiciones]=useState([]);
// const dinamico=[];

export const Info = () => {
  const buttons = [
    <Button sx={{fontWeight:'bold'}} key="resultados" onClick={()=>cargarGrilla('resultados')}>Resultados</Button>,
    <Button sx={{fontWeight:'bold'}} key="posiciones" onClick={()=>cargarGrilla('posiciones')}>Posiciones</Button>,
    <Button sx={{fontWeight:'bold'}} key="dinamico" onClick={()=>cargarGrilla('dinamico')}>Dinámico</Button>
  ];

  const {tipoUsuario}= useAuth()

  const [grilla, setGrilla] = useState({mostrar:false,filas:[],columnas:[],tipo:''});

  const cargarGrilla = async (tipo)=>{
    console.log(tipo,tipoUsuario);
    if(grilla.tipo === tipo){
      setGrilla({mostrar:false,filas:[],columnas:[],tipo:''})
    }else{
      let columnas =[];
      let filas =[];
      let resultados = [];
      if(tipo==='resultados'){
        resultados = await listar('partido');
        filas = resultados.filter(f=>f.finalizado)
                          .sort((a,b)=>new Date(a.fechaPartido).getTime() - new Date(b.fechaPartido).getTime());
        columnas = [
          {field:'fechaPartido',headerName:'Fecha', width:240},
          {field:'equipoA',headerName:'Equipo', width:240},
          {field:'golesA',headerName:'Goles', width:240},
          {field:'equipoB',headerName:'Equipo', width:240},
          {field:'golesB',headerName:'Goles', width:240},
        ] ;
      }
      if(tipo==='posiciones'){
        resultados = await listar('equipo');
        filas = resultados;
        columnas = [
          {field:'nombre',headerName:'Equipo', width:270},
          {field:'factor',headerName:'Factor', width: 100},
        ] ;
      }
      if(tipo==='dinamico'){
        resultados = await listar('equipo');
        filas = resultados;
        columnas = [
          {field:'nombre',headerName:'Equipo', width:270},
          {field:'factor',headerName:'Factor', width: 100},
        ] ;
      }
      setGrilla({mostrar:true,filas,columnas,tipo})
    }
  }

  return (
    <>
    <Navbar/>
      <Box component='main' sx={{textAlign:'center'}} >
        <Box sx={{display: 'flex',flexDirection: 'column', alignItems: 'center','& > *': {m: 1, }}}>
          <ButtonGroup size="large" aria-label="large button group" >
            {buttons}
          </ButtonGroup>
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
              experimentalFeatures={{ newEditingApi: true }}
              localeText={esES.components.MuiDataGrid.defaultProps.localeText}
            />
          </Box>
        </Box>}
      </Box>
    </>
  )
}
