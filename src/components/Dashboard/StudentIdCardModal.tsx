import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Student } from '../../types';
import { LiveCameraCaptureModal } from '../Common/LiveCameraCaptureModal';

interface StudentIdCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  schoolName?: string;
  schoolCode?: string;
  slogan?: string;
  logoUrl?: string;
  city?: string;
  onUpdateStudentPhoto?: (studentId: string, newPhotoUrl: string) => void;
}

export const StudentIdCardModal: React.FC<StudentIdCardModalProps> = ({
  isOpen,
  onClose,
  student,
  schoolName = "Lycée d'Excellence de Brazzaville",
  schoolCode = 'BZV-2024-X8B',
  slogan = 'Discipline - Travail - Succès',
  logoUrl = 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=300&q=80',
  city = 'Brazzaville',
  onUpdateStudentPhoto,
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [cardSide, setCardSide] = useState<'recto' | 'verso'>('recto');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState<string>('');

  const isHigherEd =
    student?.studentType === 'etudiant' ||
    student?.classroom.toLowerCase().includes('licence') ||
    student?.classroom.toLowerCase().includes('master') ||
    student?.classroom.toLowerCase().includes('bts');

  useEffect(() => {
    if (student) {
      setCurrentPhoto(student.photoUrl || '');
      const verificationPayload = JSON.stringify({
        system: 'EduCongo MEPPSA/MESRS',
        type: isHigherEd ? 'CARTE_ETUDIANT_OFFICIELLE' : 'CARTE_SCOLAIRE_ELEVE',
        matricule: student.matricule,
        nom: `${student.lastName.toUpperCase()} ${student.firstName}`,
        classe: student.classroom,
        etablissement: schoolName,
        slogan: slogan,
        ville: city,
        anneeScolaire: '2024-2025',
        dateNaissance: student.birthDate,
        statutEcolage: student.tuitionPaid >= student.tuitionTotal ? 'Solvable' : 'En cours',
        contactUrgence: student.parentPhone,
        validationUrl: `https://${student.matricule.toLowerCase()}.edu-congo.netlify.app/verify`,
      });

      QRCode.toDataURL(verificationPayload, {
        width: 320,
        margin: 1,
        color: {
          dark: isHigherEd ? '#1e1b4b' : '#022c22',
          light: '#ffffff',
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error('Erreur génération QR Code carte scolaire:', err));
    }
  }, [student, schoolName, slogan, city, isHigherEd]);

  if (!isOpen || !student) return null;

  const handleCopyLink = () => {
    const link = `https://${student.matricule.toLowerCase()}.edu-congo.netlify.app/verify`;
    navigator.clipboard?.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handlePhotoCaptured = (dataUrl: string) => {
    setCurrentPhoto(dataUrl);
    if (onUpdateStudentPhoto && student) {
      onUpdateStudentPhoto(student.id, dataUrl);
    }
    setIsCameraOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-950/95 backdrop-blur-2xl rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.85)] border border-white/15 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-lg ${
                isHigherEd
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-indigo-500/20'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/20'
              }`}
            >
              <span className="material-symbols-outlined text-[24px]">
                {isHigherEd ? 'school' : 'badge'}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg">
                {isHigherEd ? "Carte d'Étudiant Officielle" : "Carte d'Identité Scolaire (MEPPSA)"}
              </h3>
              <p className="text-xs text-slate-400">
                Format Officiel • Slogan & Blason inclus • {student.matricule}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Camera Button */}
            <button
              type="button"
              onClick={() => setIsCameraOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-emerald-300 text-xs font-semibold flex items-center gap-1 border border-emerald-500/30 cursor-pointer transition-colors"
              title="Prendre une photo en direct avec la webcam"
            >
              <span className="material-symbols-outlined text-[16px]">photo_camera</span>
              <span className="hidden sm:inline">Photo Direct</span>
            </button>

            {/* Recto / Verso Selector */}
            <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setCardSide('recto')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  cardSide === 'recto' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Recto
              </button>
              <button
                type="button"
                onClick={() => setCardSide('verso')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  cardSide === 'verso' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Verso
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Printable Card Area */}
        <div className="relative my-2">
          {cardSide === 'recto' ? (
            /* RECTO CARD DESIGN */
            <div
              id="student-school-card-recto"
              className={`rounded-3xl border text-slate-100 shadow-[0_12px_40px_rgba(0,0,0,0.7)] relative overflow-hidden transition-all p-6 sm:p-7 ${
                isHigherEd
                  ? 'bg-gradient-to-br from-indigo-950 via-slate-950 to-slate-900 border-indigo-500/40'
                  : 'bg-gradient-to-br from-emerald-950/90 via-slate-950 to-slate-900 border-emerald-500/40'
              }`}
            >
              {/* Congolese Flag banner on top (Exigence 6: drapeau du pays) */}
              <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-emerald-500 via-yellow-400 to-red-500"></div>

              {/* Watermark seal */}
              <div className="absolute -right-8 -bottom-8 opacity-5 pointer-events-none">
                <span className="material-symbols-outlined text-[220px]">account_balance</span>
              </div>

              {/* Top official header with School Logo, Flag and Slogan */}
              <div className="flex justify-between items-start border-b border-white/10 pb-3 mb-4 gap-3">
                <div className="flex items-center gap-3">
                  {/* School Logo (Exigence 6: logo de l'établissement) */}
                  <div className="relative shrink-0">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt="Logo"
                        className="w-12 h-12 rounded-xl object-cover border border-emerald-400/60 bg-slate-800 shadow"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-emerald-600/30 border border-emerald-400 flex items-center justify-center font-bold text-white text-lg">
                        {schoolName.charAt(0)}
                      </div>
                    )}
                    {/* Country Flag Badge (Exigence 6) */}
                    <div className="absolute -bottom-1 -right-1 text-[11px] bg-slate-900 px-1 rounded border border-white/20 shadow">
                      🇨🇬
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <div className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                      <span>RÉPUBLIQUE DU CONGO</span>
                      <span>•</span>
                      <span>{isHigherEd ? 'MESRS' : 'MEPPSA'}</span>
                    </div>
                    <div className="text-sm sm:text-base font-extrabold text-white tracking-wide">
                      {schoolName}
                    </div>
                    {/* Slogan of the School (Exigence 6) */}
                    <div className="text-[10px] italic font-semibold text-yellow-300 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px] text-yellow-400">format_quote</span>
                      <span>« {slogan} »</span>
                    </div>
                    <div className="text-[9.5px] text-slate-400 font-mono">
                      Code : {schoolCode} • {city}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-xl text-[9.5px] font-extrabold uppercase tracking-wider border shadow-sm ${
                      isHigherEd
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    {isHigherEd ? "CARTE D'ÉTUDIANT" : "CARTE SCOLAIRE"}
                  </span>
                  <div className="text-[9.5px] text-slate-400 mt-1 font-semibold">
                    Année 2024 - 2025
                  </div>
                </div>
              </div>

              {/* Card Body with Photo, Info and QR Code (Blood Group REMOVED as requested) */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                {/* Photo column */}
                <div className="sm:col-span-4 flex flex-col items-center">
                  <div className="relative group">
                    <img
                      src={
                        currentPhoto ||
                        student.photoUrl ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                      }
                      alt={`${student.firstName} ${student.lastName}`}
                      className="w-28 h-36 rounded-2xl object-cover border-2 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] bg-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setIsCameraOpen(true)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 rounded-2xl flex flex-col items-center justify-center text-white text-[11px] font-semibold transition-opacity cursor-pointer backdrop-blur-xs"
                    >
                      <span className="material-symbols-outlined text-[24px] mb-1">photo_camera</span>
                      Changer la photo
                    </button>
                    <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 font-mono font-bold text-[9px] shadow">
                      {student.gender === 'M' ? 'M' : 'F'}
                    </div>
                  </div>

                  <div className="mt-2 text-center">
                    <span className="font-mono text-[11px] font-bold text-indigo-300 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                      {student.matricule}
                    </span>
                  </div>
                </div>

                {/* Info column */}
                <div className="sm:col-span-5 space-y-2.5 text-xs">
                  <div>
                    <span className="text-[9.5px] text-slate-400 uppercase font-semibold block">Nom & Prénom</span>
                    <div className="text-base font-extrabold text-white leading-tight">
                      {student.lastName.toUpperCase()} {student.firstName}
                    </div>
                  </div>

                  <div>
                    <span className="text-[9.5px] text-slate-400 uppercase font-semibold block">Classe & Cycle</span>
                    <strong className="text-emerald-300 text-xs font-bold">{student.classroom}</strong>
                  </div>

                  <div>
                    <span className="text-[9.5px] text-slate-400 uppercase font-semibold block">Né(e) le / à</span>
                    <div className="text-slate-200 text-[11px]">
                      {student.birthDate} à <span className="font-medium">{student.birthPlace || city}</span>
                    </div>
                  </div>

                  {student.email && (
                    <div>
                      <span className="text-[9.5px] text-slate-400 uppercase font-semibold block">E-mail Éducatif</span>
                      <div className="text-slate-300 font-mono text-[10px] truncate">{student.email}</div>
                    </div>
                  )}
                </div>

                {/* Scannable QR Code column */}
                <div className="sm:col-span-3 flex flex-col items-center justify-center p-2 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <div className="w-24 h-24 bg-white p-1 rounded-xl shadow-lg flex items-center justify-center">
                    {qrCodeDataUrl ? (
                      <img src={qrCodeDataUrl} alt="QR Code validation" className="w-full h-full object-contain" />
                    ) : (
                      <span className="material-symbols-outlined text-slate-950 text-[36px]">qr_code_2</span>
                    )}
                  </div>
                  <div className="mt-1 text-[8.5px] text-slate-400 uppercase tracking-tight font-semibold">
                    Contrôle Numérique MEPPSA
                  </div>
                  <div className="text-[8px] text-emerald-400 font-mono">Authentifié 🇨🇬</div>
                </div>
              </div>

              {/* Bottom security strip */}
              <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-[10px]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-slate-400">
                    Statut : <strong className="text-emerald-300 font-bold">{student.status}</strong>
                  </span>
                </div>

                <div className="text-right flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400 text-[16px]">verified_user</span>
                  <span className="text-slate-300 font-semibold italic text-[9.5px]">Le Chef d'Établissement (Signature Numérique)</span>
                </div>
              </div>
            </div>
          ) : (
            /* VERSO CARD DESIGN */
            <div
              id="student-school-card-verso"
              className="rounded-3xl border border-white/15 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 shadow-[0_12px_40px_rgba(0,0,0,0.7)] relative overflow-hidden p-6 sm:p-7 space-y-4"
            >
              <div className="border-b border-white/10 pb-3 flex justify-between items-center">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  DISPOSITIONS & INFORMATIONS LÉGALES (VERSO)
                </div>
                <div className="text-[10px] text-slate-400 font-mono">ID: {student.id}</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Emergency contact */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
                  <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1.5 text-emerald-300">
                    <span className="material-symbols-outlined text-[15px]">contact_phone</span>
                    Contact Parent / Tuteur Légal
                  </div>
                  <div className="text-slate-100 font-bold text-sm">{student.parentName}</div>
                  <div className="text-emerald-400 font-mono font-semibold text-xs flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">phone_iphone</span>
                    {student.parentPhone}
                  </div>
                  {student.address && (
                    <div className="text-slate-400 text-[11px] pt-1">
                      <strong>Domicile :</strong> {student.address}
                    </div>
                  )}
                </div>

                {/* School Regulations Rules */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5 text-[11px] text-slate-300">
                  <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1.5 text-indigo-300">
                    <span className="material-symbols-outlined text-[15px]">gavel</span>
                    Règlement d'Utilisation
                  </div>
                  <p>
                    1. Cette carte est strictement personnelle et obligatoire pour accéder aux cours et examens d'État.
                  </p>
                  <p>
                    2. En cas de perte, faire une déclaration immédiate à la Direction des Études.
                  </p>
                  <p className="text-[10px] text-slate-400 italic">
                    Si trouvée, prière de la rapporter au {schoolName} ou au commissariat le plus proche.
                  </p>
                </div>
              </div>

              {/* Barcode representation */}
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center">
                <div className="font-mono text-[9px] tracking-[6px] text-slate-400 uppercase">
                  ||| | | |||| || ||| | ||| |||| | ||| | || ||||| | ||||
                </div>
                <div className="font-mono text-[10px] text-slate-300 font-bold tracking-widest mt-1">
                  * {student.matricule} *
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Verification Link Bar */}
        <div className="mt-4 p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-300 text-[11px] truncate">
            <span className="material-symbols-outlined text-emerald-400 text-[16px]">link</span>
            <span className="text-slate-400">Lien public de vérification :</span>
            <span className="font-mono text-indigo-300 truncate">https://{student.matricule.toLowerCase()}.edu-congo.netlify.app/verify</span>
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">
              {copiedLink ? 'check' : 'content_copy'}
            </span>
            <span>{copiedLink ? 'Copié !' : 'Copier le lien'}</span>
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-5">
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
            Imprimer la Carte Scolaire (Format PVC)
          </button>
        </div>
      </div>

      {/* Live Camera Modal for Student Photo */}
      <LiveCameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handlePhotoCaptured}
        title={`Photo d'identité : ${student.firstName} ${student.lastName}`}
        subtitle="Prenez une photo nette de face pour la carte scolaire officielle"
      />
    </div>
  );
};
