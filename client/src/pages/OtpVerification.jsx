import React, { useContext, useState, useRef } from "react";
import axios from "axios";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Context } from "../main";
import { ArrowLeft } from "lucide-react";

const OtpVerification = () => {
  const { isAuthenticated, setIsAuthenticated, setUser } = useContext(Context);
  const { email } = useParams();
  const navigateTo = useNavigate();

  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const otpInputs = useRef([]);

  const handleOtpChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 4) {
      otpInputs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputs.current[index - 1].focus();
    }
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    const enteredOtp = otp.join("");

    try {
      const res = await axios.post(
        "http://localhost:4000/api/v1/user/otp-verification",
        { email, otp: enteredOtp },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        },
      );
      toast.success(res.data.message);
      setIsAuthenticated(true);
      setUser(res.data.user);
      navigateTo("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to={"/"} />;
  }

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4 font-sans text-white">
      <div className="w-full max-w-md bg-card-bg backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            OTP Verification
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Please enter the 5-digit OTP <br />
            sent to <span className="text-zinc-200 font-medium">{email}</span>
          </p>
        </header>

        <form onSubmit={handleOtpVerification} className="space-y-8">
          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (otpInputs.current[index] = el)}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(e.target.value, index)}
                onKeyDown={(e) => handleOtpKeyDown(e, index)}
                className="w-14 h-14 bg-zinc-900/50 border border-zinc-800 rounded-xl text-center text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-accent-yellow/20 focus:border-accent-yellow transition-all"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || otp.includes("")}
            className="w-full bg-accent-yellow hover:bg-yellow-400 text-black font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-accent-yellow/10 disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          <div className="text-center">
            <p className="text-xs text-zinc-500 mb-6">
              Didn't receive the code?{" "}
              <button
                type="button"
                className="text-accent-yellow hover:underline"
              >
                Resend OTP
              </button>
            </p>

            <button
              type="button"
              onClick={() => navigateTo("/auth")}
              className="text-sm text-zinc-500 hover:text-accent-yellow transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Signup
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OtpVerification;
