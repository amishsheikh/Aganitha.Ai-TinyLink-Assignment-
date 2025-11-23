'use client';

import { useState, useEffect } from 'react';
import { Copy, Trash2, BarChart2, Link2, AlertCircle, Check, Scissors, Heart } from 'lucide-react';

interface LinkData {
  id: string;
  code: string;
  originalUrl: string;
  clicks: number;
  createdAt: string;
  lastClickedAt: string | null;
}

export default function Dashboard() {
  const [links, setLinks] = useState<LinkData[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [code, setCode] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch links on load
  const fetchLinks = async () => {
    try {
      const res = await fetch('/api/links');
      if (!res.ok) throw new Error('Failed to fetch links');
      const data = await res.json();
      setLinks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  // Handle Create Link
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalUrl: url, code: code || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          throw new Error('Custom alias already exists.');
        }
        throw new Error(data.error || 'Something went wrong');
      }

      setUrl('');
      setCode('');
      fetchLinks();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (codeToDelete: string) => {
    if (!confirm('Delete this link permanently?')) return;
    setLinks(links.filter((link) => link.code !== codeToDelete));
    try {
      await fetch(`/api/links/${codeToDelete}`, { method: 'DELETE' });
    } catch (err) {
      fetchLinks();
    }
  };

  const handleCopy = (shortCode: string, id: string) => {
    const fullUrl = `${window.location.origin}/${shortCode}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 flex flex-col">

      {/* Navbar */}
      <nav className="border-b border-slate-800/60 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
              <Link2 size={20} className="text-white" />
            </div>
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              TinyLink
            </span>
          </div>
          <div className="text-xs font-mono text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
            v1.0-beta
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12 space-y-10 flex-grow w-full">

        {/* Hero / Input Section */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Shorten Your Links. <span className="text-indigo-400">Expand Your Reach.</span>
            </h1>
            <p className="text-slate-400">Paste a long URL below to create a memorable short link instantly.</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl shadow-2xl shadow-black/50 backdrop-blur-sm relative overflow-hidden">
            {/* Gradient decorative blur */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <form onSubmit={handleSubmit} className="relative flex flex-col md:flex-row gap-3">
              <div className="flex-grow">
                <input
                  type="url"
                  required
                  placeholder="Paste your long URL here..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white placeholder-slate-500 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div className="md:w-48">
                <input
                  type="text"
                  placeholder="alias (opt)"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white placeholder-slate-500 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {formLoading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Scissors size={18} />
                    Shorten
                  </>
                )}
              </button>
            </form>

            {error && (
              <div className="mt-4 p-3 bg-red-900/20 border border-red-900/50 text-red-400 text-sm rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
          </div>
        </section>

        {/* Links Grid/Table */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-semibold text-slate-200">Recent Links</h3>
            <button onClick={fetchLinks} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              Sync Data
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          ) : links.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed">
              <p className="text-slate-500">No active links found.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {links.map((link) => (
                <div key={link.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-colors group">

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <a href={`/${link.code}`} target="_blank" className="text-indigo-400 font-medium hover:underline text-lg">
                        /{link.code}
                      </a>
                      <button
                        onClick={() => handleCopy(link.code, link.id)}
                        className="p-1.5 rounded-md hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {copiedId === link.id ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 truncate">
                      <span className="truncate max-w-[300px]">{link.originalUrl}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 text-sm text-slate-400">
                    <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                      <BarChart2 size={14} className="text-indigo-500" />
                      <span>{link.clicks}</span>
                    </div>

                    <div className="text-xs text-slate-600">
                      {new Date(link.createdAt).toLocaleDateString()}
                    </div>

                    <button
                      onClick={() => handleDelete(link.code)}
                      className="text-slate-600 hover:text-red-400 transition-colors p-2 hover:bg-red-950/30 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-900 bg-slate-950">
        <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
          <span>Made with</span>
          <Heart size={16} className="text-pink-500 fill-pink-500/20 animate-pulse" />
          <span>by <span className="text-indigo-400 font-medium">Amish</span></span>
        </div>
      </footer>
    </div>
  );
}
