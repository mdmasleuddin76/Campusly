import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Lock, Mail, Phone, Save, ShieldAlert, User } from "lucide-react";
import { toast } from "sonner";
import api, { errorMessage } from "../../api/axios";
import PageHeader from "../../components/PageHeader";
import Avatar from "../../components/Avatar";
import StudentAcademicFields from "../../components/StudentAcademicFields";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Input } from "../../components/ui/Field";
import { useAuth } from "../../context/AuthContext";
import { validatePhone, validateStudentAcademic } from "../../utils/validators";

// Turn the logged-in user into form values (numbers -> strings for the inputs)
const toForm = (user) => {
  const s = user?.student || {};
  const str = (v) => (v === undefined || v === null ? "" : String(v));
  return {
    name: user?.name || "",
    phone: user?.phone || "",
    rollNo: str(s.rollNo),
    department: str(s.department),
    cgpa: str(s.cgpa),
    graduationYear: str(s.graduationYear),
    backlogs: str(s.backlogs),
  };
};

export default function Profile() {
  const { user, endSession } = useAuth();
  const navigate = useNavigate();
  const initial = useMemo(() => toForm(user), [user]);
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Compare trimmed values so stray spaces don't count as a change
  const changed = Object.keys(initial).some((k) => String(form[k]).trim() !== String(initial[k]).trim());

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const e = validateStudentAcademic(form);
    if (!form.name.trim()) e.name = "Enter your full name";
    const phoneError = validatePhone(form.phone.trim());
    if (phoneError) e.phone = phoneError;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!changed) return;
    if (!validate()) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    setConfirmOpen(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await api.put("/student/profile", {
        name: form.name.trim(),
        phone: form.phone.trim(),
        rollNo: form.rollNo.trim(),
        department: form.department,
        cgpa: Number(form.cgpa),
        graduationYear: Number(form.graduationYear),
        backlogs: Number(form.backlogs),
      });

      if (!res.data.changed) {
        toast("Nothing changed");
        setConfirmOpen(false);
        return;
      }

      // The server has set the account to PENDING and cleared the login cookie
      toast.success("Profile updated", { description: "Your account is waiting for TPO approval again.", duration: 6000 });
      endSession();
      navigate("/login", {
        replace: true,
        state: { notice: "Your profile was updated and sent to the TPO. You can log in again once they approve it." },
      });
    } catch (err) {
      toast.error(errorMessage(err));
      setConfirmOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
      <PageHeader
        eyebrow="My profile"
        title="Your"
        accent="details."
        subtitle="Recruiters see these when you apply, and drives use your CGPA and backlogs to check eligibility."
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-8 flex items-start gap-3 rounded-2xl border border-hotpink-200 bg-hotpink-50 px-5 py-4 text-sm text-hotpink-900"
      >
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-hotpink-600" />
        <p>
          <span className="font-semibold">Saving changes sends your account back to the TPO for approval.</span> You'll be
          logged out and can log in again once they approve it.
        </p>
      </motion.div>

      <motion.form
        onSubmit={onSubmit}
        noValidate
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mt-6 rounded-[2rem] bg-cream-50 p-7 shadow-lift sm:p-9"
      >
        <div className="flex items-center gap-4">
          <Avatar name={form.name || user?.name} role="STUDENT" size="lg" />
          <div className="min-w-0">
            <p className="truncate font-display text-2xl font-bold">{form.name || user?.name}</p>
            <p className="flex items-center gap-1.5 truncate text-sm text-forest-500">
              <Mail className="h-4 w-4" /> {user?.email}
              <span className="inline-flex items-center gap-1 rounded-full bg-cream-200 px-2 py-0.5 text-[11px] font-medium text-forest-500">
                <Lock className="h-3 w-3" /> can't be changed
              </span>
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <Input id="name" name="name" label="Full name" icon={User} value={form.name} onChange={onChange} error={errors.name} autoComplete="name" />
          <Input id="phone" name="phone" type="tel" label="Phone (optional)" icon={Phone} placeholder="9876543210" value={form.phone} onChange={onChange} error={errors.phone} autoComplete="tel" />
        </div>

        <div className="mt-8 border-t border-dashed border-cream-400 pt-8">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-hotpink-600">Academic details</p>
          <StudentAcademicFields form={form} onChange={onChange} errors={errors} />
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-cream-300 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-forest-500">{changed ? "You have unsaved changes." : "No changes yet."}</p>
          <div className="flex gap-3">
            {changed && (
              <Button type="button" variant="outline" onClick={() => { setForm(initial); setErrors({}); }}>
                Undo changes
              </Button>
            )}
            <Button type="submit" disabled={!changed}>
              <Save className="h-4 w-4" /> Save changes
            </Button>
          </div>
        </div>
      </motion.form>

      <Modal open={confirmOpen} onClose={() => !saving && setConfirmOpen(false)} title="Send for re-approval?" size="sm">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-hotpink-100 text-hotpink-700">
            <ShieldAlert className="h-5 w-5" />
          </span>
          <p className="text-forest-600">
            Your account will be marked <span className="font-semibold text-forest-800">pending</span> and you'll be logged
            out. You can log in again once the TPO approves your updated details.
          </p>
        </div>
        <div className="mt-7 flex gap-3">
          <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={saving} className="flex-1">
            Not now
          </Button>
          <Button onClick={save} loading={saving} className="flex-1">
            {saving ? "Saving..." : "Save & log out"}
          </Button>
        </div>
      </Modal>
    </section>
  );
}
