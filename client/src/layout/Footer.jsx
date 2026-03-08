export default function Footer() {
    return (
        <footer className="border-t border-white/5 py-6 mt-8 bg-transparent">
            <div className="max-w-[1450px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-[10px] font-bold text-white/20 tracking-widest uppercase">
                    CODECAMPUS PLATFORM.
                </div>
                <div className="flex gap-8">
                    {['GITHUB'].map(item => (
                        <a
                            key={item}
                            href="https://github.com/Aman018-gif/coding_platform_jklu"
                            className="text-[10px] font-bold text-white/30 hover:text-brand-yellow uppercase tracking-widest transition-colors"
                        >
                            {item}
                        </a>
                    ))}
                </div>
            </div>
        </footer>
    );
}
