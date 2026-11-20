// Form rules shared by Signup and the student Profile page (they match the backend rules).

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isUrl = (v) => {
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

// Roll number, department, CGPA, graduation year and backlogs. Returns { field: message }.
export const validateStudentAcademic = (f) => {
  const e = {};
  if (!String(f.rollNo ?? "").trim()) e.rollNo = "Enter your roll number";
  if (!f.department) e.department = "Pick your department";

  const cgpa = String(f.cgpa ?? "").trim();
  if (cgpa === "") e.cgpa = "Enter your CGPA";
  else if (isNaN(cgpa) || Number(cgpa) < 0 || Number(cgpa) > 10) e.cgpa = "Between 0 and 10";

  const year = String(f.graduationYear ?? "").trim();
  if (!year) e.graduationYear = "Enter your graduation year";
  else if (!/^20\d{2}$/.test(year)) e.graduationYear = "e.g. 2026";

  const backlogs = String(f.backlogs ?? "").trim();
  if (backlogs === "") e.backlogs = "Enter 0 if you have none";
  else if (!/^\d{1,2}$/.test(backlogs)) e.backlogs = "A whole number, like 0, 1 or 2";

  return e;
};

export const validatePhone = (phone) => (phone && !/^\d{10}$/.test(phone) ? "10 digits, no spaces" : "");
