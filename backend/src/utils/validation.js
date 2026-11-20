// Shared input helpers so signup and profile updates follow exactly the same rules.

// "" / null / undefined / booleans -> NaN, everything else -> Number(value)
export const toNumber = (value) => {
  if (value === "" || value === null || value === undefined || typeof value === "boolean") return NaN;
  return Number(value);
};

// For optional numeric fields: empty -> undefined (meaning "no limit"), otherwise a number (may be NaN)
export const optionalNumber = (value) =>
  value === "" || value === null || value === undefined ? undefined : toNumber(value);

const isText = (v) => (typeof v === "string" || typeof v === "number") && String(v).trim() !== "";

// Validates a student's academic details.
// Returns { error } or { value: { rollNo, department, cgpa, graduationYear, backlogs } }
export const parseStudentFields = ({ rollNo, department, cgpa, graduationYear, backlogs }) => {
  if (!isText(rollNo) || !isText(department)) {
    return { error: "Roll number and department are required" };
  }

  const cgpaNum = toNumber(cgpa);
  if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10) {
    return { error: "CGPA must be between 0 and 10" };
  }

  const yearNum = toNumber(graduationYear);
  if (!Number.isInteger(yearNum) || yearNum < 2000 || yearNum > 2100) {
    return { error: "Graduation year must be a year, e.g. 2026" };
  }

  const backlogsNum = toNumber(backlogs);
  if (!Number.isInteger(backlogsNum) || backlogsNum < 0 || backlogsNum > 99) {
    return { error: "Backlogs must be a whole number (0 if none)" };
  }

  return {
    value: {
      rollNo: String(rollNo).trim().toUpperCase(),
      department: String(department).trim(),
      cgpa: cgpaNum,
      graduationYear: yearNum,
      backlogs: backlogsNum,
    },
  };
};
