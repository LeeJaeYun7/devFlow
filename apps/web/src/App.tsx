import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import { CssBaseline, StyledEngineProvider } from '@mui/material';
import { DarkModeProvider } from './context/DarkModeProvider';
import { RootLayout } from './layout/RootLayout';
import { ServiceRootSidebar } from './layout/service/Sidebar';
import AdminSidebar from './layout/admin/Sidebar';
import { AdminUrlMap } from './layout/admin/Path.constant';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserProvider } from './context/UserProvider';
import { SnackbarProvider } from 'notistack';
import { SSEProvider } from './context/SSEContext';
import { lazy } from 'react';
import { ChatMain } from './components/service/chat/Main';
import { LoginMain } from './components/login/LoginMain';
import { ProfileMain } from './components/service/profile/Main';
import { FaqMain } from './components/service/faq/Main';

// Lazy loading으로 컴포넌트 import
const ChatHistoryMain = lazy(() =>
  import('./components/admin/chatHistory/Main').then((module) => ({ default: module.ChatHistoryMain }))
);
const CollectStorkDataMain = lazy(() =>
  import('./components/admin/collectStorkData/Main').then((module) => ({ default: module.CollectStorkDataMain }))
);
const UserMain = lazy(() => import('./components/admin/user/Main').then((module) => ({ default: module.UserMain })));
const SystemPromptMain = lazy(() =>
  import('./components/admin/systemPrompt/Main').then((module) => ({ default: module.SystemPromptMain }))
);
const CallbackMain = lazy(() => import('./components/login/callback/Main'));

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <DarkModeProvider>
          <StyledEngineProvider injectFirst>
            <SSEProvider>
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
                    <Route path="/admin" element={<RootLayout sidebar={<AdminSidebar />} />}>
                      <Route path="/admin" element={<Navigate to={AdminUrlMap.user} />} />
                      <Route path={AdminUrlMap.user} element={<UserMain />} />
                      <Route path={AdminUrlMap.systemPrompt} element={<SystemPromptMain />} />
                      <Route path={AdminUrlMap.collectStorkData} element={<CollectStorkDataMain />} />
                      <Route path={AdminUrlMap.chatHistory} element={<ChatHistoryMain />} />
                    </Route>
                  </Routes>
                </Suspense>
              </SnackbarProvider>
            </SSEProvider>
          </StyledEngineProvider>
        </DarkModeProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}
