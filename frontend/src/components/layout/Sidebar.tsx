'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  FileBarChart, 
  Settings,
  LogOut,
  Mosque,
  UserCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Papan Pemuka' },
  { href: '/borang/baru', icon: FileText, label: 'Borang Baru' },
  { href: '/isi-rumah', icon: Users, label: 'Senarai Isi Rumah' },
  { href: '/laporan', icon: FileBarChart, label: 'Laporan' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col h-full bg-green-800 text-white">
      {/* Logo & Title */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-white p-2 rounded-lg">
            <Mosque className="w-8 h-8 text-green-800" />
          </div>
          <div>
            <h1 className="font-bold text-lg">MKCS</h1>
            <p className="text-xs text-green-200">Sistem Bancian Kariah</p>
          </div>
        </div>
        <p className="text-xs text-green-200 mt-2">
          Masjid Al-Huda Padang Matsirat
        </p>
      </div>

      <Separator className="bg-green-700" />

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start text-white hover:bg-green-700 hover:text-white',
                  isActive && 'bg-green-700'
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </Button>
            </Link>
          );
        })}

        {user?.role === 'ADMIN' && (
          <>
            <Separator className="bg-green-700 my-4" />
            <Link href="/pengguna">
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start text-white hover:bg-green-700 hover:text-white',
                  pathname === '/pengguna' && 'bg-green-700'
                )}
              >
                <Settings className="mr-3 h-5 w-5" />
                Pengurusan Pengguna
              </Button>
            </Link>
          </>
        )}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-green-700">
        <div className="flex items-center gap-3 mb-3 p-2">
          <UserCircle className="h-8 w-8" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-green-200 truncate">{user?.email}</p>
            <p className="text-xs text-green-300">{user?.role}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-white hover:bg-red-600 hover:text-white"
          onClick={logout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Log Keluar
        </Button>
      </div>
    </div>
  );
}
