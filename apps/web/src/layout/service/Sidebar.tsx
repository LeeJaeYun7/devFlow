import {
  useMediaQuery,
  useTheme,
  Drawer,
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  ListItemIcon,
  Button,
  Typography,
} from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ChatIcon from '@mui/icons-material/Chat';
import AddIcon from '@mui/icons-material/Add';
import { useUser } from '../../context/UserProvider';
import { useChatList, useCreateChat, useDeleteAllChats } from '../../hooks/useChat';
import { useUserMySelf } from '../../hooks/useUser';
import { useSSEEvent } from '../../context/SSEContext';
import { useQueryClient } from '@tanstack/react-query';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import WbSunnyIcon from '@mui/icons-material/WbSunnyOutlined';
import NightsStayIcon from '@mui/icons-material/NightsStayOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LaunchIcon from '@mui/icons-material/Launch';
import LogoutIcon from '@mui/icons-material/Logout';
import { ServiceSidebarMenu, ServiceSidebarMenuProps } from './SidebarMenu';
import { ColorModeContext } from '../../Theme';
import { logout } from '../../api/auth';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import { enqueueSnackbar } from 'notistack';

export function ServiceRootSidebar() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { data: userMySelf } = useUserMySelf();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const colorMode = useContext(ColorModeContext);
  const [open, setOpen] = useState(isMobile ? false : true);
  const { mutateAsync: createChat } = useCreateChat();
  const { mutateAsync: deleteAllChats } = useDeleteAllChats();
  const { data: chatList, isLoading: isChatListLoading } = useChatList({ page: 1, limit: 50 });
  const { nowChatId, setNowChatId } = useUser();
  const queryClient = useQueryClient();
  const handleDrawerClose = () => setOpen(false);

  useEffect(() => {
    if (!nowChatId && !isChatListLoading) {
      const [firstChat] = chatList?.data?.data ?? [];
      if (firstChat) {
        setNowChatId(firstChat.chatId);
      } else {
        createChat().then((chat) => {
          setNowChatId(chat.data.chatId);
        });
      }
    }
  }, [chatList, isChatListLoading, nowChatId, setNowChatId]);

  useEffect(() => {
    setOpen(isMobile ? false : true);
  }, [isMobile]);

  const MenuList: ServiceSidebarMenuProps[] = [
    {
      title: 'Home',
      icon: <HomeIcon />,
      onClick: () => navigate('/'),
    },
    {
      title: 'Clear conversations',
      icon: <DeleteOutlineIcon />,
      onClick: async () => {
        await deleteAllChats();
        queryClient.invalidateQueries({ queryKey: ['chatList'], exact: false });
        enqueueSnackbar('모든 채팅이 삭제되었습니다', {
          variant: 'success',
          autoHideDuration: 3000,
        });
        createChat();
      },
    },
    {
      title: `${theme.palette.mode === 'dark' ? 'Light' : 'Dark'} mode`,
      icon: theme.palette.mode === 'dark' ? <WbSunnyIcon /> : <NightsStayIcon />,
      onClick: colorMode.toggleColorMode,
    },
    {
      title: `My account (${userMySelf?.data?.remainMessageQuota ?? 0})`,
      icon: <PersonOutlineIcon />,
      onClick: () => navigate('/profile'),
    },
    {
      title: 'Updates & FAQ',
      icon: <LaunchIcon />,
      onClick: () => navigate('/faq'),
    },
    {
      title: 'Log out',
      icon: <LogoutIcon />,
      onClick: async () => {
        void logout();
        navigate('/login');
      },
    },
  ];

  useSSEEvent('chatTitle', (event) => {
    const data = JSON.parse(event.data) as { chatId: string; title: string };
    queryClient.setQueryData(['chatList', { page: 1, limit: 50 }], (oldData: any) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        data: {
          ...oldData.data,
          data: oldData.data.data.map((chat: any) => {
            if (chat.chatId === data.chatId) {
              return { ...chat, title: data.title };
            }
            return chat;
          }),
        },
      };
    });
  });

  return (
    <>
      {!open && isMobile && (
        <IconButton
          onClick={() => setOpen(true)}
          sx={{
            position: 'fixed',
            top: 12,
            left: 12,
            zIndex: (theme) => theme.zIndex.drawer + 1,
            borderRadius: '12px',
            bgcolor: 'background.default',
            padding: '8px',
            width: '40px',
            height: '40px',
            border: (theme) =>
              `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
            boxShadow: 2,
            '&:hover': {
              bgcolor: 'background.paper',
              boxShadow: 3,
            },
          }}
        >
          <MenuIcon fontSize="small" />
        </IconButton>
      )}
      {open && isMobile && (
        <IconButton
          onClick={handleDrawerClose}
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 3000,
            borderRadius: '12px',
            bgcolor: 'background.default',
            boxShadow: 2,
            '&:hover': {
              bgcolor: 'background.paper',
              boxShadow: 3,
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      )}
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        open={open}
        onClose={handleDrawerClose}
        sx={{
          '& .MuiDrawer-paper': {
            bgcolor: 'background.default',
            borderRight: 'none',
            boxShadow: 'none',
            width: 256,
          },
        }}
      >
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            p: 1,
            position: 'relative',
            bgcolor: 'background.default',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: '1px',
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'),
            }}
          />
          <img
            src={theme.palette.mode === 'dark' ? '/icon/lia_logo_white.svg' : '/icon/lia_logo_black.svg'}
            alt="LIA"
            style={{ width: '40%', objectFit: 'cover', padding: '16px' }}
          />
          <CreateChatButton />
          <ChatList />
          <Divider sx={{ mt: 1 }} />
          <List sx={{ mt: 1, mb: 1 }}>
            {MenuList.map((menu) => (
              <ServiceSidebarMenu key={menu.title} title={menu.title} icon={menu.icon} onClick={menu.onClick} />
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}

function ChatList() {
  const navigate = useNavigate();
  const { data: chatList } = useChatList({ page: 1, limit: 50 });
  const { nowChatId, setNowChatId } = useUser();

  return (
    <Box sx={{ flex: 1, overflow: 'auto', mt: 1 }}>
      <List>
        {(chatList?.data?.data ?? []).map((chat) => (
          <ListItem key={chat.chatId} disablePadding>
            <ListItemButton
              onClick={() => {
                setNowChatId(chat.chatId);
                navigate('/');
              }}
              selected={nowChatId === chat.chatId}
              sx={{
                py: 1,
                mb: 0.5,
                bgcolor: nowChatId === chat.chatId ? 'rgba(0, 0, 0, 0.7)' : 'transparent',
              }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <ChatIcon sx={{ fontSize: '1rem' }} />
              </ListItemIcon>
              <ListItemText
                primary={chat.title}
                slotProps={{
                  primary: {
                    fontSize: '0.875rem',
                    fontWeight: 400,
                    noWrap: true,
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

function CreateChatButton() {
  const navigate = useNavigate();
  const { mutateAsync: createChat } = useCreateChat();
  const { setNowChatId } = useUser();

  const handleCreateChat = async () => {
    const chat = await createChat();
    setNowChatId(chat.data.chatId);
    navigate('/');
  };

  return (
    <Button
      onClick={handleCreateChat}
      type="button"
      variant="contained"
      color="primary"
      sx={{
        borderRadius: 1,
        mt: 1,
        py: 1,
        mx: 1,
      }}
    >
      <AddIcon sx={{ fontSize: '1rem' }} />
      <Typography
        sx={{
          fontSize: '0.875rem',
          fontWeight: 500,
        }}
      >
        New Chat
      </Typography>
    </Button>
  );
}
