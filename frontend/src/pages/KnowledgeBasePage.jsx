import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  ChevronRight,
  ShieldCheck,
  X
} from 'lucide-react';
import { getKnowledgeList, getKnowledgeDoc } from '../services/api';
import { Pill } from '../components/ui';

export default function KnowledgeBasePage() {
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeDoc, setActiveDoc] = useState(null);
  const [loadingDoc, setLoadingDoc] = useState(false);

  useEffect(() => {
    getKnowledgeList()
      .then((res) => setDocuments(res || []))
      .catch(() => {});
  }, []);

  const categories = ['ALL', ...new Set(documents.map((d) => d.category))];

  const filteredDocs = documents.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.file_name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || d.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleOpenDoc = async (category, fileName) => {
    setLoadingDoc(true);
    try {
      const doc = await getKnowledgeDoc(category, fileName);
      setActiveDoc(doc);
    } catch {
      // ignore error
    } finally {
      setLoadingDoc(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-1 border-b border-[var(--border)] pb-4">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[var(--accent)]">
          <BookOpen className="w-4 h-4" aria-hidden="true" />
          <span>Scientific Knowledge Base</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)] tracking-tight">
          Verified Earth Science &amp; Statistical Library
        </h1>
        <p className="text-xs sm:text-sm text-[var(--muted)] max-w-2xl">
          Curated methodologies from NASA, NOAA, WMO, and IPCC AR6 documentation powering EarthPulse AI&apos;s grounded explanations.
        </p>
      </div>

      {/* Search and Category Toolbar */}
      <div className="bg-[var(--card)] rounded-[14px] border border-[var(--border)] p-4 space-y-3">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search scientific articles, variables, formulas, or datasets..."
            aria-label="Search knowledge base articles"
            className="w-full bg-[var(--panel)] border border-[var(--border)] rounded-[10px] px-4 py-2 pl-10 text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)]"
          />
          <Search className="w-4 h-4 text-[var(--muted)] absolute left-3.5 top-2.5" aria-hidden="true" />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs text-[var(--muted)] mr-1 inline-flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[var(--accent)]" aria-hidden="true" />
            <span>Category:</span>
          </span>
          {categories.map((cat) => (
            <Pill
              key={cat}
              size="sm"
              active={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat.replace(/_/g, ' ').toUpperCase()}
            </Pill>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleOpenDoc(doc.category, doc.file_name)}
            disabled={loadingDoc}
            className="text-left bg-[var(--card)] border border-[var(--border)] hover:border-[var(--accent)] p-5 rounded-[14px] transition-colors flex flex-col justify-between group space-y-3"
          >
            <div className="space-y-2 w-full">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--panel)] text-[var(--accent)] border border-[var(--border)] uppercase tracking-wider">
                  {doc.category.replace(/_/g, ' ')}
                </span>
                <ChevronRight className="w-4 h-4 text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors" />
              </div>
              <h2 className="font-bold text-[var(--text)] text-base leading-snug group-hover:text-[var(--accent)] transition-colors">
                {doc.title}
              </h2>
            </div>

            <div className="w-full text-[11px] text-[var(--muted)] flex items-center justify-between pt-3 border-t border-[var(--border)]">
              <span className="font-mono text-[10px] truncate max-w-[180px]">{doc.file_name}</span>
              <span className="font-semibold flex items-center gap-1" style={{ color: 'var(--sig)' }}>
                <span>Read Article</span>
                <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Document Reader Modal */}
      {activeDoc && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={activeDoc.title}
        >
          <div className="bg-[var(--panel)] border border-[var(--border)] rounded-[14px] w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--card)]">
              <div>
                <span className="text-[10px] font-mono uppercase text-[var(--accent)] tracking-wider block">
                  {activeDoc.category.replace(/_/g, ' ')}
                </span>
                <h2 className="text-lg font-bold text-[var(--text)] leading-tight">
                  {activeDoc.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveDoc(null)}
                aria-label="Close document"
                className="p-1.5 rounded-lg bg-[var(--panel)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto text-xs sm:text-sm text-[var(--text)] space-y-4 leading-relaxed whitespace-pre-line">
              {activeDoc.content}
            </div>

            <div className="p-4 border-t border-[var(--border)] bg-[var(--card)] flex items-center justify-between text-xs text-[var(--muted)]">
              <div className="flex items-center gap-1.5 font-medium" style={{ color: 'var(--sig)' }}>
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Scientific Resource</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveDoc(null)}
                className="px-4 py-1.5 rounded-[10px] bg-[var(--accent)] text-[var(--accent-fg)] font-semibold"
              >
                Close Reader
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
