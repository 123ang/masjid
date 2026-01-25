'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTenantInfo, TenantInfo } from '@/lib/tenant';
import api from '@/lib/api';

interface TenantBranding {
  name: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

interface TenantContextType {
  tenantInfo: TenantInfo;
  branding: TenantBranding | null;
  loading: boolean;
  error: string | null;
  isTenant: boolean;
  isMaster: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenantInfo, setTenantInfo] = useState<TenantInfo>({
    slug: '',
    isMasterDomain: false,
    isLocalhost: true,
    fullDomain: '',
  });
  const [branding, setBranding] = useState<TenantBranding | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const info = getTenantInfo();
    setTenantInfo(info);

    // If we're on a tenant subdomain, fetch branding info
    if (info.slug && !info.isMasterDomain && !info.isLocalhost) {
      fetchBranding();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchBranding = async () => {
    try {
      const response = await api.get('/analytics/public/tenant-info');
      if (response.data) {
        setBranding(response.data);

        // Apply branding colors as CSS variables
        if (response.data.primaryColor) {
          document.documentElement.style.setProperty(
            '--primary-color',
            response.data.primaryColor
          );
        }
        if (response.data.secondaryColor) {
          document.documentElement.style.setProperty(
            '--secondary-color',
            response.data.secondaryColor
          );
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch tenant branding:', err);
      setError('Gagal memuatkan maklumat tenant');
    } finally {
      setLoading(false);
    }
  };

  const value: TenantContextType = {
    tenantInfo,
    branding,
    loading,
    error,
    isTenant: !tenantInfo.isMasterDomain && !tenantInfo.isLocalhost && tenantInfo.slug !== '',
    isMaster: tenantInfo.isMasterDomain,
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
