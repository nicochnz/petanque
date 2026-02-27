import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function useLogin() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.replace('/');
    }
  }, [session, status, router]);

  return {
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    session
  };
}
