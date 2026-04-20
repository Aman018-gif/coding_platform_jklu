import clsx from 'clsx';

const SectionLabel = ({ number, title }) => (
    <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-muted mb-4 flex items-center gap-2">
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-white/20 text-[10px] font-bold text-muted">
            {number}
        </span>
        {title}
    </p>
);

export default SectionLabel;
