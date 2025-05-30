import { ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';

export interface ServiceSidebarMenuProps {
  title: string;
  icon: React.ReactNode;
  onClick?: () => void | Promise<void>;
}

export function ServiceSidebarMenu({ title, icon, onClick }: ServiceSidebarMenuProps) {
  return (
    <ListItem disablePadding sx={{ mb: 1 }}>
      <ListItemButton
        onClick={onClick}
        sx={{
          py: 1,
          mb: 0.5,
        }}
      >
        <ListItemIcon sx={{ minWidth: 32, fontSize: '1.2rem' }}>{icon}</ListItemIcon>
        <ListItemText
          primary={title}
          slotProps={{
            primary: {
              fontSize: '0.875rem',
              fontWeight: 500,
            },
          }}
        />
      </ListItemButton>
    </ListItem>
  );
}
