"use client";

import React, { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Search, Menu, Settings, HelpCircle, Star, Archive, Delete,
  MoreHorizontal, ChevronDown, Paperclip, Send, Inbox,
  Users, Tag, AlertCircle, Trash2, Edit3, RefreshCw
} from 'lucide-react';

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

const fetcher = (url: string) => axios.get(url).then(res => res.data.emails);

const Page: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [isLoading, setIsLoading] = useState(false);

  const { data: emails = [], isLoading: emailsLoading, mutate } = useSWR('/api/emails', fetcher);

  // Redirect to login if not authenticated
  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const toggleEmailSelection = (id: string) => {
    setSelectedEmails(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const selectAllEmails = () => {
    setSelectedEmails(
      selectedEmails.length === emails.length
        ? []
        : emails.map((e: { _id: any; }) => e._id)
    );
  };

  const retryEmails = async () => {
    const failed = emails.filter((e: { _id: string; status: string; }) => selectedEmails.includes(e._id) && e.status !== 'success');
    for (const email of failed) {
      await axios.post(`/api/emails/retry/${email._id}`);
    }
    await mutate();
    setSelectedEmails([]);
  };

  const deleteEmails = async () => {
    for (const id of selectedEmails) {
      await axios.delete(`/api/emails/${id}`);
    }
    await mutate();
    setSelectedEmails([]);
  };

  const fetchGmailEmails = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/gmail/fetch');
      console.log('Gmail fetch response:', response.data);
      await mutate();
      alert(`Successfully fetched ${response.data.emails?.length || 0} emails`);
    } catch (error: any) {
      console.error('Failed to fetch Gmail emails:', error);
      alert(`Failed to fetch Gmail emails: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const sidebarItems = [
    { icon: <Inbox size={20} />, label: 'Inbox', count: emails.length, isActive: activeFolder === 'inbox' },
    { icon: <Star size={20} />, label: 'Starred' },
    { icon: <Send size={20} />, label: 'Sent' },
    { icon: <Edit3 size={20} />, label: 'Drafts' },
    { icon: <Archive size={20} />, label: 'Archive' },
    { icon: <AlertCircle size={20} />, label: 'Spam' },
    { icon: <Trash2 size={20} />, label: 'Trash' },
    { icon: <Users size={20} />, label: 'Social' },
    { icon: <Tag size={20} />, label: 'Promotions' },
  ];

  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 border-b border-violet-800/30 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-white hover:bg-violet-800/30 p-2 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">M</span>
              </div>
              <h1 className="text-xl font-semibold hidden sm:block">Mailyzer</h1>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search mail" 
                className="w-full bg-slate-800/50 border border-violet-800/30 rounded-lg px-10 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                <Settings size={18} />
              </button>
            </div>
          </div>

          {/* Profile & Logout */}
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-300 hidden sm:block">
              {session?.user?.email}
            </span>
            <button className="text-gray-400 hover:text-white transition-colors hidden sm:block">
              <HelpCircle size={20} />
            </button>
            <button className="text-gray-400 hover:text-white transition-colors hidden sm:block">
              <Settings size={20} />
            </button>
            <button 
              onClick={() => signOut({ callbackUrl: '/login' })} 
              className="text-sm text-red-400 hover:underline"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative z-30 w-64 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-violet-800/30 transition-transform duration-300 ease-in-out h-full overflow-y-auto`}>
          <div className="p-4">
            <button 
              onClick={fetchGmailEmails} 
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg px-4 py-3 font-medium transition-all duration-200 transform hover:scale-105 shadow-lg disabled:transform-none disabled:cursor-not-allowed"
            >
              <RefreshCw className={`inline mr-2 ${isLoading ? 'animate-spin' : ''}`} size={18} />
              {isLoading ? 'Syncing...' : 'Sync Gmail'}
            </button>
          </div>
          <nav className="px-2">
            {sidebarItems.map((item, index) => (
              <button
                key={index}
                onClick={() => setActiveFolder(item.label.toLowerCase())}
                className={`w-full flex items-center justify-between px-4 py-3 mb-1 rounded-lg transition-all duration-200 ${
                  item.isActive 
                    ? 'bg-gradient-to-r from-violet-800/50 to-blue-800/50 text-white shadow-md' 
                    : 'hover:bg-violet-800/20 text-gray-300 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span className="bg-violet-700/50 text-violet-200 text-xs px-2 py-1 rounded-full">
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-violet-800/30 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedEmails.length === emails.length}
                  onChange={selectAllEmails}
                  className="rounded border-violet-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
                />
                <button className="text-gray-400 hover:text-white transition-colors">
                  <ChevronDown size={16} />
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={retryEmails} className="text-gray-400 hover:text-white p-2 hover:bg-violet-800/20 rounded">
                  <Archive size={16} />
                </button>
                <button onClick={deleteEmails} className="text-gray-400 hover:text-white p-2 hover:bg-violet-800/20 rounded">
                  <Delete size={16} />
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>{`1-${emails.length} of ${emails.length}`}</span>
            </div>
          </div>

          {/* Email List */}
          <div className="flex-1 overflow-y-auto">
            {emailsLoading ? (
              <p className="text-center py-10 text-gray-400">Loading emails...</p>
            ) : emails.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <Inbox size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No emails found</p>
                <p className="text-sm">Click "Sync Gmail" to fetch your emails</p>
              </div>
            ) : (
              emails.map((email: Email) => (
                <Link href={`/email/${email._id}`} key={email._id}>
                  <div className="border-b border-violet-800/20 px-4 py-4 hover:bg-gradient-to-r hover:from-slate-800/50 hover:to-violet-900/20 transition-all cursor-pointer">
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedEmails.includes(email._id)}
                        onClick={(e) => {
                          e.preventDefault();
                          toggleEmailSelection(email._id);
                        }}
                        className="rounded border-violet-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            <span className="font-medium truncate text-white">{email.sender}</span>
                            {email.status === 'manual' && (
                              <span className="text-xs bg-yellow-600 text-white px-2 py-0.5 rounded">Manual</span>
                            )}
                            {email.status === 'error' && (
                              <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded">Error</span>
                            )}
                          </div>
                          <span className="text-sm text-gray-400 flex-shrink-0 ml-4">{email.time}</span>
                        </div>
                        <div className="mb-1">
                          <span className="text-sm text-gray-300">{email.subject}</span>
                        </div>
                        {email.claimNumber && (
                          <p className="text-sm text-green-400 truncate">Claim: {email.claimNumber}</p>
                        )}
                        <p className="text-sm text-gray-500 truncate">{email.preview}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Page;