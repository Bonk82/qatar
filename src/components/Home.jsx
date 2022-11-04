import { useContext } from 'react'
import { context } from '../context/authContext'
import Button from '@mui/material/Button';

export const Home = () => {
  const mi = useContext(context);
  console.log(mi);
  return (
    <div>Home <Button variant="contained">Hello World</Button> <Button color='error' variant="outlined">Hello World</Button></div>
  )
}
