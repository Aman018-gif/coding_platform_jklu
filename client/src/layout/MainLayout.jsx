import Navbar from './Navbar';
import Footer from './Footer';

export default function MainLayout({ children, onBack, showFooter = true, activeNav, onNavClick }) {
    return (
        <div className="min-h-screen flex flex-col bg-bg-dark text-white font-sans selection:bg-accent-yellow/30">
            <Navbar onLogoClick={onBack} activeNav={activeNav} onNavClick={onNavClick} />
            <main className="flex-1 w-full relative">
                {children}
            </main>

            {showFooter && <Footer />}
        </div>
    );
}