import React, { useState, useEffect } from 'react';
import { StaffAccount, StaffRole, PermissionKey, AccessStatus } from '../../types';
import { PERMISSION_DEFINITIONS, ROLE_DEFAULT_PERMISSIONS } from '../../data/mockStaff';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (staff: StaffAccount) => void;
  staffToEdit?: StaffAccount | null;
  cityName?: string;
}

export const StaffModal: React.FC<StaffModalProps> = ({
  isOpen,
  onClose,
  onSave,
  staffToEdit,
  cityName = 'Brazzaville',
}) => {
  const isEditing = Boolean(staffToEdit);

  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [role, setRole] = useState<StaffRole>('enseignant_titulaire');
  const [roleTitle, setRoleTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [subject, setSubject] = useState('');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [accessStatus, setAccessStatus] = useState<AccessStatus>('Actif');
  const [permissions, setPermissions] = useState<PermissionKey[]>([]);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [sendSmsInvitation, setSendSmsInvitation] = useState(true);

  const TEACHER_PHOTO_PRESETS = [
    { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', label: 'Photo 1' },
    { url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80', label: 'Photo 2' },
    { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', label: 'Photo 3' },
    { url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', label: 'Photo 4' },
    { url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=400&q=80', label: 'Photo 5' },
    { url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80', label: 'Photo 6' },
  ];

  const AVAILABLE_CLASSES = [
    'Terminale D',
    'Terminale C',
    'Terminale A4',
    'Première D',
    'Première C',
    'Première A',
    '2nde C',
    '2nde A',
    '3ème A',
    '3ème B',
    '4ème A',
    '5ème',
    '6ème',
  ];

  const AVAILABLE_SUBJECTS = [
    'Mathématiques',
    'Français & Littérature',
    'Sciences Physiques & Chimie',
    'Sciences de la Vie et de la Terre (SVT)',
    'Histoire - Géographie & ECM',
    'Anglais',
    'Philosophie',
    'Éducation Physique et Sportive (EPS)',
    'Informatique & TIC',
    'Espagnol',
    'Économie & Droit',
  ];

  // Initialize or reset form when opened or when staffToEdit changes
  useEffect(() => {
    if (staffToEdit) {
      setFullName(staffToEdit.fullName);
      setGender(staffToEdit.gender);
      setRole(staffToEdit.role);
      setRoleTitle(staffToEdit.roleTitle);
      setDepartment(staffToEdit.department);
      setSubject(staffToEdit.subject || '');
      setSelectedClasses(staffToEdit.classes || []);
      setPhone(staffToEdit.phone);
      setEmail(staffToEdit.email);
      setPhotoUrl(staffToEdit.photoUrl || '');
      setAccessStatus(staffToEdit.accessStatus);
      setPermissions(staffToEdit.permissions);
      setGeneratedPassword('');
    } else {
      setFullName('');
      setGender('M');
      setRole('enseignant_titulaire');
      setRoleTitle('');
      setDepartment('');
      setSubject('');
      setSelectedClasses([]);
      setPhone('');
      setEmail('');
      setPhotoUrl('');
      setAccessStatus('Actif');
      setPermissions(ROLE_DEFAULT_PERMISSIONS.enseignant_titulaire.permissions);
      
      // Auto generate a secure initial temporary password
      const randomCode = Math.floor(100000 + Math.random() * 900000);
      setGeneratedPassword(`EduCongo#${randomCode}`);
    }
  }, [staffToEdit, isOpen]);

  // When role changes in create mode, auto-fill defaults
  const handleRoleChange = (newRole: StaffRole) => {
    setRole(newRole);
    const def = ROLE_DEFAULT_PERMISSIONS[newRole];
    if (def) {
      setRoleTitle(def.title);
      setDepartment(def.department);
      setPermissions(def.permissions);
    }
  };

  const toggleClass = (className: string) => {
    setSelectedClasses((prev) =>
      prev.includes(className)
        ? prev.filter((c) => c !== className)
        : [...prev, className]
    );
  };

  const togglePermission = (key: PermissionKey) => {
    setPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const matriculePrefix =
      role.startsWith('enseignant')
        ? 'ENS'
        : role === 'proviseur'
        ? 'DIR'
        : role === 'censeur'
        ? 'CEN'
        : role === 'surveillant_general'
        ? 'SUR'
        : role === 'comptable'
        ? 'CPT'
        : 'STF';

    const cleanMatricule =
      staffToEdit?.matricule ||
      `${matriculePrefix}-BZV-2024-${Math.floor(100 + Math.random() * 900)}`;

    const savedStaff: StaffAccount = {
      id: staffToEdit?.id || `STAFF-${Date.now().toString().slice(-4)}`,
      matricule: cleanMatricule,
      fullName: fullName.trim(),
      gender,
      role,
      roleTitle: roleTitle.trim() || ROLE_DEFAULT_PERMISSIONS[role].title,
      department: department.trim() || ROLE_DEFAULT_PERMISSIONS[role].department,
      subject: role.includes('enseignant') ? subject : undefined,
      classes: role.includes('enseignant') ? selectedClasses : undefined,
      phone: phone.trim(),
      email:
        email.trim() ||
        `${fullName.toLowerCase().replace(/\s+/g, '.')}@edu-congo.netlify.app`,
      photoUrl: photoUrl.trim() || TEACHER_PHOTO_PRESETS[0].url,
      accessStatus,
      lastLogin: staffToEdit?.lastLogin || 'Jamais connecté',
      permissions,
      temporaryPassword: generatedPassword || undefined,
      joinDate: staffToEdit?.joinDate || new Date().toLocaleDateString('fr-FR'),
    };

    onSave(savedStaff);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-950/95 backdrop-blur-2xl rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.85)] border border-white/15 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <span className="material-symbols-outlined text-[22px]">
                {isEditing ? 'manage_accounts' : 'person_add'}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg">
                {isEditing
                  ? `Modifier l'accès de ${staffToEdit?.fullName}`
                  : "Créer un compte Enseignant / Personnel"}
              </h3>
              <p className="text-xs text-slate-400">
                Gestion des autorisations et affectations dans l'établissement
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Section 1: Identité & Rôle */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <h4 className="text-[12px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">badge</span>
              1. Identité, Photo et Fonction
            </h4>

            {/* Photo Avatar Selector */}
            <div className="flex flex-col sm:flex-row items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="relative">
                <img
                  src={photoUrl || TEACHER_PHOTO_PRESETS[0].url}
                  alt="Aperçu Photo"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-400/60 shadow-[0_0_15px_rgba(16,185,129,0.3)] bg-slate-800"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = TEACHER_PHOTO_PRESETS[0].url;
                  }}
                />
                <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center text-[10px]">
                  <span className="material-symbols-outlined text-[12px]">photo_camera</span>
                </span>
              </div>

              <div className="flex-1 w-full space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-medium text-slate-300">
                    Photo de profil officielle de l'enseignant
                  </label>
                  <span className="text-[10px] text-emerald-400">Cartes d'accès & trombinoscope</span>
                </div>

                {/* Preset photos */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {TEACHER_PHOTO_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPhotoUrl(preset.url)}
                      className={`relative shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        photoUrl === preset.url
                          ? 'border-emerald-400 scale-105 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                          : 'border-white/10 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} className="w-9 h-9 object-cover" />
                    </button>
                  ))}
                </div>

                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="Ou collez une URL d'image personnalisée..."
                  className="w-full px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] text-white text-[11px] placeholder:text-slate-500 focus:border-emerald-400 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-medium text-slate-300 mb-1">
                  Nom et Prénom complets <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ex: Prof. Dieudonné Mikala"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-white/[0.05] text-white focus:border-emerald-400 outline-none backdrop-blur-md placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Genre</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'M' | 'F')}
                  className="w-full px-3 py-2.5 rounded-xl border border-white/15 bg-slate-900 text-slate-200 outline-none focus:border-emerald-400 cursor-pointer"
                >
                  <option value="M">Masculin (M.)</option>
                  <option value="F">Féminin (Mme/Mlle)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Rôle Système & Profil <span className="text-rose-400">*</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => handleRoleChange(e.target.value as StaffRole)}
                  className="w-full px-3 py-2.5 rounded-xl border border-white/15 bg-slate-900 text-slate-200 outline-none focus:border-emerald-400 cursor-pointer font-medium"
                >
                  <option value="enseignant_titulaire">Professeur Titulaire</option>
                  <option value="enseignant_vacataire">Professeur Vacataire</option>
                  <option value="censeur">Censeur des Études</option>
                  <option value="surveillant_general">Surveillant Général (Discipline)</option>
                  <option value="comptable">Agent Comptable & Écolage</option>
                  <option value="secretaire">Secrétaire de Direction</option>
                  <option value="conseiller_orientation">Conseiller d'Orientation</option>
                  <option value="proviseur">Proviseur / Chef d'Établissement</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Titre / Intitulé du poste
                </label>
                <input
                  type="text"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="Ex: Professeur Principal de Mathématiques"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-white/[0.05] text-white focus:border-emerald-400 outline-none backdrop-blur-md placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Département / Service
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Ex: Département des Sciences Exactes"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-white/[0.05] text-white focus:border-emerald-400 outline-none backdrop-blur-md placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Statut de l'Accès
                </label>
                <select
                  value={accessStatus}
                  onChange={(e) => setAccessStatus(e.target.value as AccessStatus)}
                  className="w-full px-3 py-2.5 rounded-xl border border-white/15 bg-slate-900 text-slate-200 outline-none focus:border-emerald-400 cursor-pointer font-semibold"
                >
                  <option value="Actif">🟢 Actif (Accès autorisé)</option>
                  <option value="Suspendu">🟡 Suspendu (Temporaire)</option>
                  <option value="Révoqué">🔴 Révoqué (Accès bloqué)</option>
                  <option value="En attente">⚪ En attente de validation</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Pédagogie (si Enseignant) */}
          {role.includes('enseignant') && (
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <h4 className="text-[12px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">school</span>
                2. Discipline enseignée & Affectation des classes
              </h4>

              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Matière Principale
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-white/15 bg-slate-900 text-slate-200 outline-none focus:border-emerald-400 cursor-pointer"
                >
                  <option value="" disabled className="text-slate-400">
                    Sélectionner la discipline enseignée
                  </option>
                  {AVAILABLE_SUBJECTS.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1.5">
                  Classes attribuées pour la saisie des notes et l'appel :
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_CLASSES.map((cls) => {
                    const isSelected = selectedClasses.includes(cls);
                    return (
                      <button
                        type="button"
                        key={cls}
                        onClick={() => toggleClass(cls)}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.25)]'
                            : 'bg-white/[0.04] border-white/10 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {isSelected && '✓ '}
                        {cls}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Contact & Identifiants */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <h4 className="text-[12px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">smartphone</span>
              3. Coordonnées & Connexion Congo (+242)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Téléphone Mobile (+242) MTN / Airtel <span className="text-rose-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+242 06 600 00 00"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-white/[0.05] text-white focus:border-emerald-400 outline-none font-mono backdrop-blur-md"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Adresse e-mail professionnelle
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@lycee-excellence.cg"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-white/[0.05] text-white focus:border-emerald-400 outline-none backdrop-blur-md"
                />
              </div>
            </div>

            {!isEditing && (
              <div className="p-3 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-semibold">
                    Mot de passe temporaire généré :
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-emerald-400 hover:underline text-[11px] font-semibold cursor-pointer"
                  >
                    {showPassword ? 'Masquer' : 'Afficher'}
                  </button>
                </div>
                <div className="font-mono text-sm bg-black/40 p-2 rounded-lg text-emerald-300 border border-white/10 flex items-center justify-between">
                  <span>{showPassword ? generatedPassword : '••••••••••••'}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newCode = Math.floor(100000 + Math.random() * 900000);
                      setGeneratedPassword(`EduCongo#${newCode}`);
                    }}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    title="Régénérer"
                  >
                    <span className="material-symbols-outlined text-[14px]">refresh</span>
                    Régénérer
                  </button>
                </div>
                <label className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={sendSmsInvitation}
                    onChange={(e) => setSendSmsInvitation(e.target.checked)}
                    className="rounded border-white/20 bg-white/10 text-emerald-500 accent-emerald-500"
                  />
                  <span>Envoyer automatiquement le mot de passe par SMS (+242)</span>
                </label>
              </div>
            )}
          </div>

          {/* Section 4: Droits d'accès granulaires */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <h4 className="text-[12px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">lock_open</span>
              4. Permissions et Droits d'Accès Système
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(Object.keys(PERMISSION_DEFINITIONS) as PermissionKey[]).map((pKey) => {
                const isGranted = permissions.includes(pKey);
                const info = PERMISSION_DEFINITIONS[pKey];
                return (
                  <div
                    key={pKey}
                    onClick={() => togglePermission(pKey)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 select-none ${
                      isGranted
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-slate-100'
                        : 'bg-white/[0.02] border-white/10 text-slate-400 hover:bg-white/[0.05]'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                        isGranted
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold'
                          : 'border-white/20 bg-white/5'
                      }`}
                    >
                      {isGranted && <span className="material-symbols-outlined text-[14px]">check</span>}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-xs text-white leading-tight">
                        {info.label}
                      </div>
                      <div className="text-[10.5px] text-slate-400 line-clamp-2 mt-0.5">
                        {info.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions Footer */}
          <div className="flex gap-2.5 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-white/15 rounded-xl font-medium text-slate-300 hover:bg-white/5 transition-colors cursor-pointer text-xs"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-semibold border border-emerald-400/30 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              {isEditing ? "Enregistrer les modifications" : "Créer le compte et activer l'accès"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
