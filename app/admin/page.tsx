'use client';

import React, { useState } from 'react';

// ============ TYPES ============
interface KnowledgeDoc {
  id: string;
  title: string;
  category: string;
  status: 'pending' | 'processing' | 'indexed' | 'failed';
  chunkCount: number;
  createdAt: Date;
}

type AdminTab = 'knowledge' | 'data' | 'settings';

// ============ ICONS ============
const Icons = {
  Logo: () => (
    <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" className="fill-vise-blue"/>
      <path d="M8 16L14 22L24 10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Upload: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
    </svg>
  ),
  Document: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  ),
  Database: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
    </svg>
  ),
  Settings: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
  Error: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  ),
  ArrowLeft: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  ),
};

// ============ STATUS BADGE ============
function StatusBadge({ status }: { status: KnowledgeDoc['status'] }) {
  const config = {
    pending: { classes: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Icons.Clock, label: 'Pending' },
    processing: { classes: 'bg-blue-50 text-blue-700 border-blue-200', icon: Icons.Clock, label: 'Processing' },
    indexed: { classes: 'bg-green-50 text-green-700 border-green-200', icon: Icons.Check, label: 'Indexed' },
    failed: { classes: 'bg-red-50 text-red-700 border-red-200', icon: Icons.Error, label: 'Failed' },
  };

  const { classes, icon: Icon, label } = config[status];

  return (
    <span className={`badge ${classes} border`}>
      <Icon />
      <span className="ml-1">{label}</span>
    </span>
  );
}

