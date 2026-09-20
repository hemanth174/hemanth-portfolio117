import type { ReactNode } from 'react';

// Admin is a live dashboard — never serve a build-time snapshot of it.
export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
