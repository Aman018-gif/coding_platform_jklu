import Navbar from './Navbar';
import Footer from './Footer';

export default function MainLayout({ children, onBack, showFooter = true, activeNav, onNavClick }) {
    return (
        <div className="bg-background-light dark:bg-bg-dark text-slate-900 dark:text-white min-h-screen flex flex-col font-display">
            <Navbar onLogoClick={onBack} activeNav={activeNav} onNavClick={onNavClick} />
            
            <main className="flex-1 w-full relative">
                {children}
            </main>
            
            {showFooter && <Footer />}
        </div>
    );
}