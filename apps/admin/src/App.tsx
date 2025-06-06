import { SnackbarProvider } from 'notistack';
import { CssBaseline } from '@mui/material';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminUrlMap } from './layouts/Path.constant';
import AdminSidebar from './layouts/Sidebar';
import { RootLayout } from '@lia/react/layouts/RootLayout';

// @lia/react components
import LiaApp from '@lia/react/LiaApp';
import { LoginMain } from '@lia/react/components/login/LoginMain';
import CallbackMain from '@lia/react/components/login/callback/Main';

// components
import { UserMain } from './components/user/Main';
import { SystemPromptMain } from './components/systemPrompt/Main';
import { CollectStorkDataMain } from './components/collectStorkData/Main';
import { CheckAdmin } from './layouts/CheckAdmin';

function AdminLayout() {
  return (
    <CheckAdmin>
      <RootLayout sidebar={<AdminSidebar />} contentSx={{ p: 3 }} />
    </CheckAdmin>
  );
}

export default function App() {
  return (
    <LiaApp>
      <SnackbarProvider>
        <CssBaseline />
        <Routes>
          <Route path="/" element={<AdminLayout />}>
            <Route path="/" element={<Navigate to={AdminUrlMap.user} />} />
            <Route path={AdminUrlMap.user} element={<UserMain />} />
            <Route path={AdminUrlMap.systemPrompt} element={<SystemPromptMain />} />
            <Route path={AdminUrlMap.collectStorkData} element={<CollectStorkDataMain />} />
          </Route>
          <Route>
            <Route path="/login" element={<LoginMain />} />
          </Route>
          <Route path="/login/callback" element={<CallbackMain />} />
        </Routes>
      </SnackbarProvider>
    </LiaApp>
  );
}
