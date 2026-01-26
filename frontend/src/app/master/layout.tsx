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
import { getTenantInfo } from '@/lib/tenant';
import axios from 'axios';

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
    const checkAuth = async () => {
      // Check if we're on a tenant subdomain - master panel should only be accessible from main domain
      const tenantInfo = getTenantInfo();
      if (tenantInfo.slug && !tenantInfo.isLocalhost) {
        // Redirect tenant subdomains to their public dashboard
        router.push('/umum');
        return;
      }

      const storedAdmin = localStorage.getItem('masterAdmin');
      const accessToken = localStorage.getItem('masterAccessToken');
      const refreshToken = localStorage.getItem('masterRefreshToken');

      // If no tokens at all, redirect to login (unless already on login page)
      if (!accessToken && !refreshToken) {
        if (!pathname.includes('/master/login')) {
          router.push('/master/login');
        }
        setLoading(false);
        return;
      }

      // If we have tokens, validate them
      if (accessToken || refreshToken) {
        try {
          const getApiUrl = () => {
            if (typeof window !== 'undefined') {
              const isProduction = window.location.hostname !== 'localhost' && 
                                  window.location.hostname !== '127.0.0.1';
              if (isProduction) {
                return '/api';
              }
            }
            return 'http://localhost:3001/api';
          };

          // First, try to validate current access token by calling /me
          if (accessToken) {
            try {
              const meResponse = await axios.get(`${getApiUrl()}/master/auth/me`, {
                headers: { Authorization: `Bearer ${accessToken}` },
              });
              
              // Token is valid, set admin
              setAdmin(meResponse.data);
              setLoading(false);
              return;
            } catch (error: any) {
              // Access token is invalid/expired, try to refresh
              if (error.response?.status === 401 && refreshToken) {
                try {
                  const refreshResponse = await axios.post(`${getApiUrl()}/master/auth/refresh`, {
                    refreshToken,
                  });

                  // Update tokens
                  localStorage.setItem('masterAccessToken', refreshResponse.data.accessToken);
                  localStorage.setItem('masterRefreshToken', refreshResponse.data.refreshToken);
                  
                  // Get admin info with new token
                  const meResponse = await axios.get(`${getApiUrl()}/master/auth/me`, {
                    headers: { Authorization: `Bearer ${refreshResponse.data.accessToken}` },
                  });
                  
                  localStorage.setItem('masterAdmin', JSON.stringify(meResponse.data));
                  setAdmin(meResponse.data);
                  setLoading(false);
                  return;
                } catch (refreshError) {
                  // Refresh failed, clear everything and redirect to login
                  localStorage.removeItem('masterAccessToken');
                  localStorage.removeItem('masterRefreshToken');
                  localStorage.removeItem('masterAdmin');
                  if (!pathname.includes('/master/login')) {
                    router.push('/master/login');
                  }
                  setLoading(false);
                  return;
                }
              } else {
                // No refresh token or other error, clear and redirect
                localStorage.removeItem('masterAccessToken');
                localStorage.removeItem('masterRefreshToken');
                localStorage.removeItem('masterAdmin');
                if (!pathname.includes('/master/login')) {
                  router.push('/master/login');
                }
                setLoading(false);
                return;
              }
            }
          } else if (refreshToken) {
            // Only refresh token available, try to refresh
            try {
              const refreshResponse = await axios.post(`${getApiUrl()}/master/auth/refresh`, {
                refreshToken,
              });

              localStorage.setItem('masterAccessToken', refreshResponse.data.accessToken);
              localStorage.setItem('masterRefreshToken', refreshResponse.data.refreshToken);
              
              const meResponse = await axios.get(`${getApiUrl()}/master/auth/me`, {
                headers: { Authorization: `Bearer ${refreshResponse.data.accessToken}` },
              });
              
              localStorage.setItem('masterAdmin', JSON.stringify(meResponse.data));
              setAdmin(meResponse.data);
              setLoading(false);
              return;
            } catch (refreshError) {
              localStorage.removeItem('masterAccessToken');
              localStorage.removeItem('masterRefreshToken');
              localStorage.removeItem('masterAdmin');
              if (!pathname.includes('/master/login')) {
                router.push('/master/login');
              }
              setLoading(false);
              return;
            }
          }
        } catch (error) {
          // Fallback: if stored admin exists, use it (but this shouldn't happen)
          if (storedAdmin) {
            setAdmin(JSON.parse(storedAdmin));
          } else if (!pathname.includes('/master/login')) {
            router.push('/master/login');
          }
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    checkAuth();
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
