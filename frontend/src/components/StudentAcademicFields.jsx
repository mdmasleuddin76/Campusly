import { BookOpen, CalendarDays, CircleAlert, IdCard, Star } from "lucide-react";
import { Input, Select } from "./ui/Field";
import { DEPARTMENTS } from "../config/site";

// Roll no, department, CGPA, graduation year, backlogs. Used by Signup and the Profile page.
export default function StudentAcademicFields({ form, onChange, errors = {} }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Input id="rollNo" name="rollNo" label="Roll number" icon={IdCard} placeholder="21CS045" value={form.rollNo} onChange={onChange} error={errors.rollNo} />
      <Select id="department" name="department" label="Department" icon={BookOpen} options={DEPARTMENTS} placeholder="Choose" value={form.department} onChange={onChange} error={errors.department} />
      <Input id="cgpa" name="cgpa" type="number" step="0.01" min="0" max="10" label="CGPA" icon={Star} placeholder="8.4" value={form.cgpa} onChange={onChange} error={errors.cgpa} />
      <Input id="graduationYear" name="graduationYear" type="number" label="Graduation year" icon={CalendarDays} placeholder="2026" value={form.graduationYear} onChange={onChange} error={errors.graduationYear} />
      <div className="sm:col-span-2">
        <Input
          id="backlogs"
          name="backlogs"
          type="number"
          step="1"
          min="0"
          label="Active backlogs"
          icon={CircleAlert}
          placeholder="0"
          value={form.backlogs}
          onChange={onChange}
          error={errors.backlogs}
          hint="Subjects you still have to clear. Enter 0 if you have none."
        />
      </div>
    </div>
  );
}
