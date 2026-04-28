import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';
import { Context } from '../main';
import MainLayout from '../layout/MainLayout';
import {
  Trophy,
  Flame,
  CalendarCheck,
  Award,
  Medal,
  TrendingUp,
  Activity,
  Code,
  FlaskConical,
  Swords,
  Star,
  Crown,
  Zap,
  Clock,
  X,
  Camera,
  Upload,
  AlertCircle,
} from 'lucide-react';
import api from '../api/client';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB hard cap per image
const MAX_IMAGE_LABEL = '2 MB';

const RANK_BADGE_CONFIG = {
  1: {
    label: '🥇 Rank #1',
    gradient: 'from-yellow-400/20 to-amber-300/10',
    border: 'border-yellow-400/40',
    icon: Crown,
    iconColor: 'text-yellow-400',
    bg: 'bg-yellow-400/20',
    glow: 'shadow-yellow-400/20',
  },
  2: {
    label: '🥈 Rank #2',
    gradient: 'from-slate-400/20 to-slate-300/10',
    border: 'border-slate-400/40',
    icon: Medal,
    iconColor: 'text-slate-400',
    bg: 'bg-slate-400/20',
    glow: 'shadow-slate-400/20',
  },
  3: {
    label: '🥉 Rank #3',
    gradient: 'from-orange-400/20 to-amber-600/10',
    border: 'border-orange-400/40',
    icon: Medal,
    iconColor: 'text-orange-400',
    bg: 'bg-orange-400/20',
    glow: 'shadow-orange-400/20',
  },
  4: {
    label: 'Rank #4',
    gradient: 'from-blue-400/20 to-cyan-400/10',
    border: 'border-blue-400/40',
    icon: Star,
    iconColor: 'text-blue-400',
    bg: 'bg-blue-400/20',
    glow: 'shadow-blue-400/20',
  },
  5: {
    label: 'Rank #5',
    gradient: 'from-purple-400/20 to-violet-400/10',
    border: 'border-purple-400/40',
    icon: Zap,
    iconColor: 'text-purple-400',
    bg: 'bg-purple-400/20',
    glow: 'shadow-purple-400/20',
  },
};

