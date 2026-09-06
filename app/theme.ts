import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3D5AFE',
      dark: '#1E3A8A',
    },
    secondary: {
      main: '#00C2A8',
    },
    warning: {
      main: '#FFB020',
    },
    error: {
      main: '#E53E3E',
    },
    background: {
      default: '#F5F6FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A2E',
      secondary: '#6B7280',
    },
  },
});

export default theme;

/*
  Paleta de colores:
  - Primario: #3D5AFE
  - Primario oscuro: #1E3A8A
  - Secundario / éxito: #00C2A8
  - Advertencia: #FFB020
  - Error: #E53E3E
  - Fondo: #F5F6FA
  - Superficie (cards): #FFFFFF
  - Texto principal: #1A1A2E
  - Texto secundario: #6B7280
  */
