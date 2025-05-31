import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserMetric } from '../hooks/useUser';

interface CheckAdminProps {
  children: React.ReactNode;
}

export function CheckAdmin({ children }: CheckAdminProps) {
  const navigate = useNavigate();
  const { isError } = useUserMetric({});

  useEffect(() => {
    if (isError) {
      navigate('/login');
    }
  }, [isError, navigate]);

  return children;
}
