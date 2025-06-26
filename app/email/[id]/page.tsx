import { notFound } from 'next/navigation';
import axios from 'axios';

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

export default async function EmailViewer({ params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/emails/${id}`);
    const email: Email = res.data.email;

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
  } catch {
    notFound();
  }
}
