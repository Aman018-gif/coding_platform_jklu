import { Plus, Trash2 } from 'lucide-react';

const ProblemsTab = ({ problems, setProblems, onOpenPanel, newProblemId }) => (
    <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-white">Selected problems</p>
            <button
                onClick={onOpenPanel}
                className="text-[13px] text-brand-yellow hover:opacity-80 font-medium flex items-center gap-1"
            >
                <Plus className="w-3.5 h-3.5" /> Add problem
            </button>
        </div>

        <div className="border border-white/10 rounded-xl overflow-hidden">
            <div className="grid grid-cols-12 gap-3 px-4 py-2.5 bg-bg-light border-b border-white/10 text-[11px] font-semibold tracking-wider uppercase text-muted">
                <div className="col-span-1">#</div>
                <div className="col-span-7">Problem</div>
                <div className="col-span-2 text-center">Score</div>
                <div className="col-span-2" />
            </div>

            {problems.map((prob, i) => (
                <div
                    key={prob.id}
                    className="grid grid-cols-12 gap-3 px-4 py-3 items-center text-sm border-b border-white/10 last:border-0 group"
                >
                    <div className="col-span-1 font-mono text-xs font-semibold text-muted">
                        {prob.id}
                    </div>
                    <div className="col-span-7 flex items-center gap-2">
                        <span className="text-white">{prob.name}</span>
                        {prob.id === newProblemId && (
                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand-yellow/15 text-brand-yellow border border-brand-yellow/20 animate-pulse">
                                New
                            </span>
                        )}
                    </div>
                    <div className="col-span-2 text-center text-muted font-mono text-xs">
                        {prob.score}
                    </div>
                    <div className="col-span-2 flex justify-end">
                        <button
                            onClick={() => setProblems(problems.filter((_, j) => j !== i))}
                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:opacity-80 p-1 rounded"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            ))}

            {problems.length === 0 && (
                <div className="py-10 text-center text-sm text-muted">
                    No problems added yet. Click on <span className="text-brand-yellow">Add problem</span> to get started.
                </div>
            )}
        </div>
    </div>
);

export default ProblemsTab;
