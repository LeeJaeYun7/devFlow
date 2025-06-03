import { Box, useTheme } from '@mui/material';
import LoginContent from './LoginContent';
import InfoFooter from './InfoFooter';

export function LoginMain() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        bgcolor: theme.palette.background.default,
        minHeight: '100vh',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        minHeight="70vh"
        marginTop={10}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <LoginContent />
      </Box>
      <InfoFooter />
    </Box>
  );
}
