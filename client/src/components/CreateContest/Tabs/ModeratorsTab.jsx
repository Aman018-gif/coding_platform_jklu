import { Plus, X } from 'lucide-react';

const ModeratorsTab = ({ moderators, setModerators }) => (
    <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-white">Contest moderators</p>
            <button className="text-[13px] text-brand-yellow hover:opacity-80 font-medium flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Add moderator
            </button>
        </div>

        <div className="flex flex-col gap-2.5">
            {moderators.map((mod, i) => (
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
                    <div className="flex items-center gap-3">
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-bg-light border border-white/10 text-muted tracking-wide">
                            {mod.role}
                        </span>
                        {mod.role !== 'Owner' && (
                            <button
                                onClick={() => setModerators(moderators.filter((_, j) => j !== i))}
                                className="text-red-400 hover:opacity-70"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default ModeratorsTab;
