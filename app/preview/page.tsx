import { Suspense } from 'react';
import PreviewPage from '@/components/PreviewPage';

export default function PreviewRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 text-white">Loading preview...</div>}>
      <PreviewPage />
    </Suspense>
  );
}
