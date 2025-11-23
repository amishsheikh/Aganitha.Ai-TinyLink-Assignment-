'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BarChart2, Globe, Clock, AlertCircle, MousePointer2 } from 'lucide-react';

interface LinkData {
  id: string;
  code: string;
  originalUrl: string;
  clicks: number;
  createdAt: string;
  lastClickedAt: string | null;
}

export default function StatsPage() {
  // useParams hooks into the Next.js router to get the dynamic route segment
  const params = useParams();
  const code = params?.code as string;

  const [link, setLink] = useState<LinkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;

    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/links/${code}`);

        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Link not found');
          }
          throw new Error('Failed to fetch statistics');
        }

        const data = await res.json();
        setLink(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-black/10 border-t-black rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // 404 / Error State
  if (error || !link) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Link Not Found</h2>
          <p className="text-gray-500 mb-6">
            The link <strong>/{code}</strong> does not exist or has been deleted.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Navigation */}
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 hover:text-black transition-colors group"
        >
          <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>

        {/* Main Stats Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="border-b border-gray-100 bg-gray-50/50 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-blue-600">/{link.code}</span>
                <span className="text-gray-400 font-normal text-base">Analytics</span>
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Created on {new Date(link.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' })}
              </p>
            </div>
            <div>
               <a
                 href={`/${link.code}`}
                 target="_blank"
                 className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
               >
                 Visit Link
                 <ExternalLinkIcon />
               </a>
            </div>
          </div>

          <div className="p-6 space-y-8">

            {/* Original URL */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Globe size={14} />
                Original Destination
              </h3>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 break-all text-gray-800 font-mono text-sm">
                {link.originalUrl}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Total Clicks */}
              <div className="p-6 rounded-xl border border-blue-100 bg-blue-50/30 flex flex-col items-center justify-center text-center space-y-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                  <MousePointer2 size={20} />
                </div>
                <div>
                  <div className="text-4xl font-extrabold text-gray-900 tracking-tight">
                    {link.clicks.toLocaleString()}
                  </div>
                  <div className="text-sm font-medium text-gray-500 mt-1">Total Clicks</div>
                </div>
              </div>

              {/* Last Clicked */}
              <div className="p-6 rounded-xl border border-gray-200 bg-white flex flex-col items-center justify-center text-center space-y-3 shadow-sm">
                <div className="p-2 bg-gray-100 text-gray-600 rounded-full">
                  <Clock size={20} />
                </div>
                <div>
                  {link.lastClickedAt ? (
                    <>
                      <div className="text-xl font-bold text-gray-900">
                        {new Date(link.lastClickedAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400 font-mono mt-1">
                        {new Date(link.lastClickedAt).toLocaleTimeString()}
                      </div>
                      <div className="text-sm font-medium text-gray-500 mt-2">Last Activity</div>
                    </>
                  ) : (
                    <>
                      <div className="text-lg font-bold text-gray-400">No clicks yet</div>
                      <div className="text-sm font-medium text-gray-500 mt-1">Waiting for traffic...</div>
                    </>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// Simple internal icon component to avoid extra imports if needed,
// though lucide-react is available.
function ExternalLinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}
