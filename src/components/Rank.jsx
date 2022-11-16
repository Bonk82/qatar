
import { Box, IconButton, Typography } from "@mui/material"
import { DataGrid, esES } from "@mui/x-data-grid"
import alasql from "alasql"
import { useEffect } from "react"
import { useState } from "react"
import { listar } from "../connection/firebase"
import { useAuth } from "../context/AuthContext"
import { Navbar } from "./Navbar"
import MoneyIcon from '@mui/icons-material/Money';
import { Barras } from "../charts/Barras"

let historialAll = [];

export const Rank = () => {
  const {user} = useAuth()
  const [apostadores, setApostadores] = useState([]);
  const [dataChart, setDataChart] = useState({x:[],y:[],titulos:{}})

  useEffect(() => {
    cargarApostadores();
  }, [])
  
  const cargarApostadores = async()=>{
    const apuestas = await listar('apuesta');
    const usuarios = await listar('usuario');
    const partidos = await listar('partido');
    historialAll = alasql(`select a.golesA betA,a.golesB betB, a.uid id,a.puntos,u.nombre,u.estado,p.equipoA,p.equipoB,p.fechaPartido.toDate() fechaPartido
    ,p.golesA,p.golesB from ? u left join ? a on a.uid = u.userID inner join ? p on p.id = a.partidoID`,[usuarios,apuestas,partidos]);
    const apostadoresAll = alasql(`select u.nombre,a.uid id,sum(a.puntos)puntos from ? a inner join ? u on a.uid = u.userID
    where u.estado = 'apuesta' group by u.nombre,a.uid order by a.puntos desc`,[apuestas,usuarios]);
    console.log(apostadoresAll,historialAll);
    setApostadores(apostadoresAll);
    cargarDataChart(apostadoresAll)
  }

  const cargarHistorial = async(row) =>{
    console.log(row);
    const historialUsuario = historialAll.filter(f=>f.uid === row.id)
    console.log(historialUsuario);
  }

  const colApostadores = [
    {field:'nombre',headerName:'Nombre', width: 150,editable:false},
    {field:'id',headerName:'ID', width: 80,editable:false},
    {field:'puntos',headerName:'Puntos', width: 70,editable:false,type:'number'},
    {field: 'Acciones', headerName: 'Historial', sortable: false, width:80,
    renderCell: (params) => {
      return <IconButton onClick={()=>cargarHistorial(params.row)} title='Historial Apuestas' color='success' size="large"><MoneyIcon/></IconButton>;
    },
  },
  ]

  const cargarDataChart = (data)=>{
    data = data.sort((a,b)=>a.nombre = b.nombre);
    console.log('cargaChart',data);
    const apostadores = [];
    const puntos = [];
    data.forEach(d => {
      apostadores.push(d.nombre);
      puntos.push(d.puntos);
    });
    setDataChart({x:apostadores,y:puntos,titulos:{}})
  }

  return (
    <>
      <Navbar/>
      <Box component='main' sx={{backgroundColor:'whitesmoke',height:'100vh',width:'100vw',display:'flex',flexDirection:{xs:'column',md:'row'},justifyContent:'center',gap:2}} >
        <Box sx={{ height: 450, width:{xs:'98vw',md:320},justifyContent:'center',mt:2 }}>
          <Typography variant="h5" color='primary'>Ranking</Typography>
          <DataGrid
            rows={apostadores}
            columns={colApostadores}
            pageSize={10}
            rowsPerPageOptions={[10]}
            disableSelectionOnClick
            experimentalFeatures={{ newEditingApi: true }}
            columnVisibilityModel={{id:false}}
            autoHeight
            // sortModel={[{field:'fechaPartido'}]}
            localeText={esES.components.MuiDataGrid.defaultProps.localeText}
          />
        </Box>
        <Box component="div" sx={{alignItems:'center',width:{xs:'100vw',md:1000},mt:2}}>
          <Barras data={dataChart}></Barras>
        </Box>
    </Box>
    </>
  )
}
