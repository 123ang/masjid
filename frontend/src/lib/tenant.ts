/**
 * Tenant/Subdomain Detection Utilities
 * 
 * This module provides utilities for detecting and working with
 * tenant subdomains in the multi-tenant i-masjid.my platform.
 */

export interface TenantInfo {
  slug: string;
  isMasterDomain: boolean;
  isLocalhost: boolean;
  fullDomain: string;
}

/**
 * Extract subdomain from the current hostname
 * 
 * Examples:
 * - alhuda.i-masjid.my → { slug: 'alhuda', isMasterDomain: false }
 * - i-masjid.my → { slug: '', isMasterDomain: true }
 * - www.i-masjid.my → { slug: '', isMasterDomain: true }
 * - localhost:3000 → { slug: '', isLocalhost: true }
 * - localhost:3000?tenant=alhuda → { slug: 'alhuda', isLocalhost: true }
 */
export function getTenantInfo(): TenantInfo {
  if (typeof window === 'undefined') {
    return {
      slug: '',
      isMasterDomain: false,
      isLocalhost: true,
      fullDomain: '',
    };
  }

  const hostname = window.location.hostname;
  const fullDomain = window.location.host;

  // Local development - check for tenant query parameter
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Check for tenant query parameter for local testing
    const urlParams = new URLSearchParams(window.location.search);
    const tenantSlug = urlParams.get('tenant');
    
    if (tenantSlug) {
      return {
        slug: tenantSlug,
        isMasterDomain: false,
        isLocalhost: true,
        fullDomain,
      };
    }
    
    return {
      slug: '',
      isMasterDomain: false,
      isLocalhost: true,
      fullDomain,
    };
  }

  // Split hostname by dots
  const parts = hostname.split('.');

  // For i-masjid.my (2 parts) or www.i-masjid.my
  if (parts.length === 2) {
    return {
      slug: '',
      isMasterDomain: true,
      isLocalhost: false,
      fullDomain,
    };
  }

  // For subdomain.i-masjid.my (3+ parts)
  if (parts.length >= 3) {
    const subdomain = parts[0];

    // www is treated as main domain
    if (subdomain === 'www') {
      return {
        slug: '',
        isMasterDomain: true,
        isLocalhost: false,
        fullDomain,
      };
    }

    return {
      slug: subdomain,
      isMasterDomain: false,
      isLocalhost: false,
      fullDomain,
    };
  }

  return {
    slug: '',
    isMasterDomain: false,
    isLocalhost: false,
    fullDomain,
  };
}

/**
 * Check if we're on the master domain (i-masjid.my)
 */
export function isMasterDomain(): boolean {
  return getTenantInfo().isMasterDomain;
}

/**
 * Check if we're on a tenant subdomain
 */
export function isTenantDomain(): boolean {
  const info = getTenantInfo();
  return !info.isMasterDomain && !info.isLocalhost && info.slug !== '';
}

/**
 * Get the current tenant slug
 */
export function getTenantSlug(): string {
  return getTenantInfo().slug;
}

/**
 * Check if we're in local development
 */
export function isLocalDevelopment(): boolean {
  return getTenantInfo().isLocalhost;
}

/**
 * Build a URL for a specific tenant
 */
export function buildTenantUrl(slug: string, path: string = ''): string {
  if (typeof window === 'undefined') {
    return `https://${slug}.i-masjid.my${path}`;
  }

  const { isLocalhost } = getTenantInfo();

  if (isLocalhost) {
    // For local dev, just return the path
    // You might want to handle this differently
    return path || '/';
  }

  return `https://${slug}.i-masjid.my${path}`;
}

/**
 * Build a URL for the master domain
 */
export function buildMasterUrl(path: string = ''): string {
  if (typeof window === 'undefined') {
    return `https://i-masjid.my${path}`;
  }

  const { isLocalhost } = getTenantInfo();

  if (isLocalhost) {
    return path || '/';
  }

  return `https://i-masjid.my${path}`;
}
