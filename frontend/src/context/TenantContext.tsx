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
    const updateTenantInfo = () => {
      const info = getTenantInfo();
      const prevSlug = tenantInfo.slug;
      const prevIsMaster = tenantInfo.isMasterDomain;
      
      // Only update if something actually changed
      if (info.slug !== prevSlug || info.isMasterDomain !== prevIsMaster) {
        setTenantInfo(info);
        setLoading(true);

        // If we're on a tenant subdomain (production or localhost with ?tenant=), fetch branding info
        if (info.slug && !info.isMasterDomain) {
          fetchBranding();
        } else {
          setBranding(null);
          setLoading(false);
        }
      }
    };

    // Initial load
    updateTenantInfo();

    // Listen for URL changes using multiple methods
    const handleLocationChange = () => {
      updateTenantInfo();
    };

    // Listen to popstate for browser back/forward
    window.addEventListener('popstate', handleLocationChange);
    
    // Listen to pushstate/replacestate (for programmatic navigation)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      setTimeout(handleLocationChange, 0);
    };
    
    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      setTimeout(handleLocationChange, 0);
    };

    // Also check periodically for query param changes (fallback)
    const interval = setInterval(handleLocationChange, 1000);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      clearInterval(interval);
    };
  }, [tenantInfo.slug, tenantInfo.isMasterDomain]);

  const fetchBranding = async () => {
    try {
      setLoading(true);
      setError(null);
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
      } else {
        // Tenant not found or no branding data
        setBranding(null);
        setError(`Tenant "${tenantInfo.slug}" tidak dijumpai atau tidak aktif`);
      }
    } catch (err: any) {
      console.error('Failed to fetch tenant branding:', err);
      if (err.response?.status === 404) {
        setError(`Tenant "${tenantInfo.slug}" tidak dijumpai. Sila pastikan tenant wujud dalam sistem.`);
      } else {
        setError('Gagal memuatkan maklumat tenant');
      }
      setBranding(null);
    } finally {
      setLoading(false);
    }
  };

  const value: TenantContextType = {
    tenantInfo,
    branding,
    loading,
    error,
    isTenant: !tenantInfo.isMasterDomain && tenantInfo.slug !== '', // Include localhost with tenant
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
