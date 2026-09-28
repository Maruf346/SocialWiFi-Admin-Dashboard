import { Menu } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { Icons } from "../../assets/Images";
import { authApi } from "../../api/authApi";
import { authStorage } from "../../utils/authStorage";

const Header = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const user = authStorage.getUser();

  const handleLogout = async (event) => {
    event.preventDefault();
    await authApi.logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="flex h-full w-full items-center justify-between bg-gradient-to-b from-[#1B235E] to-[#190F0C] px-4 md:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/30 text-white md:hidden"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>
        <img
          src={Icons.headerLogo}
          alt="Right Route"
          className="w-[185px] py-[10px] object-contain"
        />
      </div>

      <nav className="hidden items-center gap-2 text-xs uppercase text-white md:flex lg:text-sm">
        <span>Welcome, {user?.email || "admin"}.</span>
        <a
          href="https://getrightroute.app"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-[#ff823d]"
        >
          View site
        </a>
        <span>/</span>
        <Link
          to="/"
          onClick={handleLogout}
          className="underline underline-offset-2 hover:text-[#ff823d]"
        >
          Log out
        </Link>
      </nav>
    </div>
  );
};

export default Header;
