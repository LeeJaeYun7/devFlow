import {
  useMediaQuery,
  useTheme,
  Drawer,
  Box,
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
import { Menu, Close, Person } from '@mui/icons-material';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import AddToPhotosIcon from '@mui/icons-material/AddToPhotos';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import { Link, useLocation } from 'react-router-dom';
import { AdminUrlMap } from './Path.constant';

export default function AdminSidebar() {
  const theme = useTheme();
  const location = useLocation();
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
              <ListItemButton component={Link} to={AdminUrlMap.user} selected={location.pathname === AdminUrlMap.user}>
                <ListItemIcon>
                  <Person />
                </ListItemIcon>
                <ListItemText primary="유저" />
              </ListItemButton>
              <ListItemButton
                component={Link}
                to={AdminUrlMap.chatHistory}
                selected={location.pathname === AdminUrlMap.chatHistory}
              >
                <ListItemIcon>
                  <ManageSearchIcon />
                </ListItemIcon>
                <ListItemText primary="채팅 기록" />
              </ListItemButton>
              <ListItemButton
                component={Link}
                to={AdminUrlMap.collectStorkData}
                selected={location.pathname === AdminUrlMap.collectStorkData}
              >
                <ListItemIcon>
                  <AddToPhotosIcon />
                </ListItemIcon>
                <ListItemText primary="수집 데이터" />
              </ListItemButton>
              <ListItemButton
                component={Link}
                to={AdminUrlMap.systemPrompt}
                selected={location.pathname === AdminUrlMap.systemPrompt}
              >
                <ListItemIcon>
                  <SettingsSuggestIcon />
                </ListItemIcon>
                <ListItemText primary="시스템 프롬프트" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
}
