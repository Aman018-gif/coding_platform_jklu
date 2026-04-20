import { useState, useRef, useEffect } from 'react';
import api from '../../../api/client';

const ModeratorsTab = ({ moderators, setModerators }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false); // FIX 1: start as false
    const [isLoading, setIsLoading] = useState(false);
    const [taUsers, setTaUsers] = useState([]);
    const searchRef = useRef(null);

    const owner = moderators.find((m) => m.role === 'Owner');
    const nonOwnerModerators = moderators.filter((m) => m.role !== 'Owner');

    // Fetch all TA users on mount
    useEffect(() => {
        const fetchTaUsers = async () => {
            try {
                const { data } = await api.get('/user/search?role=TA');
                const addedEmails = new Set(moderators.map((m) => m.email));
                const filtered = (data.users || []).filter((u) => !addedEmails.has(u.email));
                setTaUsers(filtered);
                setSearchResults(filtered); // pre-populate for when dropdown opens
            } catch (err) {
                console.error('Failed to fetch TA users:', err);
            }
        };
        fetchTaUsers();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // FIX 2: Single outside-click listener (removed duplicate)
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Search/filter whenever query or moderators list changes
    useEffect(() => {
        const addedEmails = new Set(moderators.map((m) => m.email));

        if (!searchQuery.trim()) {
            setSearchResults(taUsers.filter((u) => !addedEmails.has(u.email)));
            return;
        }

        const searchUsers = async () => {
            setIsLoading(true);
            try {
                const { data } = await api.get(
                    `/user/search?role=TA&query=${encodeURIComponent(searchQuery)}`
                );
                const filtered = (data.users || []).filter((u) => !addedEmails.has(u.email));
                setSearchResults(filtered);
            } catch (err) {
                console.error('Failed to search users:', err);
            } finally {
                setIsLoading(false);
            }
        };

        const debounce = setTimeout(searchUsers, 300);
        return () => clearTimeout(debounce);
    }, [searchQuery, moderators, taUsers]);

    const handleSelectUser = (user) => {
        setModerators([
            ...moderators,
            {
                name: user.name,
                email: user.email,
                role: 'Moderator',
                isCurrentUser: false,
            },
        ]);
        setSearchQuery('');
        setShowDropdown(false);
    };

    const handleRemove = (index) => {
        const emailToRemove = nonOwnerModerators[index].email;
        setModerators(moderators.filter((m) => m.email !== emailToRemove));
    };

    return (
        <div className="flex flex-col gap-4">
            <p className="text-sm font-medium text-white">Contest moderators</p>

            {/* Owner row — always on top, no remove button */}
            {owner && (
                <div className="flex items-center justify-between px-4 py-3 border border-white/10 rounded-xl bg-bg-light">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-bg-light border border-white/10 flex items-center justify-center text-xs font-semibold text-muted">
                            {owner.name.charAt(0)}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white">{owner.name}</p>
                            <p className="text-xs text-muted">{owner.email}</p>
                        </div>
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-bg-light border border-white/10 text-muted tracking-wide">
                        Owner
                    </span>
                </div>
            )}

            {/* Search bar */}
            <div className="relative overflow-visible" ref={searchRef}>
                <div className="flex items-center gap-2 px-3 py-2.5 border border-white/10 rounded-xl bg-bg-light">
                    <svg
                        className="w-4 h-4 text-muted shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setShowDropdown(true);
                        }}
                        onFocus={() => setShowDropdown(true)}
                        placeholder="Search TA users..."
                        className="flex-1 bg-transparent text-sm text-white placeholder:text-muted outline-none"
                    />
                </div>

                {showDropdown && !isLoading && searchResults.length > 0 && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 border border-white/10 rounded-xl bg-card-dark shadow-lg max-h-60 overflow-y-auto">
                        {searchResults.map((user) => (
                        <button
                            key={user._id}
                            onClick={() => handleSelectUser(user)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left"
                        >
                            <div className="w-7 h-7 rounded-full bg-bg-light border border-white/10 flex items-center justify-center text-xs font-semibold text-muted shrink-0">
                                {user.name.charAt(0)}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">{user.name}</p>
                                <p className="text-xs text-muted">{user.email}</p>
                            </div>
                        </button>
                    ))}
            </div>
                )}

            {showDropdown && isLoading && (
                <div className="absolute z-50 top-full left-0f right-0 mt-1 border border-white/10 rounded-xl bg-card-dark shadow-lg px-4 py-3">
                    <p className="text-sm text-muted">Searching...</p>
                </div>
            )}

            {showDropdown && !isLoading && searchResults.length === 0 && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 border border-white/10 rounded-xl bg-card-dark shadow-lg px-4 py-3">
                    <p className="text-sm text-muted">
                        {searchQuery.trim() ? 'No users found' : 'No TAs available'}
                    </p>
                </div>
            )}
        </div>

            {/* Moderators list */ }
    <div className="flex flex-col gap-2.5">
        {nonOwnerModerators.map((mod, i) => (
            <div
                key={i}
                className="flex items-center justify-between px-4 py-3 border border-white/10 rounded-xl bg-bg-light"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-bg-light border border-white/10 flex items-center justify-center text-xs font-semibold text-muted">
                        {mod.name.charAt(0)}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white">{mod.name}</p>
                        <p className="text-xs text-muted">{mod.email}</p>
                    </div>
                </div>
                <button
                    onClick={() => handleRemove(i)}
                    className="text-xs font-medium text-muted hover:text-white transition-colors"
                >
                    Remove
                </button>
            </div>
        ))}
    </div>
        </div >
    );
};

export default ModeratorsTab;