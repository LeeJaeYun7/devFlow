import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { logout } from '../../../api/auth';

export function LogoutMain() {
  const navigate = useNavigate();

  useEffect(() => {
    void logout();
    navigate('/login');
  }, [navigate]);

  return null;
}
