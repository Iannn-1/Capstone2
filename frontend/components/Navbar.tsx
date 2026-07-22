'use client';

import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { clearAuth, getUser, isAuthenticated } from '@/lib/auth';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    if (isAuthenticated()) {
      const currentUser = getUser();
      if (currentUser) {
        setUser({ name: currentUser.name, role: currentUser.role });
      }
    }
  }, []);

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  if (!user) return null;

  return (
    <nav className="border-b bg-background px-4 py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="text-xl font-bold">RFID Attendance</div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {user.name} ({user.role})
          </span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}
