'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import axios from 'axios';

export default function MasterLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

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

  // Check if user is already logged in
  useEffect(() => {
    const checkExistingAuth = async () => {
      const accessToken = localStorage.getItem('masterAccessToken');
      const refreshToken = localStorage.getItem('masterRefreshToken');

      if (!accessToken && !refreshToken) {
        setCheckingAuth(false);
        return;
      }

      try {
        // Try to validate access token
        if (accessToken) {
          try {
            await axios.get(`${getApiUrl()}/master/auth/me`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            // Token is valid, redirect to dashboard
            router.push('/master/dashboard');
            return;
          } catch (error: any) {
            // Access token invalid, try refresh token
            if (error.response?.status === 401 && refreshToken) {
              try {
                const refreshResponse = await axios.post(`${getApiUrl()}/master/auth/refresh`, {
                  refreshToken,
                });
                
                localStorage.setItem('masterAccessToken', refreshResponse.data.accessToken);
                localStorage.setItem('masterRefreshToken', refreshResponse.data.refreshToken);
                
                // Get admin info
                const meResponse = await axios.get(`${getApiUrl()}/master/auth/me`, {
                  headers: { Authorization: `Bearer ${refreshResponse.data.accessToken}` },
                });
                
                localStorage.setItem('masterAdmin', JSON.stringify(meResponse.data));
                router.push('/master/dashboard');
                return;
              } catch (refreshError) {
                // Refresh failed, clear tokens and show login
                localStorage.removeItem('masterAccessToken');
                localStorage.removeItem('masterRefreshToken');
                localStorage.removeItem('masterAdmin');
              }
            } else {
              // No refresh token or other error, clear tokens
              localStorage.removeItem('masterAccessToken');
              localStorage.removeItem('masterRefreshToken');
              localStorage.removeItem('masterAdmin');
            }
          }
        } else if (refreshToken) {
          // Only refresh token available
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
            router.push('/master/dashboard');
            return;
          } catch (refreshError) {
            localStorage.removeItem('masterAccessToken');
            localStorage.removeItem('masterRefreshToken');
            localStorage.removeItem('masterAdmin');
          }
        }
      } catch (error) {
        // Clear invalid tokens
        localStorage.removeItem('masterAccessToken');
        localStorage.removeItem('masterRefreshToken');
        localStorage.removeItem('masterAdmin');
      }
      
      setCheckingAuth(false);
    };

    checkExistingAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${getApiUrl()}/master/auth/login`, {
        email,
        password,
      });

      const { accessToken, refreshToken, admin } = response.data;

      // Store tokens and admin data with 'master' prefix to avoid conflicts
      localStorage.setItem('masterAccessToken', accessToken);
      localStorage.setItem('masterRefreshToken', refreshToken);
      localStorage.setItem('masterAdmin', JSON.stringify(admin));

      router.push('/master/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login gagal. Sila cuba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Memeriksa sesi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-2">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-700">
            i-masjid.my
          </CardTitle>
          <CardDescription className="text-gray-600">
            Master Admin Portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="text-sm">
                {error}
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">E-mel</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@i-masjid.my"
                required
                disabled={loading}
                className="border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">Kata Laluan</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Log Masuk'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Portal ini hanya untuk Master Admin.</p>
            <p className="mt-1">
              Untuk akses tenant, sila ke subdomain anda.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
