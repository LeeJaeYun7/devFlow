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
import { Chat, Menu, Close, Person } from '@mui/icons-material';
const chatList = Array.from({ length: 100 }, (_, index) => `채팅방 ${index + 1}`);

export function ServiceRootSidebar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setOpen] = useState(isMobile ? false : true);

  const handleDrawerClose = () => setOpen(false);

  useEffect(() => {
    if (isMobile) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, [isMobile]);

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
          <Menu />
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
            <Close />
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
              <ListItemButton>
                <ListItemIcon>
                  <Chat />
                </ListItemIcon>
                <ListItemText primary="채팅" />
              </ListItemButton>
              <ListItemButton>
                <ListItemIcon>
                  <Person />
                </ListItemIcon>
                <ListItemText primary="마이 페이지" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
        <Divider sx={{ fontSize: '0.8rem' }}>채팅 목록</Divider>
        <Box sx={{ height: '60%', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
          <List>
            {chatList.map((chat) => (
              <ListItem key={chat} disablePadding sx={{ display: 'block' }}>
                <ListItemButton>
                  <ListItemIcon>
                    <Chat />
                  </ListItemIcon>
                  <ListItemText primary={chat} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
