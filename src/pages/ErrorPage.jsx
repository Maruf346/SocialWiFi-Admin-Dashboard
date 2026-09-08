import { ArrowLeft, ArrowUpRight, Home } from "lucide-react";
import { Link, useNavigate } from "react-router";

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f5f2] px-5 py-10 text-[#151d56]">
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(#dcdedb_1px,transparent_1px),linear-gradient(90deg,#dcdedb_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#ff823d] opacity-15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-[#151d56] opacity-10 blur-3xl" />

      <section className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-white/80 bg-white/85 p-7 shadow-[0_24px_70px_rgba(21,29,86,0.14)] backdrop-blur-sm sm:p-10 md:p-14">
        <div className="mb-12 flex items-center justify-between">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-sm font-semibold tracking-wide text-[#151d56]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#151d56] text-white">
              <Home size={17} />
            </span>
            Right Route
          </Link>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#999]">
            System message
          </span>
        </div>

        <div className="grid items-end gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#ff823d]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ff823d]" />
              Error 404
            </p>
            <h1 className="text-5xl font-bold leading-none tracking-tight text-[#151d56] sm:text-7xl">
              Lost your <span className="text-[#ff823d]">route?</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-7 text-[#666]">
              The page you are looking for has moved, no longer exists, or the
              link may be incorrect.
            </p>
          </div>

          <div className="relative flex h-36 w-36 items-center justify-center rounded-full border border-[#ff823d]/30 bg-[#fff4ed] sm:h-44 sm:w-44">
            <div className="absolute h-24 w-24 rounded-full border border-dashed border-[#ff823d]/60 sm:h-32 sm:w-32" />
            <span className="text-4xl font-bold text-[#ff823d] sm:text-5xl">
              404
            </span>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap gap-3 border-t border-[#eee] pt-7">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-[#ff823d] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#e96f2e] focus:outline-none focus:ring-2 focus:ring-[#ff823d] focus:ring-offset-2"
          >
            Go to dashboard
            <ArrowUpRight size={16} />
          </Link>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#d3d3d3] px-4 py-2.5 text-sm font-semibold text-[#555] transition hover:border-[#151d56] hover:text-[#151d56] focus:outline-none focus:ring-2 focus:ring-[#151d56] focus:ring-offset-2"
          >
            <ArrowLeft size={16} />
            Go back
          </button>
        </div>
      </section>
    </main>
  );
};

export default ErrorPage;
