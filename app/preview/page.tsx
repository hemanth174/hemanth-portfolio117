import { Suspense } from 'react';
import PreviewPage from '@/components/PreviewPage';

export const dynamic = 'force-dynamic';

const geminiKeyConfigured = Boolean(process.env.GEMINI_API_KEY);

export default function PreviewRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 text-white">Loading preview...</div>}>
      <PreviewPage geminiConfigured={geminiKeyConfigured} />
    </Suspense>
  );
}
