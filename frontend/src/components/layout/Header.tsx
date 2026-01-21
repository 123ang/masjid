'use client';

import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Settings, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  const { user, logout } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b">
      <div className="flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3 gap-2">
        {/* Logo and Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <Image
            src="/logo.png"
            alt="Logo"
            width={32}
            height={32}
            className="object-contain flex-shrink-0 sm:w-10 sm:h-10"
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-sm sm:text-lg font-bold text-green-800 truncate">
              MASJID AL-HUDA PADANG MATSIRAT
            </h1>
            <p className="text-xs text-gray-600 hidden sm:block">Sistem Bancian Anak Kariah</p>
          </div>
        </div>

        {/* Right side - User menu */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2 sm:px-3">
                <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                  <AvatarFallback className="bg-green-600 text-white text-sm">
                    {user?.name ? getInitials(user.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="w-64 max-w-[calc(100vw-1rem)] bg-white text-gray-900 border border-gray-200 shadow-lg"
            >
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-500 break-all">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              {user?.role === 'ADMIN' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/pengguna" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Pengguna
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/kampung" className="cursor-pointer">
                      <MapPin className="mr-2 h-4 w-4" />
                      Kampung
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Log Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
