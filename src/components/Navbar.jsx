import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const settings = ['Dashboard', 'Salir'];
export const Navbar = () => {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const {user,logout} = useAuth();
  const [pages, setPages] = useState(['Fixture', 'Apuestas', 'Posiciones'])

  useEffect(() => {
    console.log('revisando',user);
    if(user.rol === 'administrador'){
      const pagesAdmin = ['Fixture', 'Apuestas', 'Posiciones','Admin']
      setPages(pagesAdmin)
    }
  }, [user])
  

  const navigate = useNavigate();

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = (e) => {
    const destino = e.target.textContent 
    console.log({destino});
    setAnchorElNav(null);
    if(destino === 'Fixture') navigate('/');
    if(destino === 'Apuestas') navigate('/bet');
    if(destino === 'Posiciones') navigate('/ranking');
    if(destino === 'Admin') navigate('/admin');
  };

  const handleCloseUserMenu = async (e) => {
    console.log(e.target?.textContent);
    if(e.target?.textContent === 'Salir'){
      try {
        await logout();
      } catch (error) {
        console.error(error.message);
      }
    }
  };

  return (
    <AppBar position="sticky">
      <Container maxWidth="xl" sx={{fontFamily:'monospace',color:'primary'}}>
        <Toolbar disableGutters>
          {/* <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} /> */}
          <Avatar sx={{ display: { xs: 'none', md: 'flex' }, mr: 1}} src="../assets/qatar_logo_fifa.jpg" variant='rounded' />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'antiquewhite',
              textDecoration: 'none',
            }}
          >
            Qatar 2022
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map((page) => (
                <MenuItem key={page} onClick={handleCloseNavMenu}>
                  <Typography textAlign="center">{page}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          {/* <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} /> */}
          {/* <img src="../assets/qatar_logo_fifa.jpg" alt="Qatar 2022"  height="50" width="80"  /> */}
          <Avatar sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} src="../assets/qatar_logo_fifa.jpg" variant='rounded'/>
          <Typography
            variant="h5"
            noWrap
            component="a"
            href=""
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'antiquewhite',
              textDecoration: 'none',
            }}
          >
            Qatar 2022
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'antiquewhite',fontFamily:'monospace',fontSize:'large', display: 'block' }}
              >
                {page}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            <Typography sx={{display:{xs:'none',md:'inline-flex'},marginRight:4,color:'antiquewhite'}}>bienvenido {user.displayName || user.email}</Typography>
            <Tooltip title="Configuraciones">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="C" src={user.providerData[0]?.photoURL || user.reloadUserInfo?.photoUrl} />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem key={setting} onClick={handleCloseUserMenu}>
                  <Typography textAlign="center">{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
