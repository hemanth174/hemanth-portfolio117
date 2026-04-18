import { Suspense } from 'react';
import TestingPage from '@/components/TestingPage';

export default function TestingRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 text-white">Loading testing page...</div>}>
      <TestingPage />
    </Suspense>
  );
}
