import { useState, useCallback, useMemo, useRef } from 'react';
import {
    X, Plus, Trash2, Upload, Copy, ArrowLeft, Eye, ChevronDown, Bold, Italic, Code, FileCode, Check, AlertTriangle,
} from 'lucide-react';
import clsx from 'clsx';

// ─── constants ────────────────────────────────────────────────────────────────

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const CATEGORIES = ['Arrays', 'Graphs', 'DP', 'Trees', 'Strings', 'Math', 'Greedy', 'Other'];

const JSON_TEMPLATE = JSON.stringify(
    {
        title: '',
        score: 100,
        difficulty: 'easy',
        category: '',
        description: '',
        inputFormat: '',
        outputFormat: '',
        constraints: '',
        testCases: [
            { input: '', output: '', hidden: false },
            { input: '', output: '', hidden: true },
        ],
    },
    null,
    2,
);

const EMPTY_FORM = {
    title: '',
    score: 100,
    difficulty: '',
    category: '',
    description: '',
    inputFormat: '',
    outputFormat: '',
    constraints: '',
};

const inputCls =
    'w-full bg-bg-light border border-white/10 hover:border-white/20 focus:border-brand-yellow/50 rounded-lg px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-muted transition-colors';

// ─── small reusable sub-components ────────────────────────────────────────────

const FieldWrapper = ({ label, children, className }) => (
    <div className={clsx('flex flex-col gap-1.5', className)}>
        <label className="text-[12px] font-medium text-muted tracking-wide">{label}</label>
        {children}
    </div>
);

