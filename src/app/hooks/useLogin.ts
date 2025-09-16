import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function useLogin() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push('/');
    }
  }, [session, router]);

  const isLoading = status === 'loading';
  const isAuthenticated = !!session;

  return {
    isLoading,
    isAuthenticated,
    session
  };
}
