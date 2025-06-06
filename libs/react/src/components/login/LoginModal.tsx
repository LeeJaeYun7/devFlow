import { Box, IconButton, Modal } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LoginContent from './LoginContent';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}
export default function LoginModal({ open, onClose }: LoginModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          borderRadius: 2,
          border: '0px solid',
          p: 4,
          pb: 10,
          pt: 10,
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
        <LoginContent logoWidth={90} />
      </Box>
    </Modal>
  );
}
