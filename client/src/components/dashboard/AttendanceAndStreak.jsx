export default function AttendanceAndStreak() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Attendance */}
      <div className="bg-card-dark rounded-xl p-6 border border-white/5 flex flex-col items-center shadow-lg">
        <div className="w-full flex justify-between items-center mb-8">
          <h3 className="font-semibold text-sm">Attendance</h3>
          <button className="text-white/40 hover:text-white transition-colors">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </button>
        </div>

        {/* Circle Progress */}
        <div className="relative w-36 h-36 mb-8">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full transform -rotate-90 drop-shadow-[0_0_10px_rgba(230,209,90,0.2)]"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#FFFFFF"
              strokeOpacity="0.05"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e6d15a"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="282.7"
              strokeDashoffset="42.4"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold tracking-tighter">85%</div>
            <div className="text-[9px] text-[#e6d15a] font-bold tracking-widest mt-1">
              TARGET 90%
            </div>
          </div>
        </div>

        <div className="w-full bg-[#121111] border border-white/5 rounded-md p-3 px-4 flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D94] shadow-[0_0_5px_#FF4D94]"></span>
            <span className="text-white/60 text-xs">Penalty: 2 absent days</span>
          </div>
          <span className="text-[#FF4D94] text-xs font-bold drop-shadow-[0_0_2px_#FF4D94]">
            -5%
          </span>
        </div>

        <div className="flex gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D94] shadow-[0_0_5px_#FF4D94]"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
        </div>
      </div>

      {/* Daily Streak */}
      <div className="bg-card-dark rounded-xl p-8 border border-white/5 lg:col-span-2 flex flex-col sm:flex-row items-center gap-10 shadow-lg">
        {/* Glowing Icon */}
        <div className="w-32 h-32 rounded-full bg-[#e6d15a]/10 flex items-center justify-center relative shadow-[0_0_50px_rgba(230,209,90,0.15)] shrink-0">
          <div className="w-24 h-24 bg-[#e6d15a] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(230,209,90,0.6)]">
            <svg
              className="w-10 h-10 text-[#1a1a1a]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="4"></circle>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
              ></path>
            </svg>
          </div>
        </div>

        <div className="flex-1 w-full text-center sm:text-left">
          <h2 className="text-4xl font-bold mb-1">4 Days</h2>
          <div className="text-[#e6d15a] text-[10px] font-bold tracking-widest uppercase mb-8">
            Daily Practice Streak
          </div>

          <div className="flex justify-center sm:justify-start gap-3 sm:gap-5 mb-6">
            {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day, i) => {
              const isComplete = i < 4;
              return (
                <div key={day} className="flex flex-col items-center gap-2">
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider ${
                      isComplete ? "text-white/80" : "text-white/40"
                    }`}
                  >
                    {day}
                  </span>
                  <div
                    className={`w-8 h-8 rounded shrink-0 flex items-center justify-center transition-all ${
                      isComplete
                        ? "bg-[#e6d15a] shadow-[0_0_10px_rgba(230,209,90,0.4)]"
                        : "bg-[#121111] border border-white/5"
                    }`}
                  >
                    {isComplete && (
                      <svg
                        className="w-5 h-5 text-black"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-white/40 text-xs">
            Solve 1 more problem today to maintain your consistency!
          </div>
        </div>
      </div>
    </div>
  );
}

