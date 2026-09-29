import { useState } from "react";
import { useNavigate } from "react-router";
import { authApi } from "../../api/authApi";
import { Icons } from "../../assets/Images";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();

    try {
      setLoading(true);
      setErrorMessage("");
      await authApi.requestPasswordReset(email);
      navigate("/verify-otp", { state: { email } });
    } catch (error) {
      setErrorMessage(error.message || "Unable to send verification code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cover bg-center px-4 py-8 text-white" style={{ backgroundImage: `url(${Icons.authBg})` }}>
      <section className="flex w-full max-w-[390px] flex-col items-center">
        <img src={Icons.authMainLogo} alt="Right Route" className="mb-3 h-auto w-40 object-contain md:w-44" />
        <h1 className="mb-4 text-2xl font-normal text-[#ff823d]">Forgot Password</h1>
        <form className="flex w-full max-w-[245px] flex-col" onSubmit={handleSubmit}>
          <input type="email" name="email" placeholder="Email" aria-label="Email" required className="mb-4 h-10 bg-white px-3 text-sm text-gray-700 outline-none placeholder:text-gray-400" />
          {errorMessage && <p className="mb-3 text-center text-xs text-[#ff823d]">{errorMessage}</p>}
          <button type="submit" disabled={loading} className="mx-auto h-9 w-20 rounded-[6px] bg-[#ff823d] text-xs font-semibold text-white transition-opacity hover:opacity-90 cursor-pointer disabled:opacity-60">
            {loading ? "SENDING" : "SUBMIT"}
          </button>
        </form>
      </section>
    </div>
  );
};

export default ForgotPassword;
