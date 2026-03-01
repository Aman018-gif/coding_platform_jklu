export default function Footer() {
    return (
        <footer className="border-t border-white/5 py-6 mt-8 bg-transparent">
            <div className="max-w-[400px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-[10px] font-bold text-white/20 tracking-widest uppercase">
                    CODECAMPUS PLATFORM. ALL RIGHTS RESERVED.
                </div>
                <div className="flex gap-8">
                    {['Documentation'].map(item => (
                        <a
                            key={item}
                            href=""
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
