import { useAuth } from './auth-context';

export function useApiClient() {
  const { user } = useAuth();

  const apiCall = async (url: string, options: RequestInit = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add user info to headers if authenticated
    if (user) {
      (headers as any)['x-user-info'] = JSON.stringify(user);
    }

    return fetch(url, {
      ...options,
      headers,
    });
  };

  return { apiCall };
}