import { useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Briefcase, Building2, CircleCheck, Globe, GraduationCap, Hash, Lock, Mail, Phone, User } from "lucide-react";
import { toast } from "sonner";
import AuthShell from "../../components/AuthShell";
import Button, { buttonClass } from "../../components/ui/Button";
import { Input, PasswordInput, Textarea } from "../../components/ui/Field";
import StudentAcademicFields from "../../components/StudentAcademicFields";
import { useAuth } from "../../context/AuthContext";
import api, { errorMessage } from "../../api/axios";
import { EMAIL_REGEX, isUrl, validatePhone, validateStudentAcademic } from "../../utils/validators";

const ROLES = [
  { key: "student", label: "Student", icon: GraduationCap },
  { key: "recruiter", label: "Recruiter", icon: Briefcase },
];

const EMPTY = {
  name: "",
  email: "",
  password: "",
  phone: "",
  // student
  rollNo: "",
  department: "",
  cgpa: "",
  graduationYear: "",
  backlogs: "",
  // recruiter
  companyName: "",
  companyWebsite: "",
  designation: "",
  companyDescription: "",
};

// Same rules as the backend, so most mistakes are caught before sending
const validate = (role, f) => {
  const e = {};
  if (!f.name.trim()) e.name = "Enter your full name";
  if (!f.email) e.email = "Enter your email";
  else if (!EMAIL_REGEX.test(f.email)) e.email = "That doesn't look like an email";
  if (!f.password) e.password = "Choose a password";
  else if (f.password.length < 6) e.password = "At least 6 characters";
  const phoneError = validatePhone(f.phone);
  if (phoneError) e.phone = phoneError;

  if (role === "student") {
    Object.assign(e, validateStudentAcademic(f));
  } else {
    if (!f.companyName.trim()) e.companyName = "Enter your company name";
    if (!f.designation.trim()) e.designation = "Enter your designation";
    if (f.companyWebsite && !isUrl(f.companyWebsite)) e.companyWebsite = "Start with https://";
  }
  return e;
};

export default function Signup() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const role = params.get("role") === "recruiter" ? "recruiter" : "student";
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const switchRole = (key) => {
    setParams({ role: key }, { replace: true });
    setErrors({});
  };

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const found = validate(role, form);
    setErrors(found);
    if (Object.keys(found).length) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    const common = { name: form.name.trim(), email: form.email.trim(), password: form.password, phone: form.phone };
    const body =
      role === "student"
        ? {
            ...common,
            rollNo: form.rollNo.trim(),
            department: form.department,
            cgpa: Number(form.cgpa),
            graduationYear: Number(form.graduationYear),
            backlogs: Number(form.backlogs),
          }
        : {
            ...common,
            companyName: form.companyName.trim(),
            companyWebsite: form.companyWebsite.trim(),
            designation: form.designation.trim(),
            companyDescription: form.companyDescription.trim(),
          };

    setLoading(true);
    try {
      await api.post(`/auth/signup/${role}`, body);
      setDone(true);
      toast.success("Account created! Waiting for TPO approval.");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (done) {
    return (
      <AuthShell title="You're on the" accent="list.">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl bg-cream-50/90 p-9 text-center shadow-lift"
        >
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 12, delay: 0.1 }}
            className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-forest-800 text-cream-100"
          >
            <CircleCheck className="h-10 w-10" />
          </motion.div>
          <h2 className="mt-6 text-3xl font-bold">Request sent to the TPO</h2>
          <p className="mx-auto mt-3 max-w-sm text-forest-500">
            Your {role} account is waiting for approval. Once the TPO approves it, log in with{" "}
            <span className="font-semibold text-forest-800">{form.email}</span>.
          </p>
          <Link to="/login" className={buttonClass("primary", "lg", "mt-8")}>
            Go to login <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Join"
      accent="Campusly."
      subtitle="Create your account. The TPO checks every new account before it goes live."
    >
      {/* Role switch */}
      <div className="relative mb-6 grid grid-cols-2 rounded-2xl border border-cream-300 bg-cream-100 p-1.5">
        {ROLES.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => switchRole(key)}
            className={`relative flex cursor-pointer items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-colors ${
              role === key ? "text-cream-100" : "text-forest-600 hover:text-forest-900"
            }`}
          >
            {role === key && (
              <motion.span
                layoutId="role-pill"
                className="absolute inset-0 rounded-xl bg-forest-800 shadow-soft"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <Icon className="relative h-4 w-4" />
            <span className="relative">I'm a {label.toLowerCase()}</span>
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} noValidate className="rounded-3xl bg-cream-50/90 p-7 shadow-lift backdrop-blur sm:p-9">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input id="name" name="name" label="Full name" icon={User} placeholder="Ananya Sharma" value={form.name} onChange={onChange} error={errors.name} autoComplete="name" />
          </div>
          <Input id="email" name="email" type="email" label="Email" icon={Mail} placeholder="you@college.edu" value={form.email} onChange={onChange} error={errors.email} autoComplete="email" />
          <Input id="phone" name="phone" type="tel" label="Phone (optional)" icon={Phone} placeholder="9876543210" value={form.phone} onChange={onChange} error={errors.phone} autoComplete="tel" />
          <div className="sm:col-span-2">
            <PasswordInput id="password" name="password" label="Password" icon={Lock} placeholder="At least 6 characters" value={form.password} onChange={onChange} error={errors.password} autoComplete="new-password" />
          </div>
        </div>

        {/* Role-specific fields, animated when switching */}
        <AnimatePresence mode="wait">
          <motion.div
            key={role}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="mt-6 border-t border-dashed border-cream-400 pt-6"
          >
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-hotpink-600">
              {role === "student" ? "Academic details" : "Company details"}
            </p>

            {role === "student" ? (
              <StudentAcademicFields form={form} onChange={onChange} errors={errors} />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                <Input id="companyName" name="companyName" label="Company name" icon={Building2} placeholder="Acme Technologies" value={form.companyName} onChange={onChange} error={errors.companyName} />
                <Input id="designation" name="designation" label="Your designation" icon={Hash} placeholder="Talent Acquisition Lead" value={form.designation} onChange={onChange} error={errors.designation} />
                <div className="sm:col-span-2">
                  <Input id="companyWebsite" name="companyWebsite" label="Company website (optional)" icon={Globe} placeholder="https://acme.com" value={form.companyWebsite} onChange={onChange} error={errors.companyWebsite} />
                </div>
                <div className="sm:col-span-2">
                  <Textarea id="companyDescription" name="companyDescription" label="About the company (optional)" placeholder="What you build, team size, where you're based..." value={form.companyDescription} onChange={onChange} />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <Button type="submit" size="lg" loading={loading} className="group mt-8 w-full">
          {loading ? "Creating account..." : `Create ${role} account`}
          {!loading && <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />}
        </Button>

        <p className="mt-5 text-center text-sm text-forest-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-forest-800 underline decoration-hotpink-400 decoration-2 underline-offset-4 hover:text-hotpink-600">
            Log in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
