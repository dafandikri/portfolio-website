import { Outlet } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import Navbar from "./Navbar";
import { getImage } from "../assets";

function Layout() {
  return (
    <div className="windows95-app">
      <div
        className="desktop-background"
        style={{
          backgroundImage: `url(${getImage("background")})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundAttachment: "fixed",
        }}
      >
        <Navbar />
        <div className="container py-2">
          <Outlet />
        </div>
      </div>
      <SpeedInsights />
      <Analytics />
    </div>
  );
}

export default Layout;
