import { Suspense } from 'react';
import WorkflowPreviewPage from '@/components/WorkflowPreviewPage';

export const dynamic = 'force-dynamic';

export default function WorkflowRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 text-white">Loading workflow...</div>}>
      <WorkflowPreviewPage />
    </Suspense>
  );
}
