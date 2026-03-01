import Navbar from './Navbar';
import Footer from './Footer';

export default function MainLayout({ children, onBack, showFooter = true, activeNav, onNavClick, onLogout }) {
    return (
        <div className="bg-background-light dark:bg-bg-dark text-slate-900 dark:text-white min-h-screen flex flex-col font-display">
            <Navbar onLogoClick={onBack} activeNav={activeNav} onNavClick={onNavClick} onLogout={onLogout} />
            <main className="flex-1 flex overflow-hidden w-full">
                {children}
            </main>
            {showFooter && <Footer />}
        </div>
    );
}
