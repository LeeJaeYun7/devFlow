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
  Toolbar,
  Typography,
  IconButton,
  ListItemIcon,
} from '@mui/material';
import { useEffect, useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ChatIcon from '@mui/icons-material/Chat';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import { useUser } from '../../context/UserProvider';
import { useChatList, useCreateChat } from '../../hooks/useChat';
import { useUserMySelf } from '../../hooks/useUser';
import { useSSEEvent } from '../../context/SSEContext';
import { useQueryClient } from '@tanstack/react-query';

export function ServiceRootSidebar() {
  const theme = useTheme();
  const { data: userMySelf } = useUserMySelf();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setOpen] = useState(isMobile ? false : true);
  const { mutateAsync: createChat } = useCreateChat();
  const { data: chatList, isLoading: isChatListLoading } = useChatList({ page: 1, limit: 50 });
  const { nowChatId, setNowChatId } = useUser();
  const queryClient = useQueryClient();
  const handleDrawerClose = () => setOpen(false);

  const handleCreateChat = async () => {
    const chat = await createChat();
    setNowChatId(chat.data.chatId);
  };

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
    if (isMobile) {
      setOpen(false);
    } else {
      setOpen(true);
    }
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
            top: 16,
            left: 0,
            zIndex: (theme) => theme.zIndex.drawer + 1,
            borderRadius: '0 4px 4px 0',
            boxShadow: 1,
          }}
        >
          <MenuIcon />
        </IconButton>
      )}
      <Drawer variant={isMobile ? 'temporary' : 'persistent'} open={open} onClose={handleDrawerClose}>
        {open && isMobile && (
          <IconButton
            onClick={handleDrawerClose}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1,
              borderRadius: '50%',
              boxShadow: 1,
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
        <Box sx={{ height: '40%', display: 'flex', flexDirection: 'column' }}>
          <Toolbar>
            <Typography variant="h6" noWrap component="div">
              Lia
            </Typography>
          </Toolbar>
          <List>
            <ListItem disablePadding sx={{ display: 'block' }}>
              <ListItemButton selected>
                <ListItemIcon>
                  <ChatIcon />
                </ListItemIcon>
                <ListItemText primary={`채팅 (남은 수: ${userMySelf?.data?.remainMessageQuota ?? 0})`} />
              </ListItemButton>
              <MyPageList />
            </ListItem>
          </List>
        </Box>
        <Divider sx={{ fontSize: '0.8rem' }}>채팅 목록</Divider>
        <Box sx={{ height: '60%', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
          <List>
            {(chatList?.data?.data ?? []).map((chat) => (
              <ListItem key={chat.chatId} disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                  onClick={() => setNowChatId(chat.chatId)}
                  selected={nowChatId === chat.chatId}
                  sx={{ py: 0.5 }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <ChatIcon sx={{ fontSize: '1.2rem' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={chat.title}
                    sx={{
                      '& .MuiTypography-root': {
                        fontSize: '0.8rem',
                      },
                      my: 0,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
            <ListItem disablePadding sx={{ display: 'block' }}>
              <ListItemButton onClick={handleCreateChat}>
                <ListItemIcon>
                  <AddIcon />
                </ListItemIcon>
                <ListItemText primary="새 채팅" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
}

function MyPageList() {
  const { isLogin } = useUser();

  if (!isLogin) {
    return <></>;
  }

  return (
    <ListItemButton>
      <ListItemIcon>
        <PersonIcon />
      </ListItemIcon>
      <ListItemText primary="마이 페이지" />
    </ListItemButton>
  );
}
