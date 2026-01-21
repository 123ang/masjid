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
  Settings,
  MapPin
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
      <div className="px-3 sm:px-6 py-2 sm:py-3">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-hide pb-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  className={cn(
                    'whitespace-nowrap flex-shrink-0',
                    isActive && 'bg-green-600 hover:bg-green-700'
                  )}
                >
                  <item.icon className="mr-1 sm:mr-2 h-4 w-4" />
                  <span className="text-xs sm:text-sm">{item.label}</span>
                </Button>
              </Link>
            );
          })}

          {user?.role === 'ADMIN' && (
            <>
              <Link href="/pengguna">
                <Button
                  variant={pathname === '/pengguna' ? 'default' : 'ghost'}
                  size="sm"
                  className={cn(
                    'whitespace-nowrap flex-shrink-0',
                    pathname === '/pengguna' && 'bg-green-600 hover:bg-green-700'
                  )}
                >
                  <Settings className="mr-1 sm:mr-2 h-4 w-4" />
                  <span className="text-xs sm:text-sm">Pengguna</span>
                </Button>
              </Link>
              <Link href="/kampung">
                <Button
                  variant={pathname === '/kampung' ? 'default' : 'ghost'}
                  size="sm"
                  className={cn(
                    'whitespace-nowrap flex-shrink-0',
                    pathname === '/kampung' && 'bg-green-600 hover:bg-green-700'
                  )}
                >
                  <MapPin className="mr-1 sm:mr-2 h-4 w-4" />
                  <span className="text-xs sm:text-sm">Kampung</span>
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
