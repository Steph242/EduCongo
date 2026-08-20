import React, { useState, useRef, useEffect } from 'react';
import { StaffRole } from '../../types';
import { STAFF_PROFILE_OPTIONS, StaffProfileOption, INITIAL_STAFF_ACCOUNTS } from '../../data/mockStaff';

interface StaffRoleDropdownProps {
  selectedRole: StaffRole;
  onSelectRole: (role: StaffRole, option: StaffProfileOption) => void;
  onSelectSampleStaff?: (staff: { phone: string; name: string; roleTitle: string }) => void;
  label?: string;
  className?: string;
}

export const StaffRoleDropdown: React.FC<StaffRoleDropdownProps> = ({
  selectedRole,
  onSelectRole,
  onSelectSampleStaff,
  label = 'Profil de connexion & Fonction',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'enseignant' | 'administratif'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentOption =
    STAFF_PROFILE_OPTIONS.find((opt) => opt.role === selectedRole) || STAFF_PROFILE_OPTIONS[0];

  const filteredOptions = STAFF_PROFILE_OPTIONS.filter((opt) => {
    if (categoryFilter === 'all') return true;
    return opt.category === categoryFilter;
  });

  const sampleStaffForCurrentRole = INITIAL_STAFF_ACCOUNTS.filter(
    (s) => s.role === selectedRole || (currentOption.category === 'enseignant' && s.role.startsWith('enseignant'))
  );

  return (
    <div className={`space-y-1.5 ${className}`} ref={dropdownRef}>
      {/* Label and category indicator */}
      <div className="flex items-center justify-between">
        <label className="text-[12px] font-semibold text-slate-300 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-teal-400">badge</span>
          <span>{label}</span>
          <span className="text-rose-400">*</span>
        </label>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            currentOption.category === 'enseignant'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
          }`}
        >
          {currentOption.category === 'enseignant' ? '🎓 Corps Enseignant' : '🏢 Administration & Encadrement'}
        </span>
      </div>

      {/* Main Trigger Button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-3.5 py-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer backdrop-blur-md ${
            isOpen
              ? 'border-teal-400 bg-white/[0.08] shadow-[0_0_15px_rgba(45,212,191,0.25)] ring-1 ring-teal-400/50'
              : 'border-white/15 bg-white/[0.05] hover:bg-white/[0.08] hover:border-white/25'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                currentOption.category === 'enseignant'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-purple-500/20 text-purple-400 border-purple-500/40'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{currentOption.icon}</span>
            </div>
            <div className="truncate">
              <div className="font-bold text-white text-xs sm:text-sm truncate">
                {currentOption.title}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {currentOption.permissionsPreview}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0 text-slate-400">
            <span className="material-symbols-outlined text-[20px] transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              expand_more
            </span>
          </div>
        </button>

        {/* Dropdown Menu Modal / Panel */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50 p-2.5 rounded-2xl bg-slate-950/95 border border-teal-500/30 backdrop-blur-2xl shadow-[0_15px_40px_rgba(0,0,0,0.85)] max-h-80 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-150">
            {/* Category Quick Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-white/[0.04] rounded-xl border border-white/10 mb-2.5 text-[11px]">
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                className={`flex-1 py-1 px-2 rounded-lg font-bold transition-all cursor-pointer text-center ${
                  categoryFilter === 'all'
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Tous ({STAFF_PROFILE_OPTIONS.length})
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('enseignant')}
                className={`flex-1 py-1 px-2 rounded-lg font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1 ${
                  categoryFilter === 'enseignant'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-emerald-400 hover:bg-emerald-500/10'
                }`}
              >
                <span>🎓 Enseignants</span>
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('administratif')}
                className={`flex-1 py-1 px-2 rounded-lg font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1 ${
                  categoryFilter === 'administratif'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-purple-400 hover:bg-purple-500/10'
                }`}
              >
                <span>🏢 Administratifs</span>
              </button>
            </div>

            {/* List of Options */}
            <div className="space-y-1">
              {/* Group 1: Enseignants */}
              {(categoryFilter === 'all' || categoryFilter === 'enseignant') && (
                <div>
                  {categoryFilter === 'all' && (
                    <div className="px-2 py-1 text-[10px] uppercase font-extrabold text-emerald-400 tracking-wider flex items-center gap-1.5 border-b border-white/5 mb-1">
                      <span className="material-symbols-outlined text-[14px]">school</span>
                      Corps Enseignant & Pédagogique
                    </div>
                  )}
                  {filteredOptions
                    .filter((opt) => opt.category === 'enseignant')
                    .map((opt) => {
                      const isSelected = opt.role === selectedRole;
                      return (
                        <button
                          key={opt.role}
                          type="button"
                          onClick={() => {
                            onSelectRole(opt.role, opt);
                            setIsOpen(false);
                          }}
                          className={`w-full p-2.5 rounded-xl text-left transition-all flex items-start gap-2.5 cursor-pointer group ${
                            isSelected
                              ? 'bg-emerald-600/20 border border-emerald-400/50 text-white shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                              : 'hover:bg-white/[0.06] border border-transparent text-slate-200'
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 ${
                              isSelected
                                ? 'bg-emerald-500 text-slate-950 border-emerald-300 font-bold'
                                : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 group-hover:bg-emerald-500/25'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[18px]">{opt.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs group-hover:text-emerald-300 transition-colors">
                                {opt.title}
                              </span>
                              {isSelected && (
                                <span className="material-symbols-outlined text-emerald-400 text-[16px]">
                                  check_circle
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                              {opt.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                </div>
              )}

              {/* Group 2: Personnel Administratif */}
              {(categoryFilter === 'all' || categoryFilter === 'administratif') && (
                <div className={categoryFilter === 'all' ? 'mt-2.5' : ''}>
                  {categoryFilter === 'all' && (
                    <div className="px-2 py-1 text-[10px] uppercase font-extrabold text-purple-400 tracking-wider flex items-center gap-1.5 border-b border-white/5 mb-1">
                      <span className="material-symbols-outlined text-[14px]">corporate_fare</span>
                      Personnel Administratif & Encadrement
                    </div>
                  )}
                  {filteredOptions
                    .filter((opt) => opt.category === 'administratif')
                    .map((opt) => {
                      const isSelected = opt.role === selectedRole;
                      return (
                        <button
                          key={opt.role}
                          type="button"
                          onClick={() => {
                            onSelectRole(opt.role, opt);
                            setIsOpen(false);
                          }}
                          className={`w-full p-2.5 rounded-xl text-left transition-all flex items-start gap-2.5 cursor-pointer group ${
                            isSelected
                              ? 'bg-purple-600/20 border border-purple-400/50 text-white shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                              : 'hover:bg-white/[0.06] border border-transparent text-slate-200'
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 ${
                              isSelected
                                ? 'bg-purple-500 text-white border-purple-300 font-bold'
                                : 'bg-purple-500/15 text-purple-300 border-purple-500/30 group-hover:bg-purple-500/25'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[18px]">{opt.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs group-hover:text-purple-300 transition-colors">
                                {opt.title}
                              </span>
                              {isSelected && (
                                <span className="material-symbols-outlined text-purple-400 text-[16px]">
                                  check_circle
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                              {opt.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Helper Box: Permissions Summary & Quick Autofill for Demo */}
      <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Attributions & Droits :</span>
          <span className="text-teal-300 font-medium">{currentOption.permissionsPreview}</span>
        </div>

        {onSelectSampleStaff && sampleStaffForCurrentRole.length > 0 && (
          <div className="pt-1.5 border-t border-white/5 flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-slate-400">Comptes de test :</span>
            {sampleStaffForCurrentRole.slice(0, 2).map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() =>
                  onSelectSampleStaff({
                    phone: st.phone.replace('+242 ', ''),
                    name: st.fullName,
                    roleTitle: st.roleTitle,
                  })
                }
                className="text-[10px] font-mono bg-teal-500/10 hover:bg-teal-500/25 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                title={`Cliquer pour remplir ${st.fullName} (${st.phone})`}
              >
                <span>{st.fullName}</span>
                <span className="material-symbols-outlined text-[11px]">arrow_forward</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
