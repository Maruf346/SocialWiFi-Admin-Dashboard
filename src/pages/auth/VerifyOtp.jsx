import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { authApi } from "../../api/authApi";
import { Icons } from "../../assets/Images";
import { authStorage } from "../../utils/authStorage";

const maskEmail = (email) => {
  if (!email || !email.includes("@")) return "your email";
  const [name, domain] = email.split("@");
  return `${name.slice(0, 2)}***@${domain}`;
};

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || authStorage.getPendingEmail() || "";
  const [toastMessage, setToastMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 2500);
  };

  const handleResendCode = async () => {
    if (!email) {
      setErrorMessage("Please request a code again.");
      return;
    }

    try {
      await authApi.resendResetOtp(email);
      showToast("Code resent");
    } catch (error) {
      setErrorMessage(error.message || "Unable to resend code.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const otpCode = String(formData.get("otp_code") || "").trim();

    if (!email) {
      setErrorMessage("Please request a code again.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      await authApi.verifyResetOtp({ otpCode });
      navigate("/reset-password", { state: { email, otpCode } });
    } catch (error) {
      setErrorMessage(error.message || "Unable to verify code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-cover bg-center px-4 py-8 text-white" style={{ backgroundImage: `url(${Icons.authBg})` }}>
      {toastMessage && <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 rounded bg-[#ff823d] px-5 py-2 text-sm font-semibold text-white shadow-lg transition-all">{toastMessage}</div>}
      <section className="flex w-full max-w-[390px] flex-col items-center">
        <img src={Icons.authMainLogo} alt="Right Route" className="mb-3 h-auto w-40 object-contain md:w-44" />
        <h1 className="mb-3 text-2xl font-normal text-[#ff823d]">Verification page</h1>
        <p className="mb-4 max-w-[420px] text-center text-sm leading-5 text-white">Enter the verification code sent to:<br />{maskEmail(email)}</p>
        <form className="flex w-full max-w-[280px] flex-col items-center" onSubmit={handleSubmit}>
          <input type="text" name="otp_code" inputMode="numeric" maxLength={6} placeholder="Enter 6 digit code" aria-label="Verification code" pattern="[0-9]{6}" required className="mb-4 h-10 w-full bg-white px-3 text-sm text-gray-700 outline-none placeholder:text-gray-400" />
          {errorMessage && <p className="mb-3 text-center text-xs text-[#ff823d]">{errorMessage}</p>}
          <button type="submit" disabled={loading} className="mb-3 h-9 w-24 rounded-[6px] bg-[#ff823d] text-xs font-semibold text-white transition-opacity hover:opacity-90 cursor-pointer disabled:opacity-60">{loading ? "VERIFYING" : "CONFIRM"}</button>
          <button type="button" onClick={handleResendCode} className="text-xs text-white underline underline-offset-2 hover:text-[#ff823d] cursor-pointer">Resend code</button>
        </form>
      </section>
    </div>
  );
};

export default VerifyOtp;

