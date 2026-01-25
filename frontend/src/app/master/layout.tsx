'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Settings,
  LogOut,
  Menu,
  X,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MasterAdmin {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function MasterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<MasterAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Check if user is logged in as master admin
    const storedAdmin = localStorage.getItem('masterAdmin');
    const accessToken = localStorage.getItem('masterAccessToken');

    if (storedAdmin && accessToken) {
      setAdmin(JSON.parse(storedAdmin));
    } else if (!pathname.includes('/master/login')) {
      router.push('/master/login');
    }

    setLoading(false);
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('masterAccessToken');
    localStorage.removeItem('masterRefreshToken');
    localStorage.removeItem('masterAdmin');
    router.push('/master/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/master/dashboard', icon: LayoutDashboard },
    { name: 'Tenants', href: '/master/tenants', icon: Building2 },
    { name: 'Master Admins', href: '/master/admins', icon: Users },
    { name: 'Settings', href: '/master/settings', icon: Settings },
  ];

  // For login page, don't show the layout
  if (pathname === '/master/login') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-purple-900 text-white transform transition-transform duration-200 ease-in-out
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-purple-800">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-purple-300" />
            <div>
              <h1 className="font-bold text-lg">i-masjid.my</h1>
              <p className="text-xs text-purple-300">Master Admin</p>
            </div>
          </div>
          <button 
            className="lg:hidden text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-purple-800 text-white' 
                    : 'text-purple-200 hover:bg-purple-800 hover:text-white'}
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-purple-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-700 flex items-center justify-center">
              {admin.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{admin.name}</p>
              <p className="text-xs text-purple-300 truncate">{admin.email}</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full border-purple-700 text-purple-200 hover:bg-purple-800 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              className="lg:hidden text-gray-600"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex-1 lg:hidden text-center">
              <span className="font-semibold text-purple-900">i-masjid.my</span>
            </div>
            <div className="text-sm text-gray-500 hidden lg:block">
              {new Date().toLocaleDateString('ms-MY', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
