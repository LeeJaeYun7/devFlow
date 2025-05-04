import { Routes, Route } from 'react-router-dom';
import { CssBaseline, StyledEngineProvider } from '@mui/material';
import { ServiceRootLayout } from './layout/service/RootLayout';
import { DarkModeProvider } from './context/DarkModeProvider';
import { ChatMain } from './components/service/chat/Main';

export default function App() {
  return (
    <DarkModeProvider>
      <StyledEngineProvider injectFirst>
        <CssBaseline />
        <Routes>
          <Route path="/" element={<ServiceRootLayout />}>
            <Route path="/" element={<ChatMain />} />
          </Route>
        </Routes>
      </StyledEngineProvider>
    </DarkModeProvider>
  );
}
