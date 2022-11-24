import { useEffect, useState } from "react"
import ReactApexChart from "react-apexcharts";
// import Chart from "react-apexcharts";

export const Linea = ({data}) => {
// console.log(data);
useEffect(() => {
  recargarData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
}, [data])

const [chartLine, setCharLine] = useState({options:{},series:[]})

const recargarData=()=>{
  // console.log('recargando');
  const options = {
    chart: {
      height: 900,
      type: 'line',
      zoom: {
        enabled: false
      }
    },
    dataLabels: {
      enabled: false
    },
    // theme: {
    //   mode: 'light', 
    //   palette: 'palette7', 
    // },
    colors:['#56042c'],
    // stroke: {
    //   curve: 'straight'
    // },
    title: {
      text: data.titulos?.c,
      align: 'left',
      style:{
        color:'#56042c'
      }
    },
    grid: {
      row: {
        colors: ['#d4d4d4', '#fff'], // takes an array which will be repeated on columns
      },
    },
    xaxis: {
      title:{
        text:data.titulos?.x,
        offsetY: 86
      },
      categories: data.x//['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    },
    yaxis:{
      decimalsInFloat: 2,
      title:{
        text:data.titulos?.y
      },
      min:0,
    },
    markers: {
      size: 10,
      colors:['#fec310']
    },
    responsive: [
      {
        breakpoint: 480,
        options:{
          chart:{
            height: 400,
          },
          markers: {
            size: 6,
          },
        }
      }
    ]
  }

  const series = [{
    name: data.name,
    data: data.y//[10, 41, 35, 51, 49, 62, 69, 91, 148]
  }]

  setCharLine({options,series})
}


  return (
    <div id="chart">
      <ReactApexChart options={chartLine.options} series={chartLine.series} type='line' height={500} width='100%' />
    </div>
  )
}
