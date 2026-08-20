import React, { useState, useEffect, useRef } from 'react';
import { Student, StaffAccount, AdminDocument, GlobalSearchFilter } from '../../types';
import { INITIAL_STUDENTS } from '../../data/mockData';
import { INITIAL_STAFF_ACCOUNTS } from '../../data/mockStaff';
import { ADMIN_DOCUMENTS } from '../../data/mockDocuments';

interface GlobalSearchBarProps {
  onSelectStudent: (student: Student) => void;
  onSelectStaff: (staff: StaffAccount) => void;
  onSelectDocument: (doc: AdminDocument) => void;
}

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({
  onSelectStudent,
  onSelectStaff,
  onSelectDocument,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<GlobalSearchFilter>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Global Keyboard Shortcut: Cmd+K / Ctrl+K / '/'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setIsOpen(true);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Clean and prepare query terms
  const cleanQuery = query.trim().toLowerCase();

  // Filter students
  const filteredStudents = INITIAL_STUDENTS.filter((st) => {
    if (!cleanQuery) return true;
    return (
      st.firstName.toLowerCase().includes(cleanQuery) ||
      st.lastName.toLowerCase().includes(cleanQuery) ||
      st.matricule.toLowerCase().includes(cleanQuery) ||
      st.classroom.toLowerCase().includes(cleanQuery) ||
      st.parentName.toLowerCase().includes(cleanQuery) ||
      st.parentPhone.includes(cleanQuery) ||
      st.birthPlace.toLowerCase().includes(cleanQuery)
    );
  });

  // Filter staff/teachers
  const filteredStaff = INITIAL_STAFF_ACCOUNTS.filter((st) => {
    if (!cleanQuery) return true;
    return (
      st.fullName.toLowerCase().includes(cleanQuery) ||
      st.matricule.toLowerCase().includes(cleanQuery) ||
      st.roleTitle.toLowerCase().includes(cleanQuery) ||
      st.department.toLowerCase().includes(cleanQuery) ||
      (st.subject && st.subject.toLowerCase().includes(cleanQuery)) ||
      st.phone.includes(cleanQuery) ||
      st.email.toLowerCase().includes(cleanQuery) ||
      (st.classes && st.classes.some((c) => c.toLowerCase().includes(cleanQuery)))
    );
  });

  // Filter documents
  const filteredDocuments = ADMIN_DOCUMENTS.filter((doc) => {
    if (!cleanQuery) return true;
    return (
      doc.title.toLowerCase().includes(cleanQuery) ||
      doc.reference.toLowerCase().includes(cleanQuery) ||
      doc.categoryLabel.toLowerCase().includes(cleanQuery) ||
      doc.signatory.toLowerCase().includes(cleanQuery) ||
      doc.summary.toLowerCase().includes(cleanQuery) ||
      doc.tags.some((t) => t.toLowerCase().includes(cleanQuery)) ||
      (doc.relatedStudentName && doc.relatedStudentName.toLowerCase().includes(cleanQuery))
    );
  });

  // Combined result items based on activeFilter
  interface UnifiedSearchResultItem {
    id: string;
    type: 'student' | 'staff' | 'document';
    title: string;
    subtitle: string;
    badge: string;
    badgeColor: string;
    icon: string;
    extraInfo?: string;
    raw: Student | StaffAccount | AdminDocument;
  }

  const studentItems: UnifiedSearchResultItem[] = filteredStudents.map((s) => ({
    id: `student-${s.id}`,
    type: 'student',
    title: `${s.firstName} ${s.lastName}`,
    subtitle: `Classe : ${s.classroom} • Moyenne : ${s.averageGrade.toFixed(1)}/20 • Parent : ${s.parentName}`,
    badge: s.matricule,
    badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    icon: 'school',
    extraInfo: `${s.status} • Écolage: ${Math.round((s.tuitionPaid / s.tuitionTotal) * 100)}%`,
    raw: s,
  }));

  const staffItems: UnifiedSearchResultItem[] = filteredStaff.map((s) => ({
    id: `staff-${s.id}`,
    type: 'staff',
    title: s.fullName,
    subtitle: `${s.roleTitle} ${s.subject ? `(${s.subject})` : ''} • Tél : ${s.phone}`,
    badge: s.matricule,
    badgeColor: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    icon: 'badge',
    extraInfo: s.department,
    raw: s,
  }));

  const documentItems: UnifiedSearchResultItem[] = filteredDocuments.map((d) => ({
    id: `doc-${d.id}`,
    type: 'document',
    title: d.title,
    subtitle: `${d.categoryLabel} • Émis le ${d.issueDate} par ${d.signatory}`,
    badge: d.reference,
    badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    icon: d.category === 'circulaire' ? 'campaign' : d.category === 'arrete' ? 'gavel' : 'description',
    extraInfo: d.status,
    raw: d,
  }));

  let displayItems: UnifiedSearchResultItem[] = [];
  if (activeFilter === 'students') {
    displayItems = studentItems;
  } else if (activeFilter === 'staff') {
    displayItems = staffItems;
  } else if (activeFilter === 'documents') {
    displayItems = documentItems;
  } else {
    displayItems = [...studentItems, ...staffItems, ...documentItems];
  }

  const handleSelectItem = (item: UnifiedSearchResultItem) => {
    setIsOpen(false);
    if (item.type === 'student') {
      onSelectStudent(item.raw as Student);
    } else if (item.type === 'staff') {
      onSelectStaff(item.raw as StaffAccount);
    } else if (item.type === 'document') {
      onSelectDocument(item.raw as AdminDocument);
    }
  };

  // Keyboard navigation inside results list
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < displayItems.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (displayItems[selectedIndex]) {
        handleSelectItem(displayItems[selectedIndex]);
      }
    }
  };

  const SUGGESTED_QUERIES = [
    { label: 'Terminale D', filter: 'students' },
    { label: 'Circulaire BAC 2025', filter: 'documents' },
    { label: 'Prof. Mikala', filter: 'staff' },
    { label: 'Certificat de scolarité', filter: 'documents' },
    { label: 'Grace Ngouabi', filter: 'students' },
    { label: 'Arrêté agrément', filter: 'documents' },
  ];

  return (
    <>
      {/* Search Bar Trigger Button in the Header */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/15 text-slate-300 hover:text-white transition-all shadow-inner backdrop-blur-md cursor-pointer group max-w-[180px] sm:max-w-[260px] md:max-w-[320px] w-full"
        title="Recherche globale (Élèves, Enseignants, Documents) - Raccourci ⌘K"
      >
        <span className="material-symbols-outlined text-[18px] text-emerald-400 group-hover:scale-110 transition-transform">
          search
        </span>
        <span className="text-xs text-slate-400 group-hover:text-slate-200 truncate flex-1 text-left hidden sm:inline">
          Rechercher élève, prof, doc...
        </span>
        <span className="text-xs text-slate-400 group-hover:text-slate-200 truncate flex-1 text-left sm:hidden">
          Rechercher...
        </span>
        <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-white/10 rounded-md border border-white/15">
          ⌘K
        </kbd>
      </button>

      {/* Global Spotlight / Command Palette Overlay Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-3 sm:px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div
            className="bg-slate-950/95 backdrop-blur-2xl rounded-3xl max-w-2xl w-full p-4 sm:p-5 shadow-[0_25px_70px_rgba(0,0,0,0.95)] border border-white/20 animate-in zoom-in-95 duration-150 max-h-[82vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Box */}
            <div className="relative flex items-center border-b border-white/10 pb-3">
              <span className="material-symbols-outlined absolute left-3 text-emerald-400 text-[22px]">
                search
              </span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleInputKeyDown}
                placeholder="Rechercher un élève, enseignant, matricule, classe, arrêté, circulaire..."
                className="w-full pl-11 pr-10 py-2.5 rounded-2xl bg-white/[0.04] text-sm text-white placeholder:text-slate-500 outline-none border border-white/10 focus:border-emerald-400/80 transition-all"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    inputRef.current?.focus();
                  }}
                  className="absolute right-3 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">cancel</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="absolute right-3 text-slate-500 hover:text-slate-300 p-1 text-[11px] font-mono cursor-pointer uppercase"
                >
                  ESC
                </button>
              )}
            </div>

            {/* Filter Category Pills */}
            <div className="flex items-center gap-1.5 py-3 overflow-x-auto custom-scrollbar shrink-0 border-b border-white/5">
              <button
                type="button"
                onClick={() => {
                  setActiveFilter('all');
                  setSelectedIndex(0);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeFilter === 'all'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                    : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 border border-white/5'
                }`}
              >
                <span>Tous</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/10">
                  {studentItems.length + staffItems.length + documentItems.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveFilter('students');
                  setSelectedIndex(0);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeFilter === 'students'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                    : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 border border-white/5'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">school</span>
                <span>Élèves</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/10">
                  {studentItems.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveFilter('staff');
                  setSelectedIndex(0);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeFilter === 'staff'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                    : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 border border-white/5'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">badge</span>
                <span>Enseignants & Personnel</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/10">
                  {staffItems.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveFilter('documents');
                  setSelectedIndex(0);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeFilter === 'documents'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                    : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 border border-white/5'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">description</span>
                <span>Documents Administratifs</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/10">
                  {documentItems.length}
                </span>
              </button>
            </div>

            {/* Results List */}
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto py-2 space-y-1.5 custom-scrollbar max-h-[50vh]"
            >
              {displayItems.length > 0 ? (
                displayItems.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectItem(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`p-3 rounded-2xl transition-all cursor-pointer flex items-start gap-3 select-none ${
                        isSelected
                          ? 'bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-transparent border border-emerald-500/40 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                          : 'bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 text-slate-300'
                      }`}
                    >
                      {/* Icon */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 ${
                          item.type === 'student'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : item.type === 'staff'
                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {item.icon}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs sm:text-sm text-white truncate">
                            {item.title}
                          </span>
                          <span
                            className={`px-2 py-0.2 rounded-md font-mono text-[10px] font-bold border ${item.badgeColor}`}
                          >
                            {item.badge}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {item.subtitle}
                        </div>

                        {item.extraInfo && (
                          <div className="text-[10px] text-emerald-400/90 font-medium mt-1">
                            {item.extraInfo}
                          </div>
                        )}
                      </div>

                      {/* Action Arrow */}
                      <div className="self-center pl-1">
                        <span
                          className={`material-symbols-outlined text-[18px] transition-transform ${
                            isSelected
                              ? 'text-emerald-400 translate-x-0.5'
                              : 'text-slate-600'
                          }`}
                        >
                          arrow_forward
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 text-slate-500 flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-[24px]">search_off</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-300">
                      Aucun résultat trouvé pour "{query}"
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Essayez un nom d'élève, matricule MEPPSA, rôle enseignant ou numéro d'arrêté.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Suggested quick searches */}
            {!query && (
              <div className="pt-3 border-t border-white/10 shrink-0">
                <span className="text-[10.5px] uppercase font-bold text-slate-400 block mb-2">
                  Recherches fréquentes & Suggestions :
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_QUERIES.map((sq, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setQuery(sq.label);
                        setActiveFilter(sq.filter as GlobalSearchFilter);
                        inputRef.current?.focus();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/30 text-slate-300 border border-white/10 text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[13px] text-slate-400">
                        history
                      </span>
                      {sq.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Keyboard Helper Footer */}
            <div className="pt-3 mt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-[9px] font-mono">
                    ↑
                  </kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-[9px] font-mono">
                    ↓
                  </kbd>{' '}
                  Naviguer
                </span>
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-[9px] font-mono">
                    ↵
                  </kbd>{' '}
                  Sélectionner
                </span>
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-[9px] font-mono">
                    ESC
                  </kbd>{' '}
                  Fermer
                </span>
              </div>

              <div className="text-[10px] text-emerald-400 font-medium">
                EduCongo MEPPSA Search
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
