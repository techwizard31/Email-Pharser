import { notFound } from 'next/navigation';

interface Email {
  _id: string;
  sender: string;
  subject: string;
  preview: string;
  time: string;
  claimNumber?: string;
  status: 'success' | 'manual' | 'error';
  error?: string;
}

export default async function EmailViewer(props: { params: { id: string } }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/emails/${props.params.id}`, {
    cache: 'no-store',
  });

  if (!res.ok) return notFound();

  const data = await res.json();
  const email: Email = data.email;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-3xl mx-auto bg-slate-800 border border-violet-700/30 p-6 rounded-xl">
        <h1 className="text-xl font-semibold mb-2">{email.subject}</h1>
        <div className="flex justify-between text-gray-400 text-sm mb-4">
          <span>From: {email.sender}</span>
          <span>{email.time}</span>
        </div>
        <div className="text-gray-300 whitespace-pre-wrap">{email.preview}</div>

        {email.claimNumber && (
          <p className="mt-4 text-sm text-blue-400">
            🔍 Claim Number Detected: <strong>{email.claimNumber}</strong>
          </p>
        )}
        {email.status === 'error' && email.error && (
          <p className="mt-4 text-sm text-red-400">
            ⚠️ Error: {email.error}
          </p>
        )}
      </div>
    </div>
  );
}
