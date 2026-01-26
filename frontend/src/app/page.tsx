'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTenantInfo } from '@/lib/tenant';
import { Loader2 } from 'lucide-react';
import LandingPage from '@/components/landing/LandingPage';

export default function Home() {
  const router = useRouter();
  const [pageType, setPageType] = useState<'loading' | 'landing' | 'tenant'>('loading');

  useEffect(() => {
    const info = getTenantInfo();
    
    // Main domain (i-masjid.my or www.i-masjid.my) → Show landing page
    if (info.isMasterDomain) {
      setPageType('landing');
      return;
    }
    
    // Tenant subdomain (alhuda.i-masjid.my) or localhost with ?tenant=alhuda → Redirect to /umum
    if (info.slug) {
      // Preserve tenant query param when redirecting
      const urlParams = new URLSearchParams(window.location.search);
      const tenantParam = urlParams.get('tenant');
      if (tenantParam) {
        router.replace(`/umum?tenant=${tenantParam}`);
      } else {
        router.replace('/umum');
      }
      return;
    }
    
    // Localhost without tenant → Show landing page
    if (info.isLocalhost) {
      setPageType('landing');
      return;
    }
    
    // Fallback
    setPageType('landing');
  }, [router]);

  if (pageType === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (pageType === 'landing') {
    return <LandingPage />;
  }

  // This shouldn't be reached, but just in case
  return null;
}
