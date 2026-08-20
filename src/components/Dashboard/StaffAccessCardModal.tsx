import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { StaffAccount } from '../../types';
import { PERMISSION_DEFINITIONS } from '../../data/mockStaff';
import { LiveCameraCaptureModal } from '../Common/LiveCameraCaptureModal';

interface StaffAccessCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffAccount | null;
  schoolName: string;
  schoolCode: string;
  slogan?: string;
  logoUrl?: string;
  city: string;
  onUpdateStaffPhoto?: (staffId: string, newPhotoUrl: string) => void;
}

export const StaffAccessCardModal: React.FC<StaffAccessCardModalProps> = ({
  isOpen,
  onClose,
  staff,
  schoolName,
  schoolCode,
  slogan = 'Discipline - Travail - Succès',
  logoUrl = 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=300&q=80',
  city,
  onUpdateStaffPhoto,
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState<string>('');

  useEffect(() => {
    if (staff) {
      setCurrentPhoto(staff.photoUrl || '');
      const payload = JSON.stringify({
        system: 'EduCongo MEPPSA',
        type: 'CARTE_PROFESSIONNELLE_PERSONNEL',
        id: staff.id,
        matricule: staff.matricule,
        nom: staff.fullName,
        role: staff.roleTitle,
        matiere: staff.subject || 'N/A',
        telephone: staff.phone,
        statut: staff.accessStatus,
        etablissement: schoolName || "Lycée d'Excellence",
        slogan: slogan,
        ville: city || 'Brazzaville',
        annee: '2024-2025',
        validationUrl: `https://educongo.cg/verify/staff/${staff.matricule}`,
      });

      QRCode.toDataURL(payload, {
        width: 256,
        margin: 1,
        color: {
          dark: '#022c22',
          light: '#ffffff',
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error('Erreur génération QR Code personnel:', err));
    }
  }, [staff, schoolName, slogan, city]);

  if (!isOpen || !staff) return null;

  const handlePhotoCaptured = (dataUrl: string) => {
    setCurrentPhoto(dataUrl);
    if (onUpdateStaffPhoto && staff) {
      onUpdateStaffPhoto(staff.id, dataUrl);
    }
    setIsCameraOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-950/95 backdrop-blur-2xl rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.85)] border border-white/15 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-6">
          <div>
            <h3 className="font-bold text-white text-base sm:text-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400">badge</span>
              Fiche d'Accès & Carte Professionnelle du Personnel
            </h3>
            <p className="text-xs text-slate-400">
              Badge Officiel MEPPSA avec Code QR et Photo en direct • {staff.matricule}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCameraOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-emerald-300 text-xs font-semibold flex items-center gap-1 border border-emerald-500/30 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">photo_camera</span>
              <span className="hidden sm:inline">Photo Direct</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* Printable Badge / Card */}
        <div id="teacher-access-card" className="bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/50 p-6 sm:p-8 rounded-3xl border border-emerald-500/30 text-slate-100 shadow-[0_8px_32px_rgba(0,0,0,0.6)] relative overflow-hidden">
          {/* Congolese Flag ribbon (Exigence 6) */}
          <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-emerald-500 via-yellow-400 to-red-500"></div>

          {/* Top header of badge with Logo, Flag, Slogan */}
          <div className="flex justify-between items-start mb-5 gap-3">
            <div className="flex items-center gap-3">
              {/* Logo (Exigence 6) */}
              <div className="relative shrink-0">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="w-11 h-11 rounded-xl object-cover border border-emerald-400/60 bg-slate-800 shadow"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-emerald-600/30 border border-emerald-400 flex items-center justify-center font-bold text-white">
                    {schoolName.charAt(0)}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 text-[10px] bg-slate-900 px-1 rounded border border-white/20 shadow">
                  🇨🇬
                </div>
              </div>

              <div>
                <div className="text-[9.5px] font-bold uppercase tracking-widest text-emerald-400">
                  RÉPUBLIQUE DU CONGO • MEPPSA
                </div>
                <div className="text-sm font-extrabold text-white">
                  {schoolName || "Lycée d'Excellence"}
                </div>
                {/* Slogan (Exigence 6) */}
                <div className="text-[10px] italic font-semibold text-yellow-300">
                  « {slogan} »
                </div>
                <div className="text-[9.5px] text-slate-400 font-mono">
                  Code : {schoolCode || 'BZV-24-X8B'} • {city || 'Brazzaville'}
                </div>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-xl text-[9px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
              CARTE PROFESSIONNELLE
            </span>
          </div>

          {/* Identity Body with Real Photo / Webcam Capture */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-5">
            <div className="relative group shrink-0">
              {currentPhoto ? (
                <img
                  src={currentPhoto}
                  alt={staff.fullName}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-400/60 shadow-[0_0_20px_rgba(16,185,129,0.4)] bg-slate-800"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 border-2 border-emerald-400/50 flex items-center justify-center text-2xl font-bold text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                  {staff.fullName.charAt(0)}
                </div>
              )}
              <button
                type="button"
                onClick={() => setIsCameraOpen(true)}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 rounded-2xl flex flex-col items-center justify-center text-white text-[10px] font-semibold transition-opacity cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px] mb-0.5">photo_camera</span>
                Modifier
              </button>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="text-lg font-bold text-white">{staff.fullName}</div>
              <div className="text-xs font-semibold text-emerald-400">{staff.roleTitle}</div>
              <div className="text-[11px] text-slate-400">{staff.department}</div>

              <div className="pt-1.5 flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  {staff.matricule}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    staff.accessStatus === 'Actif'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}
                >
                  Statut : {staff.accessStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Teacher classes & contact info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-black/40 rounded-2xl border border-white/10 text-xs mb-5">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                Téléphone Authentifié (+242)
              </span>
              <strong className="text-white font-mono">{staff.phone}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                Classes / Matière
              </span>
              <span className="text-emerald-300 font-medium">
                {staff.assignedClasses ? staff.assignedClasses.join(', ') : 'Administration'}
              </span>
            </div>
          </div>

          {/* QR Code and digital seal footer */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-white p-1 rounded-xl shadow-md flex items-center justify-center">
                {qrCodeDataUrl ? (
                  <img src={qrCodeDataUrl} alt="QR Code Enseignant" className="w-full h-full object-contain" />
                ) : (
                  <span className="material-symbols-outlined text-slate-950 text-[24px]">qr_code_2</span>
                )}
              </div>
              <div className="text-[10px] text-slate-400 space-y-0.5">
                <div className="text-slate-200 font-bold">Badge Numérique Certifié</div>
                <div>Contrôle de présence & accès EduCongo</div>
                <div className="text-emerald-400 font-mono text-[9px]">Validation MEPPSA 🇨🇬</div>
              </div>
            </div>

            <div className="text-right text-[10px] text-slate-400">
              <div className="text-xs font-bold text-white">Le Proviseur</div>
              <div className="italic text-[9.5px]">Cachet Électronique</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-white/15 rounded-xl font-medium text-slate-300 hover:bg-white/5 transition-colors cursor-pointer text-xs"
          >
            Fermer
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-semibold border border-emerald-400/30 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            Imprimer la Carte Badge
          </button>
        </div>
      </div>

      {/* Live Camera Modal for Staff Photo */}
      <LiveCameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handlePhotoCaptured}
        title={`Photo professionnelle : ${staff.fullName}`}
        subtitle="Prenez une photo de face pour la carte professionnelle"
      />
    </div>
  );
};
