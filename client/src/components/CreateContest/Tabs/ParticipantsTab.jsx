import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, X, Loader2, Search, Users, UserPlus, Info } from 'lucide-react';
import clsx from 'clsx';
import FieldWrapper, { inputCls } from '../FieldWrapper';
import { GROUPS } from '../../../hooks/useContestForm';
import { searchUsersForContest } from '../../../api/contestApi';

// ── Debounce helper ────────────────────────────────────────────────────────────
function useDebounce(value, delay) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

// ── Avatar initial chip ────────────────────────────────────────────────────────
function UserAvatar({ name }) {
    const initial = (name || '?')[0].toUpperCase();
    return (
        <div className="w-7 h-7 rounded-full bg-brand-yellow/20 border border-brand-yellow/30 flex items-center justify-center shrink-0">
            <span className="text-[11px] font-bold text-brand-yellow">{initial}</span>
        </div>
    );
}

// ── Group badge ────────────────────────────────────────────────────────────────
function GroupBadge({ group }) {
    if (!group) return null;
    return (
        <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold bg-white/5 border border-white/10 text-white/40 ml-1">
            {group}
        </span>
    );
}

// ── Main component ─────────────────────────────────────────────────────────────
const ParticipantsTab = ({
    group,
    onChangeGroup,
    participants,
    setParticipants,
    notifyStart,
    onChangeNotifyStart,
    notifyResults,
    onChangeNotifyResults,
    isLoadingParticipants,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef(null);
    const dropdownRef = useRef(null);

    const debouncedQuery = useDebounce(searchQuery, 300);

    // ── Live search ────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!debouncedQuery || debouncedQuery.trim().length < 2) {
            setSearchResults([]);
            setShowDropdown(false);
            return;
        }
        const run = async () => {
            setIsSearching(true);
            try {
                const results = await searchUsersForContest(debouncedQuery.trim());
                // Filter out already-added participants
                const addedIds = new Set(participants.map(p => p._id));
                setSearchResults(results.filter(u => !addedIds.has(u._id)));
                setShowDropdown(true);
            } catch {
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        };
        run();
    }, [debouncedQuery, participants]);

    // ── Close dropdown on outside click ───────────────────────────────────────
    useEffect(() => {
        const handler = (e) => {
            if (
                dropdownRef.current && !dropdownRef.current.contains(e.target) &&
                searchRef.current && !searchRef.current.contains(e.target)
            ) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleAddUser = useCallback((user) => {
        setParticipants(prev => [...prev, user]);
        setSearchQuery('');
        setSearchResults([]);
        setShowDropdown(false);
    }, [setParticipants]);

    const handleRemoveUser = useCallback((userId) => {
        setParticipants(prev => prev.filter(p => p._id !== userId));
    }, [setParticipants]);

    // ── Which groups are restricted (group-gated) ──────────────────────────────
    const isRestrictedGroup = group === 'First Year' || group === 'Second Year';
    const isOpen = group === 'Open';

    return (
        <div className="flex flex-col gap-5">

            {/* ── Group Selector ── */}
            <FieldWrapper label="Select participant group" htmlFor="participant-group">
                <div className="relative">
                    <select
                        id="participant-group"
                        value={group}
                        onChange={(e) => onChangeGroup(e.target.value)}
                        className={clsx(inputCls, 'appearance-none cursor-pointer pr-10')}
                    >
                        <option value="" className="bg-bg-dark text-white">Select a group</option>
                        {GROUPS.map(g => (
                            <option key={g} value={g} className="bg-bg-dark text-white">{g}</option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-muted">
                        <ChevronDown className="w-4 h-4" />
                    </div>
                </div>
            </FieldWrapper>

            {/* ── Group info banner ── */}
            {!group && (
                <div className="py-5 px-4 text-center border border-white/10 rounded-xl bg-bg-light/50 flex flex-col items-center gap-1.5">
                    <Users className="w-5 h-5 text-muted mb-1" />
                    <p className="text-sm text-muted">Select a participant group above to configure eligibility.</p>
                </div>
            )}

            {isRestrictedGroup && (
                <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl border border-sky-500/20 bg-sky-500/5">
                    <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-[13px] font-medium text-sky-300">
                            Restricted to {group} students
                        </p>
                        <p className="text-[11px] text-white/40 mt-0.5 leading-relaxed">
                            Only users whose account is assigned to the <span className="text-white/60 font-medium">{group}</span> group can register. You can manually add extra participants below.
                        </p>
                    </div>
                </div>
            )}

            {isOpen && (
                <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl border border-brand-yellow/20 bg-brand-yellow/5">
                    <Info className="w-4 h-4 text-brand-yellow shrink-0 mt-0.5" />
                    <div>
                        <p className="text-[13px] font-medium text-brand-yellow">Open registration</p>
                        <p className="text-[11px] text-white/40 mt-0.5 leading-relaxed">
                            Any registered user can join this contest. You can still add specific additional participants below.
                        </p>
                    </div>
                </div>
            )}

            {/* ── Notification checkboxes ── */}
            {group && (
                <div className="flex flex-col gap-2.5">
                    <label className="flex items-center gap-2.5 cursor-pointer w-fit group">
                        <input
                            type="checkbox"
                            checked={notifyStart || false}
                            onChange={(e) => onChangeNotifyStart(e.target.checked)}
                            className="w-4 h-4 rounded border-white/20 bg-card-dark text-brand-yellow focus:ring-brand-yellow/50 focus:ring-offset-0 cursor-pointer"
                        />
                        <span className="text-[13px] text-white/70 group-hover:text-white transition-colors select-none">
                            Notify participants 10 minutes before start
                        </span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer w-fit group">
                        <input
                            type="checkbox"
                            checked={notifyResults || false}
                            onChange={(e) => onChangeNotifyResults(e.target.checked)}
                            className="w-4 h-4 rounded border-white/20 bg-card-dark text-brand-yellow focus:ring-brand-yellow/50 focus:ring-offset-0 cursor-pointer"
                        />
                        <span className="text-[13px] text-white/70 group-hover:text-white transition-colors select-none">
                            Notify participants when results are published
                        </span>
                    </label>
                </div>
            )}

            {/* ── Additional Participants section (shown when any group is selected) ── */}
            {group && (
                <div className="flex flex-col gap-3">

                    {/* Section header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <UserPlus className="w-4 h-4 text-muted" />
                            <p className="text-sm font-medium text-white">Additional Participants</p>
                            {participants.length > 0 && (
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-yellow/15 border border-brand-yellow/25 text-[10px] font-bold text-brand-yellow">
                                    {participants.length}
                                </span>
                            )}
                        </div>
                    </div>

                    <p className="text-[11px] text-white/40 -mt-1">
                        {isRestrictedGroup
                            ? `Add users from other groups who should also be eligible and receive notifications.`
                            : `Add specific users who should receive notifications for this contest.`}
                    </p>

                    {/* Search bar */}
                    <div className="relative">
                        <div className="relative" ref={searchRef}>
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                {isSearching
                                    ? <Loader2 className="w-3.5 h-3.5 text-muted animate-spin" />
                                    : <Search className="w-3.5 h-3.5 text-muted" />
                                }
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    if (!e.target.value.trim()) setShowDropdown(false);
                                }}
                                onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                                placeholder="Search by name or email…"
                                className={clsx(inputCls, 'pl-9 pr-4')}
                            />
                        </div>

                        {/* Results dropdown */}
                        {showDropdown && (
                            <div
                                ref={dropdownRef}
                                className="absolute top-full left-0 right-0 mt-1 z-30 bg-card-dark border border-white/10 rounded-xl shadow-xl overflow-hidden"
                            >
                                {searchResults.length === 0 && !isSearching && (
                                    <div className="px-4 py-3 text-[12px] text-muted text-center">
                                        No matching users found
                                    </div>
                                )}
                                {searchResults.map((user) => (
                                    <button
                                        key={user._id}
                                        type="button"
                                        onClick={() => handleAddUser(user)}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left"
                                    >
                                        <UserAvatar name={user.name} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[13px] font-medium text-white truncate">
                                                {user.name}
                                                <GroupBadge group={user.group} />
                                            </p>
                                            <p className="text-[11px] text-muted truncate">{user.email}</p>
                                        </div>
                                        <span className="text-[11px] text-brand-yellow font-medium shrink-0">Add</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Added participants list */}
                    {isLoadingParticipants ? (
                        <div className="flex items-center justify-center py-6">
                            <Loader2 className="w-5 h-5 animate-spin text-muted" />
                        </div>
                    ) : participants.length === 0 ? (
                        <div className="py-6 text-center border border-white/10 rounded-xl bg-bg-light/30">
                            <p className="text-[12px] text-muted">No additional participants yet</p>
                        </div>
                    ) : (
                        <div className="border border-white/10 rounded-xl overflow-hidden">
                            {/* Column headers */}
                            <div className="grid grid-cols-12 gap-3 px-4 py-2.5 bg-bg-light border-b border-white/10 text-[10px] font-semibold tracking-wider uppercase text-muted">
                                <div className="col-span-5">Name</div>
                                <div className="col-span-4">Email</div>
                                <div className="col-span-2">Group</div>
                                <div className="col-span-1" />
                            </div>

                            {participants.map((p) => (
                                <div
                                    key={p._id}
                                    className="grid grid-cols-12 gap-3 px-4 py-2.5 items-center border-b border-white/5 last:border-0 hover:bg-white/[0.02] group"
                                >
                                    <div className="col-span-5 flex items-center gap-2 min-w-0">
                                        <UserAvatar name={p.name} />
                                        <span className="text-[13px] font-medium text-white truncate">{p.name}</span>
                                    </div>
                                    <div className="col-span-4 text-[12px] text-muted truncate">{p.email}</div>
                                    <div className="col-span-2">
                                        {p.group
                                            ? <span className="text-[10px] text-white/40 font-medium">{p.group}</span>
                                            : <span className="text-[10px] text-white/20">—</span>
                                        }
                                    </div>
                                    <div className="col-span-1 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveUser(p._id)}
                                            className="opacity-0 group-hover:opacity-100 p-1 rounded text-red-400 hover:text-red-300 transition-opacity"
                                            title="Remove"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ParticipantsTab;
