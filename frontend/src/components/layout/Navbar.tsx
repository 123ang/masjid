'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  FileBarChart, 
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Papan Pemuka' },
  { href: '/borang/baru', icon: FileText, label: 'Borang Baru' },
  { href: '/isi-rumah', icon: Users, label: 'Senarai Isi Rumah' },
  { href: '/laporan', icon: FileBarChart, label: 'Laporan' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <nav className="bg-white border-b">
      <div className="px-6 py-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  className={cn(
                    'whitespace-nowrap',
                    isActive && 'bg-green-600 hover:bg-green-700'
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}

          {user?.role === 'ADMIN' && (
            <Link href="/pengguna">
              <Button
                variant={pathname === '/pengguna' ? 'default' : 'ghost'}
                size="sm"
                className={cn(
                  'whitespace-nowrap',
                  pathname === '/pengguna' && 'bg-green-600 hover:bg-green-700'
                )}
              >
                <Settings className="mr-2 h-4 w-4" />
                Pengguna
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
