'use client';

import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/auth-store/useAuthStore';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { authUser, isLoggingOut } = useAuthStore();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!authUser && !isLoggingOut) {
      redirect('/');
    } else {
      setChecked(true);
    }
  }, [authUser, isLoggingOut]);

  if (!checked) return null;

  return <>{children}</>;
}
