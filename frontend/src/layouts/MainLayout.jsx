import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Header + page + footer. Every normal page goes inside this.
// The big footer shows only on the home page; other pages get a slim one.
export default function MainLayout() {
  const { pathname } = useLocation();
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer compact={pathname !== "/"} />
    </div>
  );
}
