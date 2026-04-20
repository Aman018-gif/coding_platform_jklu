import clsx from 'clsx';
import FieldWrapper, { inputCls } from '../FieldWrapper';

const LandingPageTab = () => (
    <div className="flex flex-col gap-5">
        <FieldWrapper label="Banner image URL">
            <input type="text" placeholder="https://example.com/banner.png" className={inputCls} />
        </FieldWrapper>
        <FieldWrapper label="Description / Rules">
            <textarea
                rows={5}
                placeholder="Enter contest rules, scoring criteria, and other details..."
                className={clsx(inputCls, 'resize-y min-h-[100px]')}
            />
        </FieldWrapper>
        <label className="flex items-center gap-3 cursor-pointer select-none group">
            <div className="relative">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-9 h-5 bg-white/10 border border-white/20 rounded-full peer-checked:bg-brand-yellow/10 peer-checked:border-brand-yellow/30" />
                <div className="absolute top-[3px] left-[3px] w-[14px] h-[14px] bg-white/50 rounded-full peer-checked:translate-x-4 peer-checked:bg-brand-yellow" />
            </div>
            <span className="text-sm text-white">
                Make contest visible on public contests page
            </span>
        </label>
    </div>
);

export default LandingPageTab;
