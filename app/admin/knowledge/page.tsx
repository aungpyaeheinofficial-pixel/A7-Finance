'use client';

import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  Loader2, 
  Trash2, 
  Check,
  ArrowLeft,
  Database,
  Settings
} from 'lucide-react';

// ============ TYPES ============

interface KnowledgeDocument {
  id: string;
  title: string;
  category: string;
  chunks: number;
  status: 'pending' | 'processing' | 'indexed' | 'failed';
  created_at: string;
  content?: string;
}

interface UploadFormData {
  title: string;
  category: string;
  content: string;
}

// ============ MAIN COMPONENT ============

export default function KnowledgePage() {
  const [formData, setFormData] = useState<UploadFormData>({
    title: '',
    category: 'General',
    content: ''
  });
  
  const [isUploading, setIsUploading] = useState(false);
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [chunksCreated, setChunksCreated] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'knowledge' | 'data' | 'settings'>('knowledge');

  useEffect(() => {
    fetchDocuments();
  }, []);

  // ============ DATA FETCHING ============

  async function fetchDocuments() {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/documents');
      
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // ============ TEXT CHUNKING ============

  function chunkText(text: string, maxLength: number = 500): string[] {
    // Split by sentences first
    const sentences = text.match(/[^.!?\n]+[.!?\n]+/g) || [text];
    const chunks: string[] = [];
    let currentChunk = '';
    
    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (!trimmedSentence) continue;
      
      if (currentChunk.length + trimmedSentence.length + 1 <= maxLength) {
        currentChunk += (currentChunk ? ' ' : '') + trimmedSentence;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = trimmedSentence;
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks.length > 0 ? chunks : [text];
  }

  // ============ DELAY HELPER ============

  function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============ UPLOAD HANDLER ============

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setUploadError('Please provide both title and content');
      return;
    }

    setIsUploading(true);
    setStep(0);
    setProgress(0);
    setUploadSuccess(false);
    setUploadError(null);

    try {
      // Step 1: Chunk content
      setStep(1);
      setProgress(20);
      await delay(300);
      
      // Step 2: Generate embeddings (via API)
      setStep(2);
      setProgress(30);
      
      const response = await fetch('/api/admin/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          content: formData.content,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorData.error || errorData.message || 'Upload failed');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }
      
      // Step 3: Indexing complete
      setStep(3);
      setProgress(100);
      await delay(500);
      
      setUploadSuccess(true);
      setChunksCreated(result.chunks || 0);
      
      // Reset form and refresh documents
      setTimeout(() => {
        setFormData({ title: '', category: 'General', content: '' });
        setUploadSuccess(false);
        setChunksCreated(0);
        fetchDocuments();
      }, 3000);

    } catch (error: any) {
      console.error('Upload failed:', error);
      const errorMessage = error.message || error.error || 'Failed to upload document. Please check your connection and try again.';
      setUploadError(errorMessage);
      setStep(0);
      setProgress(0);
    } finally {
      setIsUploading(false);
    }
  }

  // ============ DELETE HANDLER ============

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/documents/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchDocuments();
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  }

  // ============ DATE FORMATTER ============

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  // ============ RENDER ============

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 md:px-8 py-4 z-40">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            <a 
              href="/admin" 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </a>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Admin Portal</h1>
              <p className="text-sm text-gray-500">Knowledge & Data Management</p>
            </div>
          </div>

          {/* Right Section */}
          <button 
            onClick={() => window.location.href = '/admin'}
            className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="fixed top-[73px] left-0 right-0 bg-white border-b border-gray-200 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <nav className="flex gap-8">
            {[
              { id: 'knowledge' as const, label: 'Knowledge', icon: FileText },
              { id: 'data' as const, label: 'Data', icon: Database },
              { id: 'settings' as const, label: 'Settings', icon: Settings },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'data') window.location.href = '/admin?tab=data';
                  if (tab.id === 'settings') window.location.href = '/admin?tab=settings';
                }}
                className={`flex items-center gap-2 px-0 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-[146px] pb-12">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          {/* Upload Knowledge Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm mb-6 animate-fade-in">
            {/* Card Header */}
            <div className="flex items-start gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 via-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Upload Knowledge</h2>
                <p className="text-sm text-gray-500">Add policies, regulations, and guidelines</p>
              </div>
            </div>

            {/* Upload Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Row 1: Title and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., CBM Policy Update 2024"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-900 cursor-pointer"
                  >
                    <option value="General">General</option>
                    <option value="Regulations">Regulations</option>
                    <option value="Banking">Banking</option>
                    <option value="Policy">Policy</option>
                    <option value="Guidelines">Guidelines</option>
                    <option value="Tax">Tax</option>
                    <option value="SME">SME</option>
                  </select>
                </div>
              </div>

              {/* Content Textarea */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content (Policies, Regulations, Guidelines)
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={12}
                  placeholder="Paste your policy document, regulation text, or guideline content here..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-mono text-sm text-gray-900"
                  required
                />
                <p className="mt-2 text-xs text-gray-500">
                  Content will be auto-chunked, embedded using Gemini text-embedding-004, and indexed in Supabase Vector DB
                </p>
              </div>

              {/* Error Message */}
              {uploadError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <div>
                    <p className="font-medium text-red-900 text-sm">Upload Failed</p>
                    <p className="text-xs text-red-700 mt-1">{uploadError}</p>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isUploading && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-blue-900">
                      Processing document...
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-xs text-blue-700 mb-4">
                    <div className="flex items-center gap-2">
                      {step >= 1 ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <div className="w-4 h-4 border-2 border-blue-300 rounded-full" />
                      )}
                      <span>Chunking content into sections</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {step >= 2 ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <div className="w-4 h-4 border-2 border-blue-300 rounded-full" />
                      )}
                      <span>Generating embeddings with Gemini</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {step >= 3 ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <div className="w-4 h-4 border-2 border-blue-300 rounded-full" />
                      )}
                      <span>Indexing in Vector Database</span>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg overflow-hidden">
                    <div 
                      className="h-1.5 bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Success Notification */}
              {uploadSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900 text-sm">
                      Document uploaded successfully!
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      {chunksCreated} chunks created and indexed in vector database
                    </p>
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <button
                type="submit"
                disabled={isUploading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3.5 px-6 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Upload & Train
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Indexed Documents Table */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm animate-fade-in">
            {/* Table Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Indexed Documents
                  </h2>
                  <p className="text-sm text-gray-500">
                    {documents.length} documents in knowledge base
                  </p>
                </div>
              </div>
              
              <button 
                onClick={fetchDocuments}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Refresh
              </button>
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-500">Loading documents...</p>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  No documents yet
                </h3>
                <p className="text-xs text-gray-500">
                  Upload your first policy document to get started
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Chunks
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  
                  <tbody className="bg-white divide-y divide-gray-100">
                    {documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4">
                          <span className="font-medium text-gray-900 text-sm">
                            {doc.title}
                          </span>
                        </td>
                        
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            {doc.category}
                          </span>
                        </td>
                        
                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-600 font-mono">
                            {doc.chunks}
                          </span>
                        </td>
                        
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                            doc.status === 'indexed'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : doc.status === 'processing'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : doc.status === 'failed'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }`}>
                            {doc.status === 'indexed' && <CheckCircle className="w-3.5 h-3.5" />}
                            {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                          </span>
                        </td>
                        
                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-600">
                            {formatDate(doc.created_at)}
                          </span>
                        </td>
                        
                        <td className="px-4 py-4 text-right">
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                            title="Delete document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

