export default function QuestionsSolvedAndNotes() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Chart Section */}
      <div className="bg-card-dark rounded-xl p-6 border border-white/5 lg:col-span-2 flex flex-col h-80 shadow-lg">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="font-semibold text-sm mb-1">Questions Solved</h3>
            <p className="text-white/40 text-[10px]">
              Daily performance for the current week
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#e6d15a] rounded-full shadow-[0_0_5px_#e6d15a]"></div>
            <span className="text-white/60 text-[10px] font-medium tracking-wide">
              Correct
            </span>
          </div>
        </div>

        {/* Mock Chart Area */}
        <div className="flex-1 relative mt-2 w-full">
          <div className="absolute inset-0 flex flex-col justify-between pb-6">
            <div className="border-b border-white/5 w-full"></div>
            <div className="border-b border-white/5 w-full"></div>
            <div className="border-b border-white/5 w-full"></div>
            <div className="border-b border-white/5 w-full"></div>
          </div>
          <div className="absolute bottom-0 left-0 w-full flex justify-between text-[10px] text-white/20 px-8 font-semibold">
            <span>MON</span>
            <span>TUE</span>
            <span>WED</span>
            <span>THU</span>
            <span>FRI</span>
            <span>SAT</span>
            <span>SUN</span>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="bg-card-dark rounded-xl p-6 border border-white/5 flex flex-col items-center justify-center text-center shadow-lg">
        <div className="w-full flex justify-between items-center mb-auto self-start">
          <h3 className="font-semibold text-sm">My Notes</h3>
          <button className="w-6 h-6 bg-white/5 hover:bg-white/10 rounded flex items-center justify-center text-white/60 hover:text-white transition-colors pb-0.5 font-bold">
            +
          </button>
        </div>

        <div className="w-16 h-16 rounded-full bg-[#121111] border border-white/5 flex items-center justify-center mb-4 mt-6">
          <svg
            className="w-6 h-6 text-white/20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            ></path>
          </svg>
        </div>
        <h4 className="font-semibold text-sm mb-1">Nothing Here</h4>
        <p className="text-white/40 text-[10px] leading-relaxed mb-4 max-w-[200px]">
          Start documenting your algorithm logic or contest strategies!
        </p>
        <a
          href="#"
          className="text-[#e6d15a] text-[11px] font-semibold underline decoration-[#e6d15a]/30 hover:decoration-[#e6d15a] underline-offset-4 transition-all pb-6"
        >
          Create first note
        </a>
      </div>
    </div>
  );
}

