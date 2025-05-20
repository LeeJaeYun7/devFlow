import axios from 'axios';

export const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

export const api = axios.create({
  headers: {
    Authorization: `Bearer ${
      document.cookie
        .split('; ')
        .find((row) => row.startsWith('authorization='))
        ?.split('=')[1] ?? ''
    }`,
  },
});
