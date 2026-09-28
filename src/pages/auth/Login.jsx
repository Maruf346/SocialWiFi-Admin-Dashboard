import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Icons } from "../../assets/Images";
import { authApi } from "../../api/authApi";

const Login = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    try {
      await authApi.requestAdminLogin({ email, password });
      navigate("/otp", { state: { email } });
    } catch (error) {
      setErrorMessage(error.message || "Unable to log in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-cover bg-center px-4 py-8 text-white"
      style={{ backgroundImage: `url(${Icons.authBg})` }}
    >
      <section className="flex w-full max-w-[390px] flex-col items-center">
        <img
          src={Icons.authMainLogo}
          alt="Right Route"
          className="mb-3 h-auto w-40 object-contain md:w-44"
        />

        <h1 className="mb-4 text-2xl font-normal text-[#ff823d]">Login</h1>

        <form className="flex w-full max-w-[245px] flex-col" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            aria-label="Email"
            required
            autoComplete="email"
            className="mb-3 h-10 bg-white px-3 text-sm text-gray-700 outline-none placeholder:text-gray-400"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            aria-label="Password"
            required
            autoComplete="current-password"
            className="mb-3 h-10 bg-white px-3 text-sm text-gray-700 outline-none placeholder:text-gray-400"
          />

          <label className="mb-4 flex items-center gap-2 text-xs text-white">
            <input
              type="checkbox"
              name="remember_me"
              defaultChecked
              className="h-4 w-4 accent-white"
            />
            Remember me
          </label>

          {errorMessage && (
            <p className="mb-3 rounded bg-black/30 px-3 py-2 text-center text-xs text-[#ffb18a]">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mx-auto mb-4 h-9 min-w-20 rounded-[6px] bg-[#ff823d] px-3 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? "WAIT..." : "LOGIN"}
          </button>

          <Link
            to="/forgot-password"
            className="text-center text-xs text-white underline underline-offset-2"
          >
            Forgot Username / Password?
          </Link>
        </form>
      </section>
    </div>
  );
};

export default Login;
