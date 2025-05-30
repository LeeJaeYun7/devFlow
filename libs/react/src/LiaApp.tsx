import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserProvider } from './context/UserProvider';
import { DarkModeProvider } from './context/DarkModeProvider';
import { StyledEngineProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import { CssBaseline } from '@mui/material';

export interface LiaAppProps {
  children: React.ReactNode;
}

const queryClient = new QueryClient();

export default function LiaApp({ children }: LiaAppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <DarkModeProvider>
          <StyledEngineProvider injectFirst>
            <SnackbarProvider>
              <CssBaseline />
              {children}
            </SnackbarProvider>
          </StyledEngineProvider>
        </DarkModeProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}
