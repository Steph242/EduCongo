import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { MONTHLY_ATTENDANCE_DATA, DailyAttendanceRecord } from '../../data/mockData';
import { exportAttendanceCSV, generatePrintableReportWindow } from '../../utils/exportUtils';

interface AttendanceChartProps {
  schoolName?: string;
  cityName?: string;
  schoolCode?: string;
  studentsCount?: number;
}

type ChartType = 'rate' | 'counts' | 'composed';

export const AttendanceChart: React.FC<AttendanceChartProps> = ({
  schoolName = "Lycée d'Excellence",
  cityName = "Brazzaville",
  schoolCode = "BZV-24-X8B",
  studentsCount = 0,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [chartType, setChartType] = useState<ChartType>('rate');
  const [selectedMonth, setSelectedMonth] = useState<string>('nov-2024');
  const [showTableModal, setShowTableModal] = useState<boolean>(false);
  const [searchDay, setSearchDay] = useState<string>('');
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  const showExportNotice = (msg: string) => {
    setExportFeedback(msg);
    setTimeout(() => setExportFeedback(null), 3000);
  };

  const handleExportCSV = () => {
    exportAttendanceCSV(MONTHLY_ATTENDANCE_DATA, selectedClass, schoolName);
    showExportNotice('Rapport d\'assiduité exporté avec succès en CSV !');
  };

  const handleExportPDF = () => {
    const tableRows = chartData
      .map(
        (d) => `<tr>
          <td><strong>${d.fullDate}</strong></td>
          <td class="text-center bold" style="color: #047857;">${d.present}</td>
          <td class="text-center" style="color: #b45309;">${d.late}</td>
          <td class="text-center" style="color: #be123c;">${d.absent}</td>
          <td class="text-center font-mono">${d.justified}J / ${d.unjustified}I</td>
          <td class="text-center bold" style="font-family: monospace; font-size: 12px; background: #ecfdf5;">${d.rate}%</td>
          <td style="font-size: 10px; font-style: italic;">${d.note || '—'}</td>
        </tr>`
      )
      .join('');

    const bodyHtml = `
      <div style="margin-bottom: 15px; font-size: 11px; background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0;">
        <table style="width: 100%; border: none;">
          <tr>
            <td><strong>Classe analysée :</strong> ${selectedClass === 'all' ? 'Toutes les classes de l\'établissement' : selectedClass}</td>
            <td><strong>Mois :</strong> Novembre 2024</td>
            <td><strong>Taux Moyen Mensuel :</strong> <span style="font-size: 14px; font-weight: bold; color: #047857;">${stats.avgRate}%</span></td>
          </tr>
          <tr>
            <td><strong>Cumul Présences :</strong> ${stats.totalPresent}</td>
            <td><strong>Cumul Absences :</strong> ${stats.totalAbsent} (${stats.totalJustified}J / ${stats.totalUnjustified}I)</td>
            <td><strong>Total Retards constatés :</strong> ${stats.totalLate}</td>
          </tr>
        </table>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th>Date / Jour</th>
            <th>Élèves Présents</th>
            <th>Retards</th>
            <th>Absents</th>
            <th>Justif / Injustif</th>
            <th>Taux Assiduité</th>
            <th>Observations Vie Scolaire</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
        <tfoot>
          <tr style="background: #f1f5f9; font-weight: bold;">
            <td>TOTAL / MOYENNE MENSUELLE</td>
            <td class="text-center">${stats.totalPresent}</td>
            <td class="text-center">${stats.totalLate}</td>
            <td class="text-center">${stats.totalAbsent}</td>
            <td class="text-center">${stats.totalJustified}J / ${stats.totalUnjustified}I</td>
            <td class="text-center" style="font-size: 13px; color: #047857;">${stats.avgRate}%</td>
            <td>Rapport mensuel DDEPSA</td>
          </tr>
        </tfoot>
      </table>
    `;

    generatePrintableReportWindow({
      title: `RAPPORT MENSUEL D'ASSIDUITÉ ET DE DISCIPLINE - ${selectedClass === 'all' ? 'ENSEMBLE DES CLASSES' : selectedClass.toUpperCase()}`,
      category: 'Assiduité',
      schoolName,
      schoolCode,
      city: cityName,
      bodyHtml,
    });

    showExportNotice('Rapport d\'assiduité généré pour impression / export PDF !');
  };

  // Process data based on selected class
  const chartData = useMemo(() => {
    return MONTHLY_ATTENDANCE_DATA.map((record) => {
      if (selectedClass === 'all' || !record.byClass || !record.byClass[selectedClass]) {
        return {
          date: record.date,
          fullDate: record.fullDate,
          dayOfWeek: record.dayOfWeek,
          present: record.present,
          absent: record.absent,
          late: record.late,
          total: record.total,
          rate: record.rate,
          justified: record.justifiedAbsences,
          unjustified: record.unjustifiedAbsences,
          note: record.weatherOrNote,
        };
      }

      const classData = record.byClass[selectedClass];
      const justified = Math.round(classData.absent * 0.7);
      const unjustified = classData.absent - justified;

      return {
        date: record.date,
        fullDate: record.fullDate,
        dayOfWeek: record.dayOfWeek,
        present: classData.present,
        absent: classData.absent,
        late: classData.late,
        total: classData.total,
        rate: classData.rate,
        justified,
        unjustified,
        note: record.weatherOrNote,
      };
    });
  }, [selectedClass]);

  // Aggregate monthly stats
  const stats = useMemo(() => {
    if (studentsCount === 0 || chartData.length === 0) {
      return {
        avgRate: '0.0',
        totalPresent: 0,
        totalAbsent: 0,
        totalLate: 0,
        bestDay: null,
        worstDay: null,
        totalJustified: 0,
        totalUnjustified: 0,
        daysCount: 0,
      };
    }

    const totalRate = chartData.reduce((acc, d) => acc + d.rate, 0);
    const avgRate = (totalRate / chartData.length).toFixed(1);
    const totalPresent = chartData.reduce((acc, d) => acc + d.present, 0);
    const totalAbsent = chartData.reduce((acc, d) => acc + d.absent, 0);
    const totalLate = chartData.reduce((acc, d) => acc + d.late, 0);

    const sortedByRate = [...chartData].sort((a, b) => b.rate - a.rate);
    const bestDay = sortedByRate[0];
    const worstDay = sortedByRate[sortedByRate.length - 1];

    const totalJustified = chartData.reduce((acc, d) => acc + d.justified, 0);
    const totalUnjustified = chartData.reduce((acc, d) => acc + d.unjustified, 0);

    return {
      avgRate,
      totalPresent,
      totalAbsent,
      totalLate,
      bestDay,
      worstDay,
      totalJustified,
      totalUnjustified,
      daysCount: chartData.length,
    };
  }, [chartData, studentsCount]);

  // Custom Frosted Glass Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950/95 backdrop-blur-2xl p-4 rounded-2xl border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.8)] text-xs space-y-2 min-w-[220px]">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="font-bold text-white text-sm flex items-center gap-1.5">
              <span className="material-symbols-outlined text-emerald-400 text-[16px]">calendar_month</span>
              {data.fullDate}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Taux d'assiduité :</span>
            <span className="font-bold font-mono text-emerald-400 text-sm bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
              {data.rate}%
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10 text-center">
              <span className="text-[10px] text-slate-400 block">Présents</span>
              <span className="font-bold text-white text-xs">{data.present}</span>
            </div>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
              <span className="text-[10px] text-amber-300 block">Retards</span>
              <span className="font-bold text-amber-300 text-xs">{data.late}</span>
            </div>
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
              <span className="text-[10px] text-rose-300 block">Absents</span>
              <span className="font-bold text-rose-300 text-xs">{data.absent}</span>
            </div>
          </div>

          {data.note && (
            <div className="pt-1.5 border-t border-white/10 text-[11px] text-slate-300 italic flex items-center gap-1">
              <span className="material-symbols-outlined text-indigo-400 text-[14px]">info</span>
              {data.note}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white/[0.04] backdrop-blur-2xl rounded-3xl border border-white/15 p-5 sm:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.35)] space-y-6">
      {/* Header with Title and Global Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950 font-bold shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              <span className="material-symbols-outlined text-[20px]">insights</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-emerald-300 bg-clip-text text-transparent">
              Statistiques Quotidiennes de Présence des Élèves
            </h2>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-2">
            <span>Mois en cours : <strong className="text-emerald-300">Novembre 2024</strong></span>
            <span>•</span>
            <span>Établissement : <strong className="text-slate-300">{schoolName} ({cityName})</strong></span>
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Class selector */}
          <div className="relative">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 bg-white/[0.06] border border-white/15 rounded-xl text-xs text-slate-200 focus:border-emerald-400 outline-none backdrop-blur-md cursor-pointer pr-8 appearance-none"
            >
              <option value="all" className="bg-[#0b1329] text-white">Toutes les classes</option>
              <option value="Terminale D" className="bg-[#0b1329] text-white">Terminale D</option>
              <option value="Terminale C" className="bg-[#0b1329] text-white">Terminale C</option>
              <option value="Première D" className="bg-[#0b1329] text-white">Première D</option>
              <option value="3ème A" className="bg-[#0b1329] text-white">3ème A</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
              <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </div>
          </div>

          {/* Chart Type Toggle Buttons */}
          <div className="bg-white/[0.04] p-1 rounded-xl border border-white/10 flex items-center gap-1 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setChartType('rate')}
              title="Courbe du Taux d'Assiduité"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                chartType === 'rate'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">show_chart</span>
              <span className="hidden sm:inline">Taux (%)</span>
            </button>

            <button
              type="button"
              onClick={() => setChartType('counts')}
              title="Barres d'Effectif (Présents / Retards / Absents)"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                chartType === 'counts'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">bar_chart</span>
              <span className="hidden sm:inline">Effectif</span>
            </button>

            <button
              type="button"
              onClick={() => setChartType('composed')}
              title="Vue Mixte Combinée"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                chartType === 'composed'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">stacked_line_chart</span>
              <span className="hidden sm:inline">Mixte</span>
            </button>
          </div>

          {/* View Details Table Button */}
          <button
            type="button"
            onClick={() => setShowTableModal(true)}
            className="px-3 py-2 bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25 border border-indigo-500/30 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">table_rows</span>
            <span className="hidden md:inline">Journal Détaillé</span>
          </button>

          {/* Export Dropdown / Action Buttons */}
          <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={handleExportPDF}
              title="Exporter le Rapport Mensuel d'Assiduité en PDF"
              className="px-2.5 py-1.5 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">picture_as_pdf</span>
              <span>PDF</span>
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              title="Exporter les données d'Assiduité en CSV / Excel"
              className="px-2.5 py-1.5 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">csv</span>
              <span>CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Export Toast Feedback */}
      {exportFeedback && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-2 rounded-xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span className="font-semibold">{exportFeedback}</span>
        </div>
      )}

      {/* KPI Highlight Micro-Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Taux Moyen du Mois
            </span>
            <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified</span>
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">
            {stats.avgRate}%
          </div>
          <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1">
            <span className="text-emerald-400 font-semibold">+1.2%</span> vs Octobre (Conforme MEPPSA)
          </div>
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Présences
            </span>
            <span className="material-symbols-outlined text-indigo-400 text-[18px]">how_to_reg</span>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {stats.totalPresent.toLocaleString('fr-FR')}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Sur {stats.daysCount} jours d'école ouvrés
          </div>
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl pointer-events-none"></div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Retards Signalés
            </span>
            <span className="material-symbols-outlined text-amber-400 text-[18px]">schedule</span>
          </div>
          <div className="text-2xl font-extrabold text-amber-300 font-mono">
            {stats.totalLate}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Moyenne: ~{(stats.totalLate / stats.daysCount).toFixed(1)} / jour
          </div>
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-amber-500/10 rounded-full blur-xl pointer-events-none"></div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Absences Cumulées
            </span>
            <span className="material-symbols-outlined text-rose-400 text-[18px]">event_busy</span>
          </div>
          <div className="text-2xl font-extrabold text-rose-300 font-mono">
            {stats.totalAbsent}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            <span className="text-emerald-400 font-semibold">{stats.totalJustified}</span> justifiées • <span className="text-rose-400 font-semibold">{stats.totalUnjustified}</span> injustifiées
          </div>
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-rose-500/10 rounded-full blur-xl pointer-events-none"></div>
        </div>
      </div>

      {/* Main Recharts Container */}
      <div className="w-full h-[340px] sm:h-[380px] pt-2">
        {studentsCount === 0 || chartData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white/[0.02] rounded-2xl border border-dashed border-white/10">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
              <span className="material-symbols-outlined text-[28px]">analytics</span>
            </div>
            <h4 className="font-bold text-white text-base mb-1">Aucune donnée d'assiduité enregistrée</h4>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Cet établissement démarre avec des compteurs à zéro. Dès l'inscription des premiers élèves et la validation de l'appel quotidien par les enseignants, les statistiques d'assiduité apparaîtront ici.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'rate' ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="presenceRateGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                />
                <YAxis
                  domain={[90, 100]}
                  unit="%"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine
                  y={95}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  label={{ value: 'Seuil MEPPSA (95%)', fill: '#f59e0b', fontSize: 10, position: 'insideTopLeft' }}
                />
                <Area
                  type="monotone"
                  dataKey="rate"
                  name="Taux d'assiduité (%)"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#presenceRateGrad)"
                  activeDot={{ r: 6, fill: '#34d399', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            ) : chartType === 'counts' ? (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 10, fontSize: 12, color: '#94a3b8' }}
                  iconType="circle"
                />
                <Bar dataKey="present" name="Présents" fill="#10b981" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="late" name="Retards" fill="#f59e0b" radius={[0, 0, 0, 0]} stackId="a" />
                <Bar dataKey="absent" name="Absents" fill="#ef4444" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            ) : (
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="composedPresenceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[90, 100]}
                  unit="%"
                  stroke="#34d399"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 10, fontSize: 12, color: '#94a3b8' }}
                  iconType="circle"
                />
                <Bar yAxisId="left" dataKey="present" name="Élèves Présents" fill="#6366f1" radius={[4, 4, 0, 0]} fillOpacity={0.7} />
                <Bar yAxisId="left" dataKey="absent" name="Élèves Absents" fill="#ef4444" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="rate"
                  name="Taux d'Assiduité (%)"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#10b981' }}
                />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer Insight bar */}
      <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>
            Jour le plus performant : <strong className="text-white">{stats.bestDay?.fullDate}</strong> ({stats.bestDay?.rate}%)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-500">Registre numérique synchronisé avec les fiches de présence quotidiennes</span>
        </div>
      </div>

      {/* Detailed Table Modal */}
      {showTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-950/95 backdrop-blur-2xl rounded-3xl max-w-3xl w-full p-6 shadow-[0_16px_48px_rgba(0,0,0,0.8)] border border-white/15 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">calendar_today</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white leading-tight">
                    Journal Quotidien d'Assiduité
                  </h3>
                  <p className="text-xs text-slate-400">
                    Novembre 2024 • {selectedClass === 'all' ? 'Toutes les classes' : selectedClass}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTableModal(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="py-3 flex items-center gap-2">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                <input
                  type="text"
                  value={searchDay}
                  onChange={(e) => setSearchDay(e.target.value)}
                  placeholder="Filtrer par jour (ex: Lundi, 12 Nov)..."
                  className="w-full pl-9 pr-3 py-2 border border-white/15 rounded-xl text-xs bg-white/[0.05] text-white focus:border-emerald-400 outline-none backdrop-blur-md"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.06] border-b border-white/10 text-slate-300 font-semibold sticky top-0 backdrop-blur-md">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3 text-center">Présents</th>
                    <th className="p-3 text-center">Retards</th>
                    <th className="p-3 text-center">Absents</th>
                    <th className="p-3 text-right">Taux</th>
                    <th className="p-3">Observation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {chartData
                    .filter((d) => d.fullDate.toLowerCase().includes(searchDay.toLowerCase()) || d.date.toLowerCase().includes(searchDay.toLowerCase()))
                    .map((d, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.03] transition-colors">
                        <td className="p-3 font-semibold text-slate-200">{d.fullDate}</td>
                        <td className="p-3 text-center font-bold text-emerald-400">{d.present}</td>
                        <td className="p-3 text-center text-amber-300">{d.late}</td>
                        <td className="p-3 text-center text-rose-400">
                          {d.absent}{' '}
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({d.justified}J / {d.unjustified}I)
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono font-bold">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] ${
                            d.rate >= 97
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : d.rate >= 95
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {d.rate}%
                          </span>
                        </td>
                        <td className="p-3 text-slate-400 text-[11px] italic">
                          {d.note || '—'}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportPDF}
                  className="px-3 py-2 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                  Exporter en PDF
                </button>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-3 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">csv</span>
                  Exporter en CSV
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowTableModal(false)}
                className="w-full sm:w-auto px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-semibold hover:from-emerald-500 hover:to-teal-500 transition-all border border-emerald-400/30 shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
