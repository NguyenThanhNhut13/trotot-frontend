import React, { useEffect, useState } from "react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { Outlet } from "react-router-dom";

export default function HomeLayOut() {
  const [headerHeight, setHeaderHeight] = useState(0);

  // Calculate header height after component mounts
  useEffect(() => {
    const header =
      document.querySelector("header") || document.querySelector(".navbar");
    if (header) {
      setHeaderHeight(header.offsetHeight);
    }

    // Update header height on window resize
    const handleResize = () => {
      if (header) {
        setHeaderHeight(header.offsetHeight);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="d-flex flex-column min-vh-100">
      <div className="fixed-top">
        <Header />
      </div>
      <main
        className="container flex-grow-1"
        style={{
          paddingTop: `calc(${headerHeight}px + 1rem)`,
          marginTop: "0",
        }}
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
