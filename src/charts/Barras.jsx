import { useEffect, useState } from 'react'
import Chart from "react-apexcharts";

export const Barras = ({data}) => {
  console.log(data);
  useEffect(() => {
    recargarData();
  }, [data])
  
  const [chartBar, setChartBar] = useState({options:{},series:[]});

  const recargarData=()=>{
    console.log('recargando');
    const options = {
      chart: {
        id: "basic-bar"
      },
      xaxis: {
        categories: data.x //[1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999]
      },
      theme: {
        mode: 'light', 
        palette: 'palette7', 
      },
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
