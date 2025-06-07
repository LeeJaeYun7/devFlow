import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../../constants/api.constant';

export default function Main() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const setCookie = async () => {
      const token = searchParams.get('token');

      if (token) {
        await api.post('/api/auth/callback', { token });
      }

      navigate('/');
    };

    setCookie();
  }, [searchParams, navigate]);

  return <div>Loading...</div>;
}