const HEATMAP_FILTERS = [
  { label: '10D', cols: 2 },
  { label: '1M',  cols: 4 },
  { label: '3M',  cols: 13 },
  { label: '6M',  cols: 26 },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

// ---------------------------------------------------------------------------
// ErrorToast — bottom-center popup, auto-dismisses after 6 s
// ---------------------------------------------------------------------------
const ErrorToast = ({ message, onClose }) => {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4">
      <div className="flex items-start gap-3 p-4 rounded-xl bg-red-600 text-white shadow-2xl shadow-red-900/40 border border-red-500/60">
        <div className="shrink-0 mt-0.5">
          <AlertCircle size={18} className="text-red-200" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold leading-snug">Upload Error</p>
          <p className="text-xs text-red-100 mt-1 whitespace-pre-line leading-relaxed">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 p-0.5 rounded text-red-200 hover:text-white hover:bg-red-500/40 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// StatCard
// ---------------------------------------------------------------------------
const StatCard = ({ icon: Icon, iconColor, value, label }) => (
  <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex flex-col items-center justify-center text-center hover:scale-105 transition-transform cursor-default">
    <Icon size={28} className={`${iconColor} mb-2 drop-shadow-md`} />
    <p className="text-2xl font-black text-slate-800 dark:text-white">{value}</p>
    <p className="text-xs text-slate-500 dark:text-white/50 uppercase tracking-wider font-semibold">{label}</p>
  </div>
);

// ---------------------------------------------------------------------------
// RankBadgeCard
// ---------------------------------------------------------------------------
const RankBadgeCard = ({ rank, contestName }) => {
  const cfg = RANK_BADGE_CONFIG[rank];
  if (!cfg) return null;
  const Icon = cfg.icon;
  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r ${cfg.gradient} border ${cfg.border} hover:shadow-lg ${cfg.glow} transition-all cursor-pointer group`}>
      <div className={`w-12 h-12 rounded-full ${cfg.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-md`}>
        <Icon size={22} className={`${cfg.iconColor} drop-shadow-lg`} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-slate-800 dark:text-white text-sm">{cfg.label} — Weekly Badge</h3>
        <p className="text-xs text-slate-500 dark:text-white/60 mt-0.5 truncate">{contestName}</p>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// MonthlyBadgeCard
// ---------------------------------------------------------------------------
const MonthlyBadgeCard = ({ month, count }) => (
  <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/5 border border-purple-400/30 hover:shadow-lg shadow-purple-400/10 transition-all cursor-pointer group">
    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-md">
      <Award size={22} className="text-purple-400 drop-shadow-lg" />
    </div>
    <div>
      <h3 className="font-bold text-slate-800 dark:text-white text-sm">Performer of the Month — {month}</h3>
      <p className="text-xs text-slate-500 dark:text-white/60 mt-0.5">Appeared in Top 5 — {count}x that month</p>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// ImageUploadField
//   • Enforces MAX_IMAGE_BYTES — calls onError(msg) instead of alert()
//   • Shows "Max 2 MB" badge in the label row
//   • Shows a colour-coded size meter bar after a file is picked
// ---------------------------------------------------------------------------
const ImageUploadField = ({ label, value, onChange, previewClassName, onError }) => {
  const inputRef = useRef(null);
  const [fileInfo, setFileInfo] = useState(null); // { name, size }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onError?.('Invalid file type. Please select a JPG, PNG, or GIF image.');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      onError?.(
        `"${file.name}" is ${formatBytes(file.size)} — exceeds the ${MAX_IMAGE_LABEL} limit.\n\nTip: Compress your image at squoosh.app or tinypng.com before uploading.`
      );
      e.target.value = '';
      return;
    }

    setFileInfo({ name: file.name, size: file.size });
    const reader = new FileReader();
    reader.onload = (event) => onChange(event.target.result);
    reader.readAsDataURL(file);
  };

  const sizePercent = fileInfo ? Math.min((fileInfo.size / MAX_IMAGE_BYTES) * 100, 100) : 0;
  const meterColor =
    sizePercent > 85 ? 'bg-red-500' :
    sizePercent > 60 ? 'bg-yellow-400' :
    'bg-green-500';

  return (
    <div>
      {/* Label row with limit badge */}
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-slate-600 dark:text-white/70 uppercase tracking-wide">
          {label}
        </label>
        <span className="text-[10px] font-semibold text-slate-400 dark:text-white/30 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full border border-slate-200 dark:border-white/10">
          Max {MAX_IMAGE_LABEL}
        </span>
      </div>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        className="relative w-full cursor-pointer rounded-xl border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-brand-yellow dark:hover:border-brand-yellow transition-colors overflow-hidden group"
      >
        {value ? (
          <div className={`relative ${previewClassName || 'h-24'}`}>
            {/* FIX: key={value} forces React to remount the img when src changes,
                preventing stale preview when switching between uploaded images */}
            <img key={value} src={value} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
              <div className="flex items-center gap-2 text-white text-sm font-semibold">
                <Upload size={16} />
                Change Image
              </div>
              {fileInfo && (
                <span className="text-white/60 text-[10px]">{formatBytes(fileInfo.size)}</span>
              )}
            </div>
          </div>
        ) : (
          <div className="h-24 flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-white/30 group-hover:text-brand-yellow transition-colors p-4">
            <Upload size={22} />
            <span className="text-xs font-medium text-center">
              Click to upload — JPG, PNG, GIF
            </span>
          </div>
        )}
      </div>

      {/* Size meter — only shown after a file is picked */}
      {fileInfo && (
        <div className="mt-2 space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-400 dark:text-white/40 truncate max-w-[60%]">
              {fileInfo.name}
            </span>
            <span className={`text-[10px] font-bold ${sizePercent > 85 ? 'text-red-500' : 'text-slate-400 dark:text-white/40'}`}>
              {formatBytes(fileInfo.size)} / {MAX_IMAGE_LABEL}
            </span>
          </div>
          <div className="w-full h-1 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${meterColor}`}
              style={{ width: `${sizePercent}%` }}
            />
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

// ---------------------------------------------------------------------------
// ProfilePage
// ---------------------------------------------------------------------------
const ProfilePage = () => {
  const { user, setUser } = useContext(Context);

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [isEditing, setIsEditing]     = useState(false);
  const [saving, setSaving]           = useState(false);
  const [heatmapCols, setHeatmapCols] = useState(26);

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const showError  = useCallback((msg) => setToastMsg(msg), []);
  const closeToast = useCallback(() => setToastMsg(''), []);

  const [editForm, setEditForm] = useState({
    name: '', headline: '', avatar: '', wallpaper: '',
  });

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const { data } = await api.get('/user/profile');
        setProfileData(data.profile);
        setEditForm({
          name:      data.profile.name      || '',
          headline:  data.profile.headline  || '',
          avatar:    data.profile.avatar    || '',
          wallpaper: data.profile.wallpaper || '',
        });
      } catch (err) {
        console.error('Failed to fetch profile data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  // Save — diff-only payload; catches 413 explicitly
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {};
      if (editForm.name      !== (profileData?.name      || '')) payload.name      = editForm.name;
      if (editForm.headline  !== (profileData?.headline  || '')) payload.headline  = editForm.headline;
      if (editForm.avatar    !== (profileData?.avatar    || '')) payload.avatar    = editForm.avatar;
      if (editForm.wallpaper !== (profileData?.wallpaper || '')) payload.wallpaper = editForm.wallpaper;

      if (Object.keys(payload).length === 0) {
        setIsEditing(false);
        return;
      }

      const { data } = await api.put('/user/profile', payload);
      setProfileData(prev => ({ ...prev, ...data.profile }));
      // Sync the global Context user so the Navbar avatar updates immediately
      setUser(prev => ({ ...prev, avatar: data.profile.avatar ?? prev.avatar, name: data.profile.name ?? prev.name }));
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
      const status = err?.response?.status;
      let msg;
      if (status === 413) {
        msg =
          'Request Entity Too Large (413)\n\n' +
          'Your images are too big to send together. Please:\n' +
          '\u2022 Use images under 2 MB each\n' +
          '\u2022 Compress at squoosh.app or tinypng.com\n' +
          '\u2022 Or update one image at a time';
      } else {
        msg =
          err?.response?.data?.message ||
          err?.response?.data?.error   ||
          err?.message                 ||
          'Unknown error occurred.';
      }
      showError(msg);
    } finally {
      setSaving(false);
    }
  };

  // Derived
  const stats = {
    contestRank:          profileData?.contestRank          || 0,
    contestPoints:        profileData?.contestPoints        || 0,
    totalSolved:          profileData?.totalSolved          || 0,
    contestsParticipated: profileData?.contestsParticipated || 0,
    streak:               profileData?.streak               || 0,
  };
  const weeklyBadges   = profileData?.weeklyBadges  || [];
  const monthlyBadges  = profileData?.monthlyBadges || [];
  const recentActivity = profileData?.recentActivity|| [];
  const hasBadges      = weeklyBadges.length > 0 || monthlyBadges.length > 0;
  const solveBreakdown = profileData?.solveBreakdown || {
    easy: 0, medium: 0, hard: 0, easyTotal: 0, mediumTotal: 0, hardTotal: 0,
  };

  const getHeatColor = (dateStr) => {
    const count = profileData?.heatmap?.[dateStr] || 0;
    if (count > 5) return 'bg-green-500';
    if (count > 3) return 'bg-green-400';
    if (count > 1) return 'bg-green-300';
    if (count > 0) return 'bg-green-200';
    return 'bg-slate-100 dark:bg-white/5';
  };

  const getMonthLabels = (cols) => {
    const labels = [];
    let lastMonth = null;
    for (let col = 0; col < cols; col++) {
      const date = new Date();
      date.setDate(date.getDate() - (cols - 1 - col) * 7);
      const monthName = date.toLocaleString('default', { month: 'short' });
      if (monthName !== lastMonth) {
        labels.push({ col, label: monthName });
        lastMonth = monthName;
      } else {
        labels.push({ col, label: null });
      }
    }
    return labels;
  };

  const activityIcon = (type) => {
    if (type === 'solve')   return <Code size={16} />;
    if (type === 'contest') return <Swords size={16} />;
    if (type === 'lab')     return <FlaskConical size={16} />;
    return <Flame size={16} />;
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-background-light dark:bg-bg-dark pt-8 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Profile Header */}
          <div className="relative rounded-2xl overflow-hidden bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div
              className="h-40 bg-gradient-to-r from-blue-600 via-purple-600 to-brand-yellow opacity-90 bg-cover bg-center"
              style={{ backgroundImage: profileData?.wallpaper ? `url(${profileData.wallpaper})` : undefined }}
            />
            <div className="px-6 sm:px-10 pb-8 relative">
              <div className="flex flex-col sm:flex-row sm:items-end gap-6 sm:-mt-16 -mt-12">
                <div className="w-32 h-32 rounded-full border-4 border-white dark:border-card-dark bg-slate-200 dark:bg-slate-700 overflow-hidden shadow-lg shrink-0">
                  <img
                    src={profileData?.avatar || user?.avatar || 'https://picsum.photos/seed/user123/200/200'}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 pb-2">
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white mt-4 sm:mt-0">
                    {profileData?.name || user?.name || 'Aman Kaushal'}
                  </h1>
                  <p className="text-slate-500 dark:text-white/60 font-medium font-mono text-sm uppercase tracking-wider mt-1">
                    {profileData?.headline || user?.email || 'Student @ 1st Year CSE'}
                  </p>
                </div>
                <div className="pb-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-md"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* LEFT */}
            <div className="lg:col-span-1 space-y-8">

              {/* Performance Overview */}
              <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-slate-200 dark:border-white/10 shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow/5 rounded-full blur-3xl group-hover:bg-brand-yellow/10 transition-colors" />
                <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-1 flex items-center gap-2">
                  <Activity size={20} className="text-brand-yellow" />
                  Performance Overview
                </h2>
                <p className="text-xs text-slate-400 dark:text-white/40 mb-5 ml-7">Rank &amp; Points from Contests only</p>
                <div className="grid grid-cols-2 gap-4">
                  <StatCard icon={Trophy}     iconColor="text-yellow-500" value={`#${stats.contestRank}`}    label="Contest Rank" />
                  <StatCard icon={TrendingUp} iconColor="text-green-500"  value={stats.contestPoints}        label="Contest Points" />
                  <StatCard icon={Flame}      iconColor="text-orange-500" value={stats.streak}               label="Day Streak" />
                  <StatCard icon={Swords}     iconColor="text-blue-500"   value={stats.contestsParticipated} label="Contests" />
                </div>
              </div>

              {/* Honors & Badges */}
              <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-slate-200 dark:border-white/10 shadow-lg hover:-translate-y-1 transition-transform duration-300">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
                  <Award size={20} className="text-purple-400" />
                  Honors &amp; Badges
                </h2>

                {!hasBadges && (
                  <div className="text-center py-8 text-slate-400 dark:text-white/30">
                    <Medal size={36} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">No badges earned yet.</p>
                    <p className="text-xs mt-1">Finish in the Top 5 of a contest!</p>
                  </div>
                )}

                {hasBadges && (
                  <div className="space-y-3">
                    {monthlyBadges.map((b, i) => (
                      <MonthlyBadgeCard key={`monthly-${i}`} month={b.month} count={b.count} />
                    ))}
                    {weeklyBadges.map((b, i) => (
                      <RankBadgeCard key={`weekly-${i}`} rank={b.rank} contestName={b.contestName} />
                    ))}
                  </div>
                )}

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/5">
                  <p className="text-xs text-slate-400 dark:text-white/40 font-semibold uppercase tracking-wider mb-2">How badges work</p>
                  <ul className="space-y-1">
                    <li className="text-xs text-slate-500 dark:text-white/50 flex items-center gap-1.5">
                      <Crown size={11} className="text-yellow-400" /> Weekly — Top 5 finish in any contest (Rank 1-5)
                    </li>
                    <li className="text-xs text-slate-500 dark:text-white/50 flex items-center gap-1.5">
                      <Award size={11} className="text-purple-400" /> Monthly — Most frequent Top 5 appearances that month
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="lg:col-span-2 space-y-8">

              {/* Contribution Heatmap */}
              <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-slate-200 dark:border-white/10 shadow-lg hover:-translate-y-1 transition-transform duration-300">
                <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <CalendarCheck size={20} className="text-green-500" />
                    Contribution Heatmap
                  </h2>
                  <div className="flex items-center gap-1.5">
                    {HEATMAP_FILTERS.map((f) => (
                      <button
                        key={f.label}
                        onClick={() => setHeatmapCols(f.cols)}
                        className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all duration-150 ${
                          heatmapCols === f.cols
                            ? 'bg-green-500 border-green-500 text-white shadow-sm shadow-green-500/30'
                            : 'bg-transparent border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/50 hover:border-green-400 hover:text-green-500 dark:hover:text-green-400'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto pb-2">
                  <div className="flex gap-1 min-w-max mb-1.5">
                    {getMonthLabels(heatmapCols).map(({ col, label }) => (
                      <div key={col} className="w-4 flex items-end justify-start">
                        {label
                          ? <span className="text-[10px] font-semibold text-slate-400 dark:text-white/40 leading-none whitespace-nowrap">{label}</span>
                          : <span className="text-[10px] leading-none">&nbsp;</span>
                        }
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-1 min-w-max">
                    {[...Array(heatmapCols)].map((_, col) => (
                      <div key={col} className="flex flex-col gap-1">
                        {[...Array(7)].map((_, row) => {
                          const date = new Date();
                          date.setDate(date.getDate() - (heatmapCols - 1 - col) * 7 - (6 - row));
                          const dateStr = date.toISOString().split('T')[0];
                          return (
                            <div
                              key={`${col}-${row}`}
                              className={`w-4 h-4 rounded-sm ${getHeatColor(dateStr)} hover:ring-2 ring-slate-400 dark:ring-white transition-all cursor-crosshair`}
                              title={dateStr}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end items-center gap-2 mt-4 text-xs font-medium text-slate-500 dark:text-white/50">
                  <span>Less</span>
                  <div className="w-3 h-3 rounded-sm bg-slate-100 dark:bg-white/5" />
                  <div className="w-3 h-3 rounded-sm bg-green-200" />
                  <div className="w-3 h-3 rounded-sm bg-green-400" />
                  <div className="w-3 h-3 rounded-sm bg-green-500" />
                  <span>More</span>
                </div>
              </div>

              {/* Problems Solved */}
              <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-slate-200 dark:border-white/10 shadow-lg hover:-translate-y-1 transition-transform duration-300">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
                  <Code size={20} className="text-green-500" />
                  Problems Solved
                </h2>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Easy',   value: solveBreakdown.easy,   total: solveBreakdown.easyTotal,   color: 'text-green-500',  bar: 'bg-green-500',  bg: 'bg-green-500/10'  },
                    { label: 'Medium', value: solveBreakdown.medium, total: solveBreakdown.mediumTotal, color: 'text-yellow-500', bar: 'bg-yellow-500', bg: 'bg-yellow-500/10' },
                    { label: 'Hard',   value: solveBreakdown.hard,   total: solveBreakdown.hardTotal,   color: 'text-red-500',    bar: 'bg-red-500',    bg: 'bg-red-500/10'    },
                  ].map((d) => (
                    <div key={d.label} className={`p-4 rounded-xl ${d.bg} border border-white/5 flex flex-col items-center gap-2`}>
                      <span className={`text-2xl font-black ${d.color}`}>{d.value}</span>
                      <span className="text-xs font-bold text-slate-600 dark:text-white/60 uppercase tracking-wider">{d.label}</span>
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${d.bar} rounded-full`}
                          style={{ width: d.total > 0 ? `${Math.min((d.value / d.total) * 100, 100)}%` : '0%' }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 dark:text-white/30">{d.value} / {d.total}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-slate-200 dark:border-white/10 shadow-lg hover:-translate-y-1 transition-transform duration-300">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Recent Activity</h2>
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-white/10 before:to-transparent">
                  {recentActivity?.length > 0 ? (
                    recentActivity.map((item) => (
                      <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-card-dark ${item.status === 'Accepted' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'} shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2`}>
                          {activityIcon(item.type)}
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-brand-yellow/50 transition-colors">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`font-mono text-xs font-bold uppercase tracking-wider ${item.status === 'Accepted' ? 'text-green-500' : 'text-red-500'}`}>
                              {item.type}
                            </span>
                            <span className="text-xs font-medium text-slate-400 dark:text-white/40 flex items-center gap-1">
                              <Clock size={10} />
                              {item.time}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-white">{item.action}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-sm text-slate-400">No recent activity.</div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-white/5 shrink-0">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Camera size={20} className="text-brand-yellow" />
                Edit Profile
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              <form onSubmit={handleSaveProfile} className="p-4 space-y-4">

                {/* Headline */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-white/70 uppercase mb-1">
                    Headline / Bio
                  </label>
                  <input
                    type="text"
                    value={editForm.headline}
                    onChange={(e) => setEditForm(prev => ({ ...prev, headline: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                    placeholder="e.g. Student @ 1st Year CSE"
                  />
                </div>

                {/* Avatar */}
                {/* FIX: Using functional updater `prev => ({ ...prev, avatar: base64 })`
                    to avoid stale closure overwriting the other field's value */}
                <ImageUploadField
                  label="Avatar Image"
                  value={editForm.avatar}
                  onChange={(base64) => setEditForm(prev => ({ ...prev, avatar: base64 }))}
                  previewClassName="h-24"
                  onError={showError}
                />

                {/* Wallpaper */}
                {/* FIX: Same stale closure fix for wallpaper */}
                <ImageUploadField
                  label="Wallpaper Banner"
                  value={editForm.wallpaper}
                  onChange={(base64) => setEditForm(prev => ({ ...prev, wallpaper: base64 }))}
                  previewClassName="h-32"
                  onError={showError}
                />

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-brand-yellow text-black font-bold text-sm rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Error Toast — outside the modal so it's always on top */}
      <ErrorToast message={toastMsg} onClose={closeToast} />
    </MainLayout>
  );
};

export default ProfilePage;