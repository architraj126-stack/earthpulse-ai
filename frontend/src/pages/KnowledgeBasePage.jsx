import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  FileText,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Bookmark,
  X
} from 'lucide-react';
import { getKnowledgeList, getKnowledgeDoc } from '../services/api';

export default function KnowledgeBasePage() {
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeDoc, setActiveDoc] = useState(null);
  const [loadingDoc, setLoadingDoc] = useState(false);

  useEffect(() => {
    getKnowledgeList()
      .then(res => setDocuments(res || []))
      .catch(() => {});
  }, []);

  const categories = ['ALL', ...new Set(documents.map(d => d.category))];

  const filteredDocs = documents.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(search.toLowerCase()) ||
                          d.file_name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || d.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleOpenDoc = async (category, fileName) => {
    setLoadingDoc(true);
    try {
      const doc = await getKnowledgeDoc(category, fileName);
      setActiveDoc(doc);
    } catch (err) {
      alert('Failed to load document content.');
    } finally {
      setLoadingDoc(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#071426] text-white p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="space-y-1 border-b border-[#1E3A56] pb-4">
        <div className="flex items-center gap-2 text-xs text-[#00D4FF] font-semibold uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>Scientific Knowledge Base</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Verified Earth Science & Statistical Library
        </h1>
        <p className="text-xs sm:text-sm text-[#9BAEC2] max-w-2xl">
          Curated collection of peer-reviewed methodologies, NASA observation guides, WMO standards, and IPCC AR6 physics foundations.
        </p>
      </div>

      {/* Search and Category Filter Toolbar */}
      <div className="bg-[#13263A] rounded-2xl border border-[#1E3A56] p-4 shadow-lg space-y-3">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search scientific articles, variables, formulas, or datasets..."
            className="w-full bg-[#0D1B2A] border border-[#1E3A56] rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder-[#9BAEC2] focus:outline-none focus:border-[#00D4FF]"
          />
          <Search className="w-4 h-4 text-[#9BAEC2] absolute left-3.5 top-3" />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs text-[#9BAEC2] mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[#00D4FF]" />
            <span>Category:</span>
          </span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                selectedCategory === cat
                  ? 'bg-[#00D4FF] text-[#071426] font-semibold'
                  : 'bg-[#0D1B2A] text-[#9BAEC2] hover:text-white border border-[#1E3A56]'
              }`}
            >
              {cat.replace(/_/g, ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc, idx) => (
          <div
            key={idx}
            onClick={() => handleOpenDoc(doc.category, doc.file_name)}
            className="cursor-pointer bg-[#13263A] border border-[#1E3A56] hover:border-[#00D4FF] p-5 rounded-2xl transition hover:bg-[#13263A]/80 shadow-md flex flex-col justify-between group space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0D1B2A] text-[#00D4FF] border border-[#1E3A56] uppercase tracking-wider">
                  {doc.category.replace(/_/g, ' ')}
                </span>
                <ChevronRight className="w-4 h-4 text-[#9BAEC2] group-hover:text-[#00D4FF] group-hover:translate-x-1 transition" />
              </div>
              <h3 className="font-bold text-white text-base leading-snug group-hover:text-[#00D4FF] transition">
                {doc.title}
              </h3>
            </div>

            <div className="text-[11px] text-[#9BAEC2] flex items-center justify-between pt-3 border-t border-[#1E3A56]">
              <span className="font-mono text-[10px] truncate max-w-[180px]">{doc.file_name}</span>
              <span className="text-[#35D07F] font-semibold flex items-center gap-1">
                <span>Read Article</span>
                <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Document Reader Modal */}
      {activeDoc && (
        <div className="fixed inset-0 z-50 bg-[#071426]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0D1B2A] border border-[#1E3A56] rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#1E3A56] flex items-center justify-between bg-[#13263A]">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#00D4FF] tracking-wider block">
                  {activeDoc.category.replace(/_/g, ' ')}
                </span>
                <h2 className="text-lg font-bold text-white leading-tight">
                  {activeDoc.title}
                </h2>
              </div>
              <button
                onClick={() => setActiveDoc(null)}
                className="p-1.5 rounded-lg bg-[#0D1B2A] text-[#9BAEC2] hover:text-white border border-[#1E3A56] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 overflow-y-auto text-xs sm:text-sm text-[#9BAEC2] space-y-4 leading-relaxed font-sans whitespace-pre-line">
              {activeDoc.content}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#1E3A56] bg-[#13263A] flex items-center justify-between text-xs text-[#9BAEC2]">
              <div className="flex items-center gap-1 text-[#35D07F]">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Scientific Resource</span>
              </div>
              <button
                onClick={() => setActiveDoc(null)}
                className="px-4 py-1.5 rounded-lg bg-[#00D4FF] text-[#071426] font-semibold transition hover:brightness-110"
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
