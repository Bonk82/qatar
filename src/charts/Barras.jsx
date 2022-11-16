import { useEffect, useState } from 'react'
import Chart from "react-apexcharts";

export const Barras = ({data}) => {
  console.log(data);
  useEffect(() => {
    recargarData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])
  
  const [chartBar, setChartBar] = useState({options:{},series:[]});

  const recargarData=()=>{
    console.log('recargando');
    const options = {
      chart: {
        id: "basic-bar"
      },
      xaxis: {
        categories: data.x, //[1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999]
        title:{
          text:data.titulos?.x,
          offsetY: 80,
        }
      },
      yaxis:{
        title:{
          text:data.titulos?.y
        }
      },
      theme: {
        mode: 'light', 
        palette: 'palette7', 
      },
      title:{
        text:data.titulos?.c,
      },
      tooltip:{
        theme:'dark',
      }
    }
  
    const series = [
      {
        name: "UPRE BET",
        data: data.y//[30, 40, 45, 50, 49, 60, 70, 91]
      }
    ]
  
    setChartBar({options,series})
  }


  return (
    <Chart options={chartBar.options} series={chartBar.series} type='bar' width='100%' />
  )
}