// ============ KNOWLEDGE MANAGEMENT ============
function KnowledgeManagement({ adminPassword }: { adminPassword: string }) {
  const [documents, setDocuments] = useState<KnowledgeDoc[]>([
    { id: '1', title: 'CBM Exchange Rate Policy 2024', category: 'Regulations', status: 'indexed', chunkCount: 24, createdAt: new Date() },
    { id: '2', title: 'Myanmar Banking Regulations', category: 'Banking', status: 'indexed', chunkCount: 156, createdAt: new Date() },
    { id: '3', title: 'Gold Market Trading Framework', category: 'Markets', status: 'indexed', chunkCount: 45, createdAt: new Date() },
  ]);
  const [uploadText, setUploadText] = useState('');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('General');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const categories = ['Regulations', 'Banking', 'Markets', 'Tax', 'SME', 'General'];

  const handleUpload = async () => {
    if (!uploadText.trim() || !uploadTitle.trim()) {
      setUploadStatus({ type: 'error', message: 'Please provide both title and content' });
      return;
    }

    setIsUploading(true);
    setUploadStatus(null);

    try {
      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // API expects `text` (not `content`) and requires `password`
          text: uploadText,
          password: adminPassword,
          // Keep metadata for future compatibility / debugging
          title: uploadTitle,
          category: uploadCategory,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const chunksUploaded = data.uploadedCount ?? data.chunks ?? 0;
        setUploadStatus({ type: 'success', message: `Successfully processed ${chunksUploaded} chunks` });
        const newDoc: KnowledgeDoc = {
          id: Date.now().toString(),
          title: uploadTitle,
          category: uploadCategory,
          status: 'indexed',
          chunkCount: chunksUploaded,
          createdAt: new Date(),
        };
        setDocuments(prev => [newDoc, ...prev]);
        setUploadText('');
        setUploadTitle('');
      } else {
        setUploadStatus({ type: 'error', message: data.error || 'Upload failed' });
      }
    } catch (error) {
      setUploadStatus({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <div className="card">
        <div className="card-header flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-vise-blue">
            <Icons.Upload />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Upload Knowledge</h3>
            <p className="text-sm text-gray-500">Add policies, regulations, and guidelines</p>
          </div>
        </div>
        <div className="card-body space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Document Title</label>
              <input
                type="text"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="e.g., CBM Policy Update 2024"
                className="input-field"
              />
            </div>
            <div>
              <label className="input-label">Category</label>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                className="select-field"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="input-label">Content</label>
            <textarea
              value={uploadText}
              onChange={(e) => setUploadText(e.target.value)}
              placeholder="Paste your policy document, regulation text, or guideline content here..."
              className="input-field min-h-[200px] font-mono text-sm"
              rows={10}
            />
            <p className="text-xs text-gray-400 mt-2">
              Content will be auto-chunked, embedded using Gemini, and indexed in Supabase Vector DB
            </p>
          </div>

          {uploadStatus && (
            <div className={`p-4 rounded-lg text-sm flex items-center gap-2 ${
              uploadStatus.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {uploadStatus.type === 'success' ? <Icons.Check /> : <Icons.Error />}
              {uploadStatus.message}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={isUploading || !uploadText.trim() || !uploadTitle.trim()}
            className={`btn btn-primary w-full ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isUploading ? (
              <span className="flex items-center gap-2">
                <div className="loading-dots"><span></span><span></span><span></span></div>
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Icons.Upload />
                Upload & Train
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Documents List */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-vise-purple">
              <Icons.Document />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Indexed Documents</h3>
              <p className="text-sm text-gray-500">{documents.length} documents in knowledge base</p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Chunks</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {documents.map(doc => (
                <tr key={doc.id}>
                  <td className="font-medium text-gray-900">{doc.title}</td>
                  <td><span className="badge badge-muted">{doc.category}</span></td>
                  <td className="font-mono">{doc.chunkCount}</td>
                  <td><StatusBadge status={doc.status} /></td>
                  <td className="text-gray-500">{doc.createdAt.toLocaleDateString()}</td>
                  <td>
                    <button className="btn-icon text-gray-400 hover:text-red-500">
                      <Icons.Trash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============ DATA MANAGEMENT ============
function DataManagement() {
  return (
    <div className="space-y-8">
      <div className="card">
        <div className="card-header flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-vise-indigo">
            <Icons.Database />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Upload Financial Data</h3>
            <p className="text-sm text-gray-500">Upload datasets for analysis</p>
          </div>
        </div>
        <div className="card-body">
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center hover:border-vise-blue transition-colors cursor-pointer">
            <Icons.Upload />
            <p className="text-gray-600 mt-4">Drag and drop CSV or Excel files</p>
            <p className="text-sm text-gray-400 mt-1">or click to browse</p>
          </div>
          
          <div className="mt-6 p-4 rounded-lg bg-surface">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Supported Data Types</h4>
            <div className="grid grid-cols-3 gap-3">
              {['Revenue & Cost', 'Cash Flow', 'Balance Sheet', 'P&L', 'Ratios', 'Benchmarks'].map(type => (
                <div key={type} className="flex items-center gap-2 text-sm text-gray-600">
                  <Icons.Check />
                  <span>{type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Calculation Rules</h3>
        </div>
        <div className="card-body space-y-3">
          {[
            { name: 'Profit Margin', formula: '(Revenue - Costs) / Revenue × 100' },
            { name: 'ROI', formula: '(Gain - Investment) / Investment × 100' },
            { name: 'Current Ratio', formula: 'Current Assets / Current Liabilities' },
            { name: 'Debt to Equity', formula: 'Total Debt / Total Equity' },
          ].map(rule => (
            <div key={rule.name} className="flex items-center justify-between p-3 rounded-lg bg-surface border border-gray-100">
              <span className="text-sm font-medium text-gray-700">{rule.name}</span>
              <code className="text-xs text-vise-blue font-mono bg-blue-50 px-2 py-1 rounded">{rule.formula}</code>
            </div>
          ))}
          <button className="btn btn-secondary">Add Custom Rule</button>
        </div>
      </div>
    </div>
  );
}

// ============ SETTINGS ============
function SettingsPanel() {
  return (
    <div className="space-y-8">
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">API Configuration</h3>
        </div>
        <div className="card-body space-y-4">
          {[
            { label: 'Supabase URL', key: 'SUPABASE_URL' },
            { label: 'Supabase Key', key: 'SUPABASE_PRIVATE_KEY' },
            { label: 'Google API Key', key: 'GOOGLE_API_KEY' },
            { label: 'Groq API Key', key: 'GROQ_API_KEY' },
          ].map(item => (
            <div key={item.key}>
              <label className="input-label">{item.label}</label>
              <input type="password" placeholder="Set via .env.local" className="input-field" disabled />
            </div>
          ))}
          <p className="text-xs text-gray-400">API keys are configured via environment variables for security.</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">System Information</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Version', value: '1.0.0' },
              { label: 'Environment', value: 'Production' },
              { label: 'Embedding', value: 'text-embedding-004' },
              { label: 'Vector DB', value: 'Supabase pgvector' },
            ].map(item => (
              <div key={item.label} className="p-4 rounded-lg bg-surface">
                <p className="text-xs text-gray-500 uppercase tracking-wider">{item.label}</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ MAIN ADMIN PAGE ============
export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('knowledge');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const handleLogin = () => {
    if (password === 'admin123') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Invalid password');
    }
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-vise-blue to-vise-purple flex items-center justify-center mx-auto mb-4">
              <Icons.Settings />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
            <p className="text-sm text-gray-500 mt-2">Knowledge & Data Management</p>
          </div>

          <div className="card p-6">
            <div className="space-y-4">
              <div>
                <label className="input-label">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="Enter admin password"
                  className="input-field"
                />
              </div>

              {authError && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <Icons.Error />
                  {authError}
                </p>
              )}

              <button onClick={handleLogin} className="btn btn-primary w-full">
                Login
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center mt-4">Default: admin123</p>
        </div>
      </div>
    );
  }

  // Main Admin Dashboard
  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="btn-icon">
              <Icons.ArrowLeft />
            </a>
            <div className="flex items-center gap-3">
              <Icons.Logo />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Admin Portal</h1>
                <p className="text-xs text-gray-500">Knowledge & Data Management</p>
              </div>
            </div>
          </div>
          <button onClick={() => setIsAuthenticated(false)} className="btn btn-ghost text-sm">
            Logout
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <nav className="flex gap-1">
            {[
              { id: 'knowledge' as AdminTab, label: 'Knowledge', icon: Icons.Document, href: '/admin/knowledge' },
              { id: 'data' as AdminTab, label: 'Data', icon: Icons.Database },
              { id: 'settings' as AdminTab, label: 'Settings', icon: Icons.Settings },
            ].map(tab => (
              <a
                key={tab.id}
                href={tab.href || `#${tab.id}`}
                onClick={(e) => {
                  if (!tab.href) {
                    e.preventDefault();
                    setActiveTab(tab.id);
                  }
                }}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-vise-blue text-vise-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon />
                {tab.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === 'knowledge' && <KnowledgeManagement adminPassword={password} />}
        {activeTab === 'data' && <DataManagement />}
        {activeTab === 'settings' && <SettingsPanel />}
      </main>
    </div>
  );
}
