import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { authApi } from "../../api/authApi";
import { Icons } from "../../assets/Images";
import { authStorage } from "../../utils/authStorage";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || authStorage.getPendingEmail() || "";
  const otpCode = location.state?.otpCode || sessionStorage.getItem("rightroute_admin_reset_otp") || "";
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const newPassword = String(formData.get("new-password") || "");
    const confirmPassword = String(formData.get("confirm-password") || "");

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (!email || !otpCode) {
      setPasswordError("Please verify your code again.");
      return;
    }

    try {
      setLoading(true);
      setPasswordError("");
      await authApi.resetPassword({ email, otpCode, newPassword, confirmPassword });
      sessionStorage.removeItem("rightroute_admin_reset_otp");
      navigate("/");
    } catch (error) {
      setPasswordError(error.message || "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cover bg-center px-4 py-8 text-white" style={{ backgroundImage: `url(${Icons.authBg})` }}>
      <section className="flex w-full max-w-[390px] flex-col items-center">
        <img src={Icons.authMainLogo} alt="Right Route" className="mb-3 h-auto w-40 object-contain md:w-44" />
        <h1 className="mb-4 text-2xl font-normal text-[#ff823d]">Reset Password</h1>
        <form className="flex w-full max-w-[245px] flex-col" onSubmit={handleSubmit}>
          <input type="password" name="new-password" placeholder="New Password" aria-label="New Password" required className="mb-3 h-10 bg-white px-3 text-sm text-gray-700 outline-none placeholder:text-gray-400" />
          <input type="password" name="confirm-password" placeholder="Confirm New Password" aria-label="Confirm New Password" required className="mb-2 h-10 bg-white px-3 text-sm text-gray-700 outline-none placeholder:text-gray-400" />
          {passwordError && <p className="mb-3 text-center text-xs text-[#ff823d]">{passwordError}</p>}
          <button type="submit" disabled={loading} className="mx-auto mt-2 h-9 w-28 rounded-[6px] bg-[#ff823d] text-xs font-semibold text-white transition-opacity hover:opacity-90 cursor-pointer disabled:opacity-60">
            {loading ? "RESETTING" : "RESET PASSWORD"}
          </button>
        </form>
      </section>
    </div>
  );
};

export default ResetPassword;
