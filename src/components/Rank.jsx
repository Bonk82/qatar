
import { Box, IconButton, Typography } from "@mui/material"
import { DataGrid, esES } from "@mui/x-data-grid"
import alasql from "alasql"
import { useEffect } from "react"
import { useState } from "react"
import { listar } from "../connection/firebase"
import { Navbar } from "./Navbar"
import MoneyIcon from '@mui/icons-material/Money';
import { Barras } from "../charts/Barras"

let historialAll = [];

export const Rank = () => {
  const [apostadores, setApostadores] = useState([]);
  const [dataChart, setDataChart] = useState({x:[],y:[],titulos:{}})

  useEffect(() => {
    cargarApostadores();
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  const cargarApostadores = async()=>{
    const apuestas = await listar('apuesta');
    const usuarios = await listar('usuario');
    const partidos = await listar('partido');
    historialAll = alasql(`select a.golesA betA,a.golesB betB, a.uid id,a.puntos,u.nombre,u.estado,p.equipoA,p.equipoB,p.fechaPartido.toDate() fechaPartido
    ,p.golesA,p.golesB from ? u inner join ? a on u.userID =  a.uid inner join ? p on p.id = a.partidoID where u.estado = 'apuesta'`,[usuarios,apuestas,partidos]);

    const apostadoresAll = await alasql('SELECT nombre,id,SUM(puntos)puntos from ? GROUP BY nombre,id order by 3 desc',[historialAll]);
    // const rr = alasql('SELECT nombre,id,SUM(puntos)puntos from ? GROUP BY nombre,id',[historialAll]);
    //console.log('apostadores',apostadoresAll,historialAll,apuestas,usuarios,partidos,rr);
    console.log('ver',apostadoresAll);
    setApostadores(apostadoresAll);
    cargarDataChart(apostadoresAll)
  }

  const cargarHistorial = async(row) =>{
    console.log(row);
    const historialUsuario = historialAll.filter(f=>f.uid === row.id)
    console.log(historialUsuario,apostadores);
  }

  const colApostadores = [
    {field:'nombre',headerName:'Nombre', minWidth: 150,flex:1},
    {field:'puntos',headerName:'Puntos', width: 70,type:'number'},
    {field: 'Acciones', headerName: 'Historial', sortable: false, width:80,
    renderCell: (params) => {
      return <IconButton onClick={()=>cargarHistorial(params.row)} title='Historial Apuestas' color='success'><MoneyIcon fontSize="large"/></IconButton>;
      },
    },
    {field:'id',headerName:'ID', width: 80},
  ]

  const cargarDataChart = (data)=>{
    console.log('la data',data);
    const users = [];
    const pts = [];
    
    data.forEach(d => {
      console.log('bets',d);
      users.push(d.nombre);
      pts.push(d.puntos);
    });
    setDataChart({x:users,y:pts,titulos:{x:'Participantes',y:'Puntos Obtenidos',c:'Ranking de Apostadores'}})
  }

  return (
    <>
      <Navbar/>
      <Box component='main' sx={{backgroundColor:'whitesmoke',minHeight:'100vh',width:'100vw',display:'flex',flexDirection:{xs:'column',md:'row'},justifyContent:'center',gap:2}} >
        <Box sx={{ height:{xs:400, md:550}, width:{xs:'100vw',md:350},justifyContent:'center',mt:1,paddingX:4 }}>
          <Typography variant="h5" color='persist.main' sx={{fontWeight:500,backgroundColor:'secondary.main',borderRadius:2,pl:4,mb:1}} >Ranking</Typography>
          <DataGrid
            rows={apostadores}
            columns={colApostadores}
            pageSize={10}
            rowsPerPageOptions={[10]}
            disableSelectionOnClick
            experimentalFeatures={{ newEditingApi: true }}
            columnVisibilityModel={{id:false}}
            // sortModel={[{field:'fechaPartido'}]}
            localeText={esES.components.MuiDataGrid.defaultProps.localeText}
            sx={{fontSize:16}}
          />
        </Box>
        <Box component="div" sx={{alignItems:'center',width:{xs:'100vw',md:1000},mt:1,pt:2}}>
          {apostadores.length>0 && <Barras data={dataChart}></Barras>} 
        </Box>
    </Box>
    </>
  )
}