/** Dropdown wrapped with a ChevronDown icon — replaces duplicated difficulty/category blocks */
const SelectField = ({ label, value, onChange, options, placeholder }) => (
    <FieldWrapper label={label}>
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={clsx(inputCls, 'appearance-none cursor-pointer pr-10')}
            >
                <option value="" className="bg-bg-dark text-muted">{placeholder}</option>
                {options.map((o) => (
                    <option key={o} value={o} className="bg-bg-dark text-white">{o}</option>
                ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-muted">
                <ChevronDown className="w-4 h-4" />
            </div>
        </div>
    </FieldWrapper>
);

const MiniToolbar = ({ textareaRef, onInsert }) => {
    const insertToken = (before, after = before) => {
        const ta = textareaRef.current;
        if (!ta) return;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const selected = ta.value.substring(start, end);
        onInsert(ta.value.substring(0, start) + before + selected + after + ta.value.substring(end));
        requestAnimationFrame(() => {
            ta.focus();
            ta.setSelectionRange(start + before.length, start + before.length + selected.length);
        });
    };

    return (
        <div className="flex items-center gap-1 mt-1">
            {[
                { icon: Bold,     action: () => insertToken('**'),        title: 'Bold' },
                { icon: Italic,   action: () => insertToken('*'),         title: 'Italic' },
                { icon: Code,     action: () => insertToken('`'),         title: 'Inline code' },
                { icon: FileCode, action: () => insertToken('```\n', '\n```'), title: 'Code block' },
            ].map(({ icon: Icon, action, title }) => (
                <button
                    key={title}
                    type="button"
                    onClick={action}
                    title={title}
                    className="p-1.5 rounded hover:bg-white/10 text-muted hover:text-white transition-colors"
                >
                    <Icon className="w-3.5 h-3.5" />
                </button>
            ))}
        </div>
    );
};

const TestCaseSection = ({ label, hint, cases, onChange, onAdd, onRemove }) => (
    <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-[12px] font-medium text-white">{label}</p>
                <p className="text-[11px] text-muted">{hint}</p>
            </div>
            <button
                type="button"
                onClick={onAdd}
                className="text-[12px] text-brand-yellow hover:opacity-80 font-medium flex items-center gap-1"
            >
                <Plus className="w-3 h-3" /> Add
            </button>
        </div>

        <div className="border border-white/10 rounded-xl overflow-hidden">
            <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-bg-light border-b border-white/10 text-[10px] font-semibold tracking-wider uppercase text-muted">
                <div className="col-span-5">Input</div>
                <div className="col-span-5">Expected output</div>
                <div className="col-span-2" />
            </div>
            {cases.map((tc, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 px-4 py-2 items-start border-b border-white/10 last:border-0 group">
                    <textarea
                        value={tc.input}
                        onChange={(e) => onChange(i, 'input', e.target.value)}
                        rows={2}
                        placeholder="Input..."
                        className={clsx(inputCls, 'col-span-5 !py-2 text-xs resize-none')}
                    />
                    <textarea
                        value={tc.output}
                        onChange={(e) => onChange(i, 'output', e.target.value)}
                        rows={2}
                        placeholder="Expected output..."
                        className={clsx(inputCls, 'col-span-5 !py-2 text-xs resize-none')}
                    />
                    <div className="col-span-2 flex justify-center pt-2">
                        <button
                            type="button"
                            onClick={() => onRemove(i)}
                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:opacity-80 p-1 rounded transition-opacity"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            ))}
            {cases.length === 0 && (
                <div className="py-6 text-center text-xs text-muted">No test cases yet</div>
            )}
        </div>
    </div>
);

const PreviewMode = ({ form, sampleCases, onBack }) => (
    <div className="flex flex-col gap-5">
        <button
            type="button"
            onClick={onBack}
            className="text-[13px] text-muted hover:text-white flex items-center gap-1 transition-colors w-fit"
        >
            <ArrowLeft className="w-4 h-4" /> Back to editing
        </button>

        <div className="space-y-1">
            <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white">{form.title || 'Untitled Problem'}</h2>
                {form.score !== '' && (
                    <span className="text-[12px] font-semibold px-2.5 py-0.5 rounded-md bg-brand-yellow/10 border border-brand-yellow/30 text-brand-yellow">
                        {form.score}
                    </span>
                )}
            </div>
            <p className="text-sm text-muted">
                {form.difficulty || '—'}
                {form.category ? ` · ${form.category}` : ''}
            </p>
        </div>

        <hr className="border-white/10" />

        {[
            { key: 'description',  label: null },
            { key: 'inputFormat',  label: 'Input Format' },
            { key: 'outputFormat', label: 'Output Format' },
            { key: 'constraints',  label: 'Constraints' },
        ].map(({ key, label }) =>
            form[key] ? (
                <div key={key}>
                    {label && (
                        <p className="text-[12px] font-semibold text-white uppercase tracking-wide mb-1">{label}</p>
                    )}
                    <p className="whitespace-pre-wrap text-sm text-white leading-relaxed">{form[key]}</p>
                </div>
            ) : null
        )}

        {sampleCases.length > 0 && (
            <div>
                <p className="text-[12px] font-semibold text-white uppercase tracking-wide mb-2">Sample Test Cases</p>
                <div className="border border-white/10 rounded-xl overflow-hidden">
                    <div className="grid grid-cols-2 gap-3 px-4 py-2 bg-bg-light border-b border-white/10 text-[10px] font-semibold tracking-wider uppercase text-muted">
                        <div>Input</div>
                        <div>Output</div>
                    </div>
                    {sampleCases.map((tc, i) => (
                        <div key={i} className="grid grid-cols-2 gap-3 px-4 py-3 border-b border-white/10 last:border-0">
                            <pre className="text-sm text-white font-mono whitespace-pre-wrap">{tc.input}</pre>
                            <pre className="text-sm text-brand-yellow font-mono whitespace-pre-wrap">{tc.output}</pre>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
);

// ─── main component ────────────────────────────────────────────────────────────

const INITIAL_CASES = () => [{ input: '', output: '' }];

const AddProblemPanel = ({ open, onClose, onAdd }) => {
    const [mode, setMode] = useState('details'); // 'details' | 'json'
    const [pendingMode, setPendingMode] = useState(null);
    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [sampleCases, setSampleCases] = useState(INITIAL_CASES);
    const [hiddenCases, setHiddenCases] = useState(INITIAL_CASES);
    const [jsonText, setJsonText] = useState('');
    const [jsonError, setJsonError] = useState(null);
    const [jsonParsed, setJsonParsed] = useState(null);
    const [preview, setPreview] = useState(false);
    const [dirty, setDirty] = useState(false);
    const [showDiscard, setShowDiscard] = useState(false);

    const descRef = useRef(null);
    const jsonFileRef = useRef(null);

    const hasSample = sampleCases.some((tc) => tc.input.trim() || tc.output.trim());
    const hasHidden = hiddenCases.some((tc) => tc.input.trim() || tc.output.trim());

    const isValid = useMemo(() => {
        if (mode === 'json') return jsonParsed !== null && jsonParsed.title;
        return (
            form.title.trim().length > 0 &&
            form.title.length <= 120 &&
            form.score !== '' &&
            Number(form.score) >= 0 &&
            form.difficulty !== '' &&
            form.description.trim().length >= 20 &&
            form.inputFormat.trim().length > 0 &&
            form.outputFormat.trim().length > 0 &&
            hasSample
        );
    }, [mode, form, jsonParsed, hasSample]);

    // ── helpers ──────────────────────────────────────────────────────────────

    const markDirty = useCallback(() => { if (!dirty) setDirty(true); }, [dirty]);

    /** Resets all form state back to initial values. */
    const resetAll = useCallback(() => {
        setForm({ ...EMPTY_FORM });
        setSampleCases(INITIAL_CASES());
        setHiddenCases(INITIAL_CASES());
        setJsonText('');
        setJsonError(null);
        setJsonParsed(null);
        setDirty(false);
        setMode('details');
        setPreview(false);
        setPendingMode(null);
    }, []);

    const updateForm = useCallback(
        (key, value) => { setForm((prev) => ({ ...prev, [key]: value })); markDirty(); },
        [markDirty],
    );

    const updateSampleCase = useCallback(
        (index, key, value) => {
            setSampleCases((prev) => prev.map((tc, i) => (i === index ? { ...tc, [key]: value } : tc)));
            markDirty();
        },
        [markDirty],
    );

    const updateHiddenCase = useCallback(
        (index, key, value) => {
            setHiddenCases((prev) => prev.map((tc, i) => (i === index ? { ...tc, [key]: value } : tc)));
            markDirty();
        },
        [markDirty],
    );

    const addSampleCase   = useCallback(() => { setSampleCases((p) => [...p, { input: '', output: '' }]); markDirty(); }, [markDirty]);
    const addHiddenCase   = useCallback(() => { setHiddenCases((p) => [...p, { input: '', output: '' }]); markDirty(); }, [markDirty]);
    const removeSampleCase = useCallback((i) => { setSampleCases((p) => p.length > 1 ? p.filter((_, idx) => idx !== i) : p); markDirty(); }, [markDirty]);
    const removeHiddenCase = useCallback((i) => { setHiddenCases((p) => p.length > 1 ? p.filter((_, idx) => idx !== i) : p); markDirty(); }, [markDirty]);

    const handleJsonText = useCallback(
        (text) => {
            setJsonText(text);
            markDirty();
            try {
                const parsed = JSON.parse(text);
                setJsonParsed(parsed);
                setJsonError(null);
            } catch (e) {
                setJsonParsed(null);
                const match = e.message.match(/position (\d+)/);
                if (match) {
                    const pos = parseInt(match[1], 10);
                    const line = text.substring(0, pos).split('\n').length;
                    setJsonError(`Invalid JSON — check line ${line}`);
                } else {
                    setJsonError('Invalid JSON — check syntax');
                }
            }
        },
        [markDirty],
    );

    const handleJsonFileUpload = useCallback(
        (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => handleJsonText(ev.target.result);
            reader.readAsText(file);
            e.target.value = '';
        },
        [handleJsonText],
    );

    const copyTemplate = useCallback(() => {
        navigator.clipboard.writeText(JSON_TEMPLATE).catch(() => {});
    }, []);

    const switchMode = useCallback(
        (target) => {
            if (target === mode) return;
            if (dirty) { setPendingMode(target); setShowDiscard(true); return; }
            setMode(target);
        },
        [mode, dirty],
    );

    const requestClose = useCallback(() => {
        if (dirty) { setPendingMode(null); setShowDiscard(true); }
        else onClose();
    }, [dirty, onClose]);

    const confirmDiscard = useCallback(() => {
        const target = pendingMode;
        resetAll();
        setShowDiscard(false);
        if (target !== null) {
            setMode(target);
        } else {
            onClose();
        }
    }, [pendingMode, resetAll, onClose]);

    const handleAdd = useCallback(() => {
        const problem =
            mode === 'json' && jsonParsed
                ? jsonParsed
                : {
                      ...form,
                      score: Number(form.score),
                      testCases: [
                          ...sampleCases.filter((tc) => tc.input.trim() || tc.output.trim()).map((tc) => ({ ...tc, hidden: false })),
                          ...hiddenCases.filter((tc) => tc.input.trim() || tc.output.trim()).map((tc) => ({ ...tc, hidden: true })),
                      ],
                  };
        onAdd(problem);
        resetAll();
        onClose();
    }, [mode, jsonParsed, form, sampleCases, hiddenCases, onAdd, onClose, resetAll]);

    if (!open) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 z-50" onClick={requestClose} />

            {/* Slide-over panel */}
            <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[680px] bg-card-dark border-l border-white/10 shadow-2xl flex flex-col animate-slide-in">

                {/* Header */}
                <div className="shrink-0 px-6 pt-6 pb-4 border-b border-white/10">
                    <div className="flex items-center justify-between mb-1">
                        <h2 className="text-lg font-bold text-white">Add a problem</h2>
                        <button
                            onClick={requestClose}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-muted hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="text-[12px] text-muted">Problem will be saved once the contest is published.</p>
                </div>

                {/* Mode toggle */}
                {!preview && (
                    <div className="shrink-0 px-6 py-3 border-b border-white/10">
                        <div className="inline-flex rounded-lg border border-white/10 overflow-hidden">
                            {[
                                { key: 'details', label: 'Enter Details' },
                                { key: 'json',    label: 'JSON' },
                            ].map((m) => (
                                <button
                                    key={m.key}
                                    onClick={() => switchMode(m.key)}
                                    className={clsx(
                                        'px-4 py-2 text-[13px] font-medium transition-colors',
                                        mode === m.key
                                            ? 'bg-brand-yellow/10 text-brand-yellow'
                                            : 'bg-transparent text-muted hover:text-white',
                                    )}
                                >
                                    {m.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Body — scrollable */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                    {preview ? (
                        <PreviewMode
                            form={form}
                            sampleCases={sampleCases.filter((tc) => tc.input.trim() || tc.output.trim())}
                            onBack={() => setPreview(false)}
                        />
                    ) : mode === 'details' ? (
                        <div className="flex flex-col gap-5">
                            {/* Row 1 — Identity */}
                            <div className="grid grid-cols-12 gap-4">
                                <FieldWrapper label="Title" className="col-span-9">
                                    <input
                                        type="text"
                                        value={form.title}
                                        onChange={(e) => updateForm('title', e.target.value)}
                                        maxLength={120}
                                        placeholder="e.g. Binary Search Tree Traversal"
                                        className={inputCls}
                                    />
                                    <p className="text-[10px] text-muted text-right">{form.title.length}/120</p>
                                </FieldWrapper>
                                <FieldWrapper label="Score" className="col-span-3">
                                    <input
                                        type="number"
                                        value={form.score}
                                        onChange={(e) => updateForm('score', e.target.value)}
                                        min={0}
                                        className={inputCls}
                                    />
                                </FieldWrapper>
                            </div>

                            {/* Row 2 — Classification */}
                            <div className="grid grid-cols-2 gap-4">
                                <SelectField
                                    label="Difficulty"
                                    value={form.difficulty}
                                    onChange={(v) => updateForm('difficulty', v)}
                                    options={DIFFICULTIES}
                                    placeholder="Select difficulty"
                                />
                                <SelectField
                                    label="Category"
                                    value={form.category}
                                    onChange={(v) => updateForm('category', v)}
                                    options={CATEGORIES}
                                    placeholder="Select category"
                                />
                            </div>

                            {/* Description */}
                            <FieldWrapper label="Description">
                                <textarea
                                    ref={descRef}
                                    value={form.description}
                                    onChange={(e) => updateForm('description', e.target.value)}
                                    rows={5}
                                    placeholder="Describe the problem statement clearly. Markdown is supported."
                                    className={clsx(inputCls, 'resize-y min-h-[100px]')}
                                />
                                <MiniToolbar textareaRef={descRef} onInsert={(val) => updateForm('description', val)} />
                                {form.description.length > 0 && form.description.length < 20 && (
                                    <p className="text-[10px] text-red-400">Minimum 20 characters required</p>
                                )}
                            </FieldWrapper>

                            {/* Input / Output / Constraints */}
                            {[
                                { key: 'inputFormat',  label: 'Input Format',  rows: 3, placeholder: 'Describe the structure and meaning of the input.' },
                                { key: 'outputFormat', label: 'Output Format', rows: 3, placeholder: 'Describe what the output should look like.' },
                                { key: 'constraints',  label: 'Constraints',   rows: 2, placeholder: '1 ≤ N ≤ 10⁵, 1 ≤ T ≤ 100' },
                            ].map(({ key, label, rows, placeholder }) => (
                                <FieldWrapper key={key} label={label}>
                                    <textarea
                                        value={form[key]}
                                        onChange={(e) => updateForm(key, e.target.value)}
                                        rows={rows}
                                        placeholder={placeholder}
                                        className={clsx(inputCls, 'resize-y')}
                                    />
                                </FieldWrapper>
                            ))}

                            {/* Test Cases */}
                            <hr className="border-dashed border-white/10" />

                            <TestCaseSection
                                label="Sample test cases"
                                hint="Shown to participants"
                                cases={sampleCases}
                                onChange={updateSampleCase}
                                onAdd={addSampleCase}
                                onRemove={removeSampleCase}
                            />
                            {!hasSample && form.title.length > 0 && (
                                <p className="text-[10px] text-red-400 -mt-3">At least 1 sample test case is required</p>
                            )}

                            <TestCaseSection
                                label="Hidden test cases"
                                hint="Used only for judging"
                                cases={hiddenCases}
                                onChange={updateHiddenCase}
                                onAdd={addHiddenCase}
                                onRemove={removeHiddenCase}
                            />
                            {!hasHidden && (
                                <div className="flex items-center gap-2 text-[11px] text-yellow-500/80 -mt-3">
                                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                    At least 1 hidden test case recommended for judging
                                </div>
                            )}
                        </div>
                    ) : (
                        /* JSON mode */
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={copyTemplate}
                                    className="text-[12px] text-brand-yellow hover:opacity-80 font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg border border-brand-yellow/20 hover:border-brand-yellow/40 transition-colors"
                                >
                                    <Copy className="w-3.5 h-3.5" /> Copy template
                                </button>
                                <button
                                    type="button"
                                    onClick={() => jsonFileRef.current?.click()}
                                    className="text-[12px] text-muted hover:text-white font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
                                >
                                    <Upload className="w-3.5 h-3.5" /> Upload .json file
                                </button>
                                <input ref={jsonFileRef} type="file" accept=".json" onChange={handleJsonFileUpload} className="hidden" />
                            </div>

                            <div
                                className={clsx(
                                    'rounded-xl border-2 overflow-hidden transition-colors',
                                    jsonError   ? 'border-red-500/50'   :
                                    jsonParsed  ? 'border-green-500/50' : 'border-white/10',
                                )}
                            >
                                <textarea
                                    value={jsonText}
                                    onChange={(e) => handleJsonText(e.target.value)}
                                    rows={24}
                                    placeholder={JSON_TEMPLATE}
                                    spellCheck={false}
                                    className="w-full bg-bg-light px-4 py-4 text-sm text-white font-mono outline-none resize-none placeholder:text-muted/40 leading-relaxed"
                                />
                            </div>

                            {jsonError && (
                                <p className="text-[12px] text-red-400 flex items-center gap-1.5">
                                    <X className="w-3.5 h-3.5" /> {jsonError}
                                </p>
                            )}
                            {jsonParsed && !jsonError && (
                                <p className="text-[12px] text-green-400 flex items-center gap-1.5">
                                    <Check className="w-3.5 h-3.5" /> Valid —{' '}
                                    {Array.isArray(jsonParsed.testCases)
                                        ? `${jsonParsed.testCases.length} test case${jsonParsed.testCases.length !== 1 ? 's' : ''} detected`
                                        : 'parsed successfully'}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer — sticky */}
                <div className="shrink-0 px-6 py-4 border-t border-white/10 bg-card-dark flex items-center justify-between">
                    {preview ? (
                        <div />
                    ) : (
                        <button
                            onClick={() => setPreview(true)}
                            className="text-[13px] text-muted hover:text-white flex items-center gap-1.5 transition-colors"
                        >
                            <Eye className="w-4 h-4" /> Preview
                        </button>
                    )}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={requestClose}
                            className="px-4 py-2.5 rounded-lg text-[13px] font-medium border border-white/20 text-white hover:bg-bg-light transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={!isValid}
                            onClick={handleAdd}
                            className={clsx(
                                'px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-1.5 transition-all',
                                isValid
                                    ? 'bg-white text-bg-dark hover:opacity-90'
                                    : 'bg-white/10 text-white/30 cursor-not-allowed',
                            )}
                        >
                            Add problem →
                        </button>
                    </div>
                </div>
            </div>

            {showDiscard && (
                <div
                    className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4"
                    onClick={() => { setShowDiscard(false); setPendingMode(null); }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-card-dark border border-white/20 rounded-2xl p-6 max-w-sm w-full shadow-xl"
                    >
                        <h3 className="text-[15px] font-semibold text-white mb-2">Discard changes?</h3>
                        <p className="text-[13px] text-muted leading-relaxed mb-6">
                            You have unsaved input. Closing this panel will discard all changes.
                        </p>
                        <div className="flex gap-2.5 justify-end">
                            <button
                                onClick={() => { setShowDiscard(false); setPendingMode(null); }}
                                className="px-4 py-2 rounded-lg text-[13px] font-medium border border-white/20 text-white hover:bg-bg-light"
                            >
                                Keep editing
                            </button>
                            <button
                                onClick={confirmDiscard}
                                className="px-4 py-2 rounded-lg text-[13px] font-medium bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20"
                            >
                                Discard
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Slide-in animation */}
            <style>{`
                @keyframes slide-in {
                    from { transform: translateX(100%); }
                    to   { transform: translateX(0); }
                }
                .animate-slide-in { animation: slide-in 0.3s ease-out; }
            `}</style>
        </>
    );
};

export default AddProblemPanel;
