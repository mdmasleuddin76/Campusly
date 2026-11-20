// Checks a student's academic details against a job's criteria.
// A job limit that isn't set (null/undefined) means "no limit".
// Returns { eligible: boolean, reasons: string[] } - reasons are shown to the student.
const isSet = (v) => v !== undefined && v !== null;

export const checkEligibility = (student = {}, job = {}) => {
  const reasons = [];

  if (isSet(job.minCgpa)) {
    if (!isSet(student.cgpa)) {
      reasons.push("Add your CGPA to your profile");
    } else if (student.cgpa < job.minCgpa) {
      reasons.push(`Needs a CGPA of ${job.minCgpa} or more (yours is ${student.cgpa})`);
    }
  }

  if (isSet(job.maxBacklogs)) {
    if (!isSet(student.backlogs)) {
      reasons.push("Add your number of backlogs to your profile");
    } else if (student.backlogs > job.maxBacklogs) {
      const allowed =
        job.maxBacklogs === 0 ? "no backlogs" : `at most ${job.maxBacklogs} backlog${job.maxBacklogs === 1 ? "" : "s"}`;
      reasons.push(`Allows ${allowed} (you have ${student.backlogs})`);
    }
  }

  return { eligible: reasons.length === 0, reasons };
};
