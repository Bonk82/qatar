import { Box } from "@mui/material"
import { Navbar } from "../components/Navbar"

export const AppLayout = ({children}) => {
  return (
    <Box sx={{ display: 'flex' }}>
        <Navbar/>
        <Box component='main' sx={{width:{xs:'100%',md:'80%'},justifyContent:'center'}}>
            { children }
        </Box>
    </Box>
  )
}
