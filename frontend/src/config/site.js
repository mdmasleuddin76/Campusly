// Change these to your college's details - they show up on the home page, header and footer.
export const SITE = {
  collegeName: "Jamia Millia Islamia,New Delhi",
  cellName: "Training & Placement Cell",
  email: "tpo@college.edu",
};

// Links shown in the header after login, per role.
// (Pages for these are built in the next steps.)
export const NAV_BY_ROLE = {
  STUDENT: [
    { to: "/student/jobs", label: "Jobs" },
    { to: "/student/applications", label: "My applications" },
    { to: "/announcements", label: "Announcements" },
  ],
  RECRUITER: [
    { to: "/recruiter/jobs", label: "My jobs" },
    { to: "/recruiter/jobs/new", label: "Post a job" },
  ],
  TPO: [
    { to: "/tpo/approvals", label: "Approvals" },
    { to: "/tpo/jobs", label: "Job drives" },
    { to: "/tpo/users", label: "Users" },
    { to: "/tpo/announcements", label: "Announcements" },
  ],
};

// Where each role lands after login
export const homeFor = (role) =>
  ({ TPO: "/tpo/approvals", RECRUITER: "/recruiter/jobs", STUDENT: "/" })[role] || "/";

export const ROLE_LABEL = { STUDENT: "Student", RECRUITER: "Recruiter", TPO: "TPO" };

export const DEPARTMENTS = ["CSE", "IT", "ECE", "EEE", "ME", "CE", "Other"];
