import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, CircleAlert, Info, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import AuthShell from "../../components/AuthShell";
import Button from "../../components/ui/Button";
import { Input, PasswordInput } from "../../components/ui/Field";
import { useAuth } from "../../context/AuthContext";
import { errorMessage } from "../../api/axios";
import { homeFor } from "../../config/site";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  // Already logged in -> go home
  if (user) return <Navigate to="/" replace />;

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setServerError("");
  };

  const validate = () => {
    const e = {};
    if (!form.email) e.email = "Enter your email";
    else if (!EMAIL_REGEX.test(form.email)) e.email = "That doesn't look like an email";
    if (!form.password) e.password = "Enter your password";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const loggedIn = await login(form.email.trim(), form.password);
      toast.success(`Welcome back, ${loggedIn.name.split(" ")[0]}!`);
      // Back to the page they tried to open, else to their role's main page
      navigate(location.state?.from || homeFor(loggedIn.role));
    } catch (err) {
      const msg = errorMessage(err);
      setServerError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome"
      accent="back."
      subtitle="Students, recruiters and the TPO all sign in here. You'll see what your role can do."
    >
      <form onSubmit={onSubmit} noValidate className="space-y-5 rounded-3xl bg-cream-50/90 p-7 shadow-lift backdrop-blur sm:p-9">
        {location.state?.notice && !serverError && (
          <div className="flex items-start gap-2 rounded-xl border border-forest-200 bg-forest-50 px-4 py-3 text-sm text-forest-800">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            {location.state.notice}
          </div>
        )}
        <AnimatePresence>
          {serverError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-start gap-2 rounded-xl border border-hotpink-200 bg-hotpink-50 px-4 py-3 text-sm text-hotpink-800"
            >
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              {serverError}
            </motion.div>
          )}
        </AnimatePresence>

        <Input
          id="email"
          name="email"
          type="email"
          label="Email"
          icon={Mail}
          placeholder="you@college.edu"
          autoComplete="email"
          value={form.email}
          onChange={onChange}
          error={errors.email}
        />
        <PasswordInput
          id="password"
          name="password"
          label="Password"
          icon={Lock}
          placeholder="Your password"
          autoComplete="current-password"
          value={form.password}
          onChange={onChange}
          error={errors.password}
        />

        <Button type="submit" size="lg" loading={loading} className="group w-full">
          {loading ? "Signing in..." : "Log in"}
          {!loading && <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />}
        </Button>

        <p className="pt-1 text-center text-sm text-forest-500">
          New here?{" "}
          <Link to="/signup" className="font-semibold text-forest-800 underline decoration-hotpink-400 decoration-2 underline-offset-4 hover:text-hotpink-600">
            Create an account
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
