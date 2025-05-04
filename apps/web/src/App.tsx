import { Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, StyledEngineProvider } from '@mui/material';
import { DarkModeProvider } from './context/DarkModeProvider';
import { ChatMain } from './components/service/chat/Main';
import { ChatHistoryMain } from './components/admin/chatHistory/Main';
import { CollectStorkDataMain } from './components/admin/collectStorkData/Main';
import { UserMain } from './components/admin/user/Main';
import { SystemPromptMain } from './components/admin/systemPrompt/Main';
import { RootLayout } from './layout/RootLayout';
import { ServiceRootSidebar } from './layout/service/Sidebar';
import AdminSidebar from './layout/admin/Sidebar';
import { AdminUrlMap } from './layout/admin/Path.constant';

export default function App() {
  return (
    <DarkModeProvider>
      <StyledEngineProvider injectFirst>
        <CssBaseline />
        <Routes>
          <Route path="/" element={<RootLayout sidebar={<ServiceRootSidebar />} />}>
            <Route path="/" element={<ChatMain />} />
          </Route>
          <Route path="/admin" element={<RootLayout sidebar={<AdminSidebar />} />}>
            <Route path="/admin" element={<Navigate to={AdminUrlMap.user} />} />
            <Route path={AdminUrlMap.user} element={<UserMain />} />
            <Route path={AdminUrlMap.systemPrompt} element={<SystemPromptMain />} />
            <Route path={AdminUrlMap.collectStorkData} element={<CollectStorkDataMain />} />
            <Route path={AdminUrlMap.chatHistory} element={<ChatHistoryMain />} />
          </Route>
        </Routes>
      </StyledEngineProvider>
    </DarkModeProvider>
  );
}
