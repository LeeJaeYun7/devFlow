import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../../api/api.constant';

export default function Main() {
  const [searchParams] = useSearchParams();

  const setCookie = async () => {
    const token = searchParams.get('token');

    if (token) {
      await api.post('/api/auth/callback', { token });
    }

    window.location.href = '/';
  };

  useEffect(() => {
    setCookie();
  }, []);

  return <div>Loading...</div>;
}
