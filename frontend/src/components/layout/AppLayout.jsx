import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

function AppLayout() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, #0f172a, #020617 55%)",
        color: "#e5e7eb",
        fontFamily:
          "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <Navbar />

      <main
        style={{
          padding: "32px 28px",
          maxWidth: "1120px",
          margin: "0 auto",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;