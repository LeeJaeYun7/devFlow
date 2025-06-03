import LoginModal from '@lia/react/components/login/LoginModal';
import { useUser } from '@lia/react/context/UserProvider';
import { AppBar, Avatar, Box, IconButton, Tooltip } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ServiceTopbar() {
  const { isLogin } = useUser();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const navigate = useNavigate();

  const onAvatarClick = () => {
    if (!isLogin) {
      setIsLoginModalOpen(true);
    } else {
      navigate('/profile');
    }
  };

  return (
    <>
      <AppBar position="static" sx={{ p: 1, bgcolor: 'background.default' }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Tooltip title="LIA">
            <IconButton onClick={onAvatarClick}>
              <Avatar src="/icon/lia.png" />
            </IconButton>
          </Tooltip>
        </Box>
      </AppBar>
      <LoginModal open={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
}
