import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MotionConfig } from "motion/react";
import { Toaster } from "sonner";
import { CircleAlert, CircleCheck, Info } from "lucide-react";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        {/* reducedMotion="user" respects the OS "reduce motion" setting */}
        <MotionConfig reducedMotion="user">
          <App />
        </MotionConfig>
        <Toaster
          position="top-center"
          offset={20}
          icons={{
            success: <CircleCheck className="h-5 w-5 text-forest-600" />,
            error: <CircleAlert className="h-5 w-5 text-hotpink-600" />,
            info: <Info className="h-5 w-5 text-forest-600" />,
          }}
          toastOptions={{
            style: {
              background: "#fdfaf3",
              color: "#1e3b2f",
              border: "1px solid #eadbbb",
              borderRadius: "16px",
              boxShadow: "0 12px 32px -8px rgb(30 59 47 / 0.22)",
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
            },
            actionButtonStyle: {
              background: "#1e3b2f",
              color: "#faf4e8",
              borderRadius: "999px",
              fontWeight: 600,
              padding: "0 12px",
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
