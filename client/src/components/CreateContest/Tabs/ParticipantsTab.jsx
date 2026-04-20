import { ChevronDown, Plus, X } from 'lucide-react';
import clsx from 'clsx';
import FieldWrapper, { inputCls } from '../FieldWrapper';
import { GROUPS } from '../../../hooks/useContestForm';

const ParticipantsTab = ({ 
    group, onChangeGroup, participants, setParticipants, 
    notifyStart, onChangeNotifyStart, notifyResults, onChangeNotifyResults 
}) => {
    return (
        <div className="flex flex-col gap-5">
            <FieldWrapper label="Select specific participant group">
                <div className="relative">
                    <select
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

            <div className="flex flex-col gap-2.5 mb-2">
                <label className="flex items-center gap-2.5 cursor-pointer w-fit group">
                    <input 
                        type="checkbox" 
                        checked={notifyStart || false} 
                        onChange={(e) => onChangeNotifyStart(e.target.checked)}
                        className="w-4 h-4 rounded border-white/20 bg-card-dark text-brand-yellow focus:ring-brand-yellow/50 focus:ring-offset-0 cursor-pointer" 
                    />
                    <span className="text-[13px] text-white/70 group-hover:text-white transition-colors select-none">Notify participants 10 minutes before start</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer w-fit group">
                    <input 
                        type="checkbox" 
                        checked={notifyResults || false} 
                        onChange={(e) => onChangeNotifyResults(e.target.checked)}
                        className="w-4 h-4 rounded border-white/20 bg-card-dark text-brand-yellow focus:ring-brand-yellow/50 focus:ring-offset-0 cursor-pointer" 
                    />
                    <span className="text-[13px] text-white/70 group-hover:text-white transition-colors select-none">Notify participants when results are published</span>
                </label>
            </div>

            {!group && (
                <div className="py-6 text-center border border-white/10 rounded-xl bg-bg-light/50">
                    <p className="text-sm text-muted">Please select a participant group above to manage participants.</p>
                </div>
            )}

            {group === 'Public' && (
                <div className="py-6 text-center border border-white/10 rounded-xl bg-bg-light/50">
                    <p className="text-sm text-brand-yellow font-medium">Contest accepts general registration.</p>
                    <p className="text-xs text-muted mt-1">No specific participants list required.</p>
                </div>
            )}

            {group && group !== 'Public' && (
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between mt-2">
                        <p className="text-sm font-medium text-white">Participant List ({participants.length})</p>
                        <button className="text-[13px] text-brand-yellow hover:opacity-80 font-medium flex items-center gap-1">
                            <Plus className="w-3.5 h-3.5" /> Add participant
                        </button>
                    </div>

                    <div className="border border-white/10 rounded-xl overflow-hidden">
                        <div className="grid grid-cols-12 gap-3 px-4 py-2.5 bg-bg-light border-b border-white/10 text-[11px] font-semibold tracking-wider uppercase text-muted">
                            <div className="col-span-4">Name</div>
                            <div className="col-span-6">Email</div>
                            <div className="col-span-2" />
                        </div>

                        {participants.map((p, i) => (
                            <div key={p.id} className="grid grid-cols-12 gap-3 px-4 py-3 items-center text-sm border-b border-white/10 last:border-0 group">
                                <div className="col-span-4 text-white font-medium truncate">{p.name}</div>
                                <div className="col-span-6 text-muted truncate">{p.email}</div>
                                <div className="col-span-2 flex justify-end">
                                    <button
                                        onClick={() => setParticipants(participants.filter((_, j) => j !== i))}
                                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:opacity-80 p-1 rounded transition-opacity"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {participants.length === 0 && (
                            <div className="py-8 text-center text-sm text-muted">
                                No participants in this group
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParticipantsTab;
