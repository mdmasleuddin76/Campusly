import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import NotFound from "./pages/NotFound";
import Approvals from "./pages/tpo/Approvals";
import JobDrives from "./pages/tpo/JobDrives";
import Users from "./pages/tpo/Users";
import Announcements from "./pages/tpo/Announcements";
import MyJobs from "./pages/recruiter/MyJobs";
import PostJob from "./pages/recruiter/PostJob";
import JobApplicants from "./pages/recruiter/JobApplicants";
import StudentDashboard from "./pages/student/Dashboard";
import Jobs from "./pages/student/Jobs";
import JobDetails from "./pages/student/JobDetails";
import MyApplications from "./pages/student/MyApplications";
import StudentAnnouncements from "./pages/student/StudentAnnouncements";
import Profile from "./pages/student/Profile";
import { useAuth } from "./context/AuthContext";

function FullPageLoader() {
  return (
    <div className="grid min-h-screen place-items-center">
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-3 w-3 animate-bounce rounded-full bg-hotpink-500"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const { loading } = useAuth();
  if (loading) return <FullPageLoader />; // wait for /auth/me before showing anything

  return (
    <Routes>
      {/* Pages with header + footer */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />

        {/* TPO only */}
        <Route element={<ProtectedRoute roles={["TPO"]} />}>
          <Route path="/tpo/approvals" element={<Approvals />} />
          <Route path="/tpo/jobs" element={<JobDrives />} />
          <Route path="/tpo/users" element={<Users />} />
          <Route path="/tpo/announcements" element={<Announcements />} />
        </Route>

        {/* Recruiter only */}
        <Route element={<ProtectedRoute roles={["RECRUITER"]} />}>
          <Route path="/recruiter/jobs" element={<MyJobs />} />
          <Route path="/recruiter/jobs/new" element={<PostJob />} />
          <Route path="/recruiter/jobs/:id" element={<JobApplicants />} />
        </Route>

        {/* Student only */}
        <Route element={<ProtectedRoute roles={["STUDENT"]} />}>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/jobs" element={<Jobs />} />
          <Route path="/student/jobs/:id" element={<JobDetails />} />
          <Route path="/student/applications" element={<MyApplications />} />
          <Route path="/student/announcements" element={<StudentAnnouncements />} />
          <Route path="/student/profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Full-screen auth pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  );
}
