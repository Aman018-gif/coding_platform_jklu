import clsx from "clsx";

const FieldWrapper = ({ label, children, className, htmlFor }) => (
  <div className={clsx("flex flex-col gap-1.5", className)}>
    {label && (
      <label 
        htmlFor={htmlFor} 
        className="text-[12px] font-medium text-muted tracking-wide"
      >
        {label}
      </label>
    )}
    {children}
  </div>
);

export const inputCls = "w-full bg-bg-light border border-white/10 hover:border-white/20 focus:border-brand-yellow/50 rounded-lg px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-muted";

export default FieldWrapper;
