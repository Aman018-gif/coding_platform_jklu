import { useState, useEffect, useContext } from 'react';
import { Terminal, Bell, ChevronDown, User, Settings, LogOut, Trophy } from 'lucide-react';
import { Context } from '../main';
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from 'axios';
import { toast } from 'react-toastify';

const navLinks = [
    { to: "/challenges", label: "Challenges" },
    { to: "/practice", label: "Practice" },
    { to: "/contests", label: "Contests" },
];

export default function Navbar({ onLogoClick, onNavClick }) {
    const { user, setUser, setIsAuthenticated } = useContext(Context);
    const navigate = useNavigate();
    const location = useLocation();
    const [currentDate, setCurrentDate] = useState('');
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    // Update date dynamically
    useEffect(() => {
        const updateDate = () => {
            const now = new Date();
            const options = {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            };
            setCurrentDate(now.toLocaleDateString('en-US', options));
        };

        updateDate();
        const interval = setInterval(updateDate, 60000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.profile-dropdown')) {
                setIsProfileOpen(false);
            }
            if (!e.target.closest('.notifications-dropdown')) {
                setIsNotificationsOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleNotificationClick = () => {
        setIsNotificationsOpen(!isNotificationsOpen);
    };

    const handleProfileClick = () => {
        setIsProfileOpen(!isProfileOpen);
    };

    const isActive = (to) => {
        return to === "/dashboard"
            ? location.pathname === "/" || location.pathname === "/dashboard"
            : location.pathname.startsWith(to);
    };

    const handleLogout = async () => {
        try {
            const res = await axios.get("http://localhost:4000/api/v1/user/logout", {
                withCredentials: true,
            });
            toast.success(res.data.message);
            setUser(null);
            setIsAuthenticated(false);
            navigate("/auth");
        } catch (err) {
            toast.error(err.response?.data?.message || "Logout failed");
            console.error(err);
        }
    };

    const notifications = [
        { id: 1, text: 'New contest starting in 1 hour', time: '5 min ago', unread: true },
        { id: 2, text: 'You solved "Array Sum" problem', time: '2 hours ago', unread: true },
        { id: 3, text: 'Weekly leaderboard updated', time: '1 day ago', unread: false },
    ];

    return (
        <header className="h-16 border-b border-slate-200 dark:border-white/10 bg-background-light dark:bg-bg-dark sticky top-0 z-50 w-full">
            <div className="w-full mx-auto px-6 h-full flex items-center justify-between">
                {/* Left Section: Logo & Navigation */}
                <div className="flex items-center gap-8">
                    {/* Logo & Name */}
                    <Link
                        to="/dashboard"
                        onClick={onLogoClick}
                        className="flex items-center gap-3 group cursor-pointer hover:opacity-80 transition-opacity"
                    >
                        <div className="w-10 h-10 bg-brand-yellow rounded-lg flex items-center justify-center text-black group-hover:scale-105 transition-transform">
                            <Terminal size={20} strokeWidth={2.5} />
                        </div>
                        <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white uppercase font-display">
                            CodeCampus
                        </span>
                    </Link>

                    {/* Navigation Links */}
                    <nav className="hidden md:flex items-center gap-6">
                        {navLinks.map(({ to, label }) => (
                            <Link
                                key={to}
                                to={to}
                                onClick={() => onNavClick && onNavClick(label)}
                                className={`text-sm font-medium transition-colors pb-1 ${isActive(to)
                                    ? 'text-brand-yellow border-b-2 border-brand-yellow'
                                    : 'text-slate-500 dark:text-white/50 hover:text-brand-yellow'
                                    }`}
                            >
                                {label}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Right Section: Notifications, Date, Profile */}
                <div className="flex items-center gap-4">
                    {/* Notifications */}
                    <div className="notifications-dropdown relative">
                        <button
                            onClick={handleNotificationClick}
                            className="p-2 text-slate-500 dark:text-white/50 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors relative"
                        >
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-yellow rounded-full border-2 border-background-light dark:border-bg-dark"></span>
                        </button>

                        {/* Notifications Dropdown */}
                        {isNotificationsOpen && (
                            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-white/10 py-2 z-50">
                                <div className="px-4 py-2 border-b border-slate-200 dark:border-white/10">
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</h3>
                                </div>
                                {notifications.map((notif) => (
                                    <button
                                        key={notif.id}
                                        className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-start gap-3"
                                    >
                                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${notif.unread ? 'bg-brand-yellow' : 'bg-slate-300 dark:bg-white/20'}`}></div>
                                        <div className="flex-1">
                                            <p className="text-sm text-slate-700 dark:text-white/80">{notif.text}</p>
                                            <p className="text-xs text-slate-400 mt-1">{notif.time}</p>
                                        </div>
                                    </button>
                                ))}
                                <div className="px-4 py-2 border-t border-slate-200 dark:border-white/10">
                                    <button className="text-xs text-brand-yellow hover:underline">View all notifications</button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Current Date */}
                    <span className="hidden lg:block text-sm text-slate-500 dark:text-white/50 px-3 py-1">
                        {currentDate}
                    </span>

                    {/* Profile Photo with Dropdown */}
                    <div className="profile-dropdown relative">
                        <button
                            onClick={handleProfileClick}
                            className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full pl-1 pr-3 py-1 transition-colors"
                        >
                            <div className="w-9 h-9 rounded-full bg-cover bg-center border-2 border-transparent hover:border-brand-yellow transition-colors overflow-hidden">
                                <img
                                    src="https://picsum.photos/seed/user123/100/100"
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                />
                            </div>
                            <ChevronDown
                                size={16}
                                className={`text-slate-500 dark:text-white/50 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}
                            />
                        </button>

                        {/* Profile Dropdown */}
                        {isProfileOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-white/10 py-2 z-50">
                                <div className="px-4 py-3 border-b border-slate-200 dark:border-white/10">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name || 'Guest'}</p>
                                    <p className="text-xs text-brand-yellow font-mono uppercase tracking-wider mt-0.5">Pro Rank #42</p>
                                </div>
                                <Link
                                    to="/profile"
                                    className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-white/80 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center gap-3"
                                >
                                    <User size={16} />
                                    Profile
                                </Link>
                                <Link
                                    to="/leaderboard"
                                    className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-white/80 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center gap-3"
                                >
                                    <Trophy size={16} />
                                    Leaderboard
                                </Link>
                                <Link
                                    to="/settings"
                                    className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-white/80 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center gap-3"
                                >
                                    <Settings size={16} />
                                    Settings
                                </Link>
                                <div className="border-t border-slate-200 dark:border-white/10 mt-2 pt-2">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-3"
                                    >
                                        <LogOut size={16} />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
