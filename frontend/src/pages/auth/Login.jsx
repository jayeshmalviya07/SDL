import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login as loginAction } from "../../store/slices/authSlice";
import { login as loginApi } from "../../services/authService";
import loginAvatar from "../../assets/login/loginAvatar.png";

const Login = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!usernameOrEmail.trim() || !password) {
      setError(`Email, Username, or Employee ID and Password are required`);
      return;
    }
    setLoading(true);
    try {
      const data = await loginApi(usernameOrEmail.trim(), password);
      const token = data?.token || data?.accessToken;
      if (!token) {
        throw new Error("Invalid response from server");
      }
      dispatch(loginAction(token));
      const role = (() => {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          return payload.role;
        } catch {
          return null;
        }
      })();
      if (role === "SUPER_ADMIN") navigate("/super");
      else if (role === "HUB_ADMIN") navigate("/hub");
      else if (role === "WISH_MASTER") navigate("/DailyEntry");
      else navigate("/super");
    } catch (err) {
      const data = err.response?.data;
      const msg =
        (typeof data === "object" && (data?.message || data?.error || data?.errorMessage)) ||
        (typeof data === "string" ? data : null) ||
        err.message ||
        "Login failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="
      min-h-screen w-full
      bg-gradient-to-br from-gray-50 via-white to-gray-100
      flex items-center justify-center
      px-5 sm:px-8 md:px-10 lg:px-16
      py-8 md:py-12 lg:py-16
      relative overflow-hidden
    ">
      <div className="
        w-full max-w-6xl mx-auto
        flex flex-col md:flex-row items-center md:items-start
        justify-center md:justify-between
        gap-10 md:gap-14 lg:gap-20
      ">
        {/* Avatar - left side */}
        <div className="
          relative flex justify-center md:justify-end
          w-full md:w-1/2 lg:w-5/12
          mb-10 md:mt-32 lg:mt-40
          md:-mr-8 lg:-mr-12          
          z-10
        ">
          <img
            src={loginAvatar}
            alt="Shree Digambara Logistics Delivery Character"
            className="
              w-72 h-72 sm:w-80 sm:h-80
              md:w-[26rem] md:h-[26rem]
              lg:w-[28rem] lg:h-[28rem]
              xl:w-[30rem] xl:h-[30rem]
              object-contain drop-shadow-2xl
              animate-float
            "
          />
        </div>

        {/* Form + Welcome text - right side */}
        <div className="
          w-full md:w-1/2 lg:w-5/12 max-w-lg
          relative z-20
        ">
          <div className="text-center md:text-left mb-8 md:mb-12">
            <h1 className="
              text-3xl sm:text-4xl md:text-5xl
              font-bold dark:from-gray-900 dark:via-gray-950 dark:to-black
            ">
              Welcome to
            </h1>
            <h2 className="
              text-4xl sm:text-5xl md:text-6xl lg:text-7xl
              font-extrabold mt-1 tracking-tightest
              pb-2 sm:pb-3 md:pb-4
              bg-gradient-to-r from-orange-500 to-amber-600
              bg-clip-text text-transparent
            ">
              Shree Digambara Logistics
            </h2>
          </div>

          <div className="
            bg-grey/95
            backdrop-blur-md
            p-6 sm:p-8 md:p-10
            rounded-3xl
            shadow-2xl
            border border-gray-200/70    
          ">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <p className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-xl">
                  {error}
                </p>
              )}
              <input
                type="text"
                placeholder="Email, Username, or Employee ID"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                className={`
                  w-full px-5 py-4
                  bg-gray-50
                  border border-gray-300
                  rounded-2xl
                  text-gray-900
                  placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-orange-500/70 focus:border-transparent
                  transition-all duration-200
                `}
                disabled={loading}
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`
                  w-full px-5 py-4
                  bg-gray-50
                  border border-gray-300
                  rounded-2xl
                  text-gray-900
                  placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-orange-500/70 focus:border-transparent
                  transition-all duration-200
                `}
                disabled={loading}
              />

              <button
                type="submit"
                disabled={loading}
                className={`
                  w-full
                  bg-gradient-to-r from-orange-500 to-orange-600
                  hover:from-orange-600 hover:to-orange-700
                  text-white font-bold text-lg
                  py-4
                  rounded-2xl
                  shadow-lg hover:shadow-xl
                  transition-all duration-300
                  transform hover:-translate-y-1
                  active:translate-y-0
                  disabled:opacity-70 disabled:cursor-not-allowed
                `}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <div className="text-center mt-6">
              <a
                href="#"
                className="
                  text-orange-600 dark:text-orange-400
                  hover:text-orange-700 dark:hover:text-orange-300
                  text-sm font-medium hover:underline
                "
              >
                Forgot password?
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Optional background blobs */}
      <div className="absolute inset-0 pointer-events-none opacity-25 dark:opacity-15 -z-10">
        <div className="absolute top-10 left-10 w-80 h-80 bg-orange-400/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-400/30 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default Login;
