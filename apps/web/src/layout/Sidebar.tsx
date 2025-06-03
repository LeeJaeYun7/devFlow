import {
  useMediaQuery,
  useTheme,
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  ListItemIcon,
  Button,
  Typography,
  Menu,
  MenuItem,
} from '@mui/material';
import { useEffect, useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ChatIcon from '@mui/icons-material/Chat';
import AddIcon from '@mui/icons-material/Add';
import { useUser } from '@lia/react/context/UserProvider';
import { useChatList, useCreateChat, useDeleteChat } from '../hooks/useChat';
import { useSSEEvent } from '../context/SSEContext';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

export function ServiceRootSidebar() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setOpen] = useState(isMobile ? false : true);
  const { mutateAsync: createChat } = useCreateChat();
  const { data: chatList, isLoading: isChatListLoading } = useChatList({ page: 1, limit: 50 });
  const { nowChatId, setNowChatId, isLogin } = useUser();
  const queryClient = useQueryClient();
  const handleDrawerClose = () => setOpen(false);

  useEffect(() => {
    if (!nowChatId && !isChatListLoading) {
      const [firstChat] = chatList?.data?.data ?? [];
      if (firstChat) {
        setNowChatId(firstChat.chatId);
      } else if (isLogin) {
        createChat().then((chat) => {
          setNowChatId(chat.data.chatId);
        });
      }
    }
  }, [chatList, isChatListLoading, nowChatId, setNowChatId, isLogin]);

  useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);

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
            onClick={() => navigate('/')}
            alt="LIA"
            style={{ width: '40%', objectFit: 'cover', padding: '16px', cursor: 'pointer' }}
          />
          <CreateChatButton />
          <ChatList />
        </Box>
      </Drawer>
    </>
  );
}

function ChatList() {
  const navigate = useNavigate();
  const { data: chatList } = useChatList({ page: 1, limit: 50 });

  const { nowChatId, setNowChatId } = useUser();
  const { mutateAsync: deleteChat } = useDeleteChat();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDeleteChat = async (chatId: string) => {
    await deleteChat({ chatId });
    if (nowChatId === chatId) {
      setNowChatId('');
    }
  };

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
              <IconButton
                sx={{ p: 0.5 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setAnchorEl(e.currentTarget);
                }}
              >
                <MoreVertIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={!!anchorEl}
                elevation={1}
                onClose={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  setAnchorEl(null);
                }}
              >
                <MenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteChat(chat.chatId);
                    setAnchorEl(null);
                  }}
                >
                  <DeleteOutlineIcon />
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, ml: 1 }}>Delete</Typography>
                </MenuItem>
              </Menu>
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
