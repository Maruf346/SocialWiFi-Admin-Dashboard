import { useState } from "react";
import { useNavigate } from "react-router";
import { Icons } from "../../assets/Images";

const Mfa = () => {
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState("");

  const handleResendCode = () => {
    setToastMessage("Code resent");
    setTimeout(() => setToastMessage(""), 2500);
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center bg-cover bg-center px-4 py-8 text-white"
      style={{ backgroundImage: `url(${Icons.authBg})` }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 rounded bg-[#ff823d] px-5 py-2 text-sm font-semibold text-white shadow-lg transition-all">
          {toastMessage}
        </div>
      )}

      <section className="flex w-full max-w-[390px] flex-col items-center">
        <img
          src={Icons.authMainLogo}
          alt="Right Route"
          className="mb-3 h-auto w-40 object-contain md:w-44"
        />

        <h1 className="mb-3 text-2xl font-normal text-[#ff823d]">
          Verification page
        </h1>
        <p className="mb-4 max-w-[420px] text-center text-sm leading-5 text-white">
          Enter the verification code sent to:
          <br />
          *****is@gmail.com
        </p>

        <form
          className="flex w-full max-w-[280px] flex-col items-center"
          onSubmit={(event) => {
            event.preventDefault();
            navigate("/dashboard");
          }}
        >
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="Enter 6 digit code"
            aria-label="Verification code"
            pattern="[0-9]{6}"
            required
            className="mb-4 h-10 w-full bg-white px-3 text-sm text-gray-700 outline-none placeholder:text-gray-400"
          />
          <button
            type="submit"
            className="mb-3 h-9 w-24 rounded-[6px] bg-[#ff823d] text-xs font-semibold text-white transition-opacity hover:opacity-90 cursor-pointer"
          >
            CONFIRM
          </button>
          <button
            type="button"
            onClick={handleResendCode}
            className="text-xs text-white underline underline-offset-2 hover:text-[#ff823d] cursor-pointer"
          >
            Resend code
          </button>
        </form>
      </section>
    </div>
  );
};

export default Mfa;
