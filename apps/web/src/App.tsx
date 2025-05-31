import { Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';
import { CssBaseline } from '@mui/material';
import { RootLayout } from '@lia/react/layouts/RootLayout';
import { ServiceRootSidebar } from './layout/Sidebar';
import { SnackbarProvider } from 'notistack';
import { SSEProvider } from './context/SSEContext';
import { UserProvider } from './context/UserProvider';

// @lia/react components
import LiaApp from '@lia/react/LiaApp';
import { LoginMain } from '@lia/react/components/login/LoginMain';
import CallbackMain from '@lia/react/components/login/callback/Main';

// web components
import { ChatMain } from './components/service/chat/Main';
import { ProfileMain } from './components/service/profile/Main';
import { FaqMain } from './components/service/faq/Main';

export default function App() {
  return (
    <LiaApp>
      <SSEProvider>
        <UserProvider>
          <SnackbarProvider>
            <CssBaseline />
            <Suspense fallback={<div>로딩중...</div>}>
              <Routes>
                <Route path="/" element={<RootLayout sidebar={<ServiceRootSidebar />} />}>
                  <Route path="/" element={<ChatMain />} />
                  <Route path="/profile" element={<ProfileMain />} />
                  <Route path="/faq" element={<FaqMain />} />
                </Route>
                <Route>
                  <Route path="/login" element={<LoginMain />} />
                </Route>
                <Route path="/login/callback" element={<CallbackMain />} />
              </Routes>
            </Suspense>
          </SnackbarProvider>
        </UserProvider>
      </SSEProvider>
    </LiaApp>
  );
}
