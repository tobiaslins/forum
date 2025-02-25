"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import { JazzAndAuth } from "./jazz";
import { useState, useEffect } from "react";
import { Header } from "@/components/header";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check system preference on initial load
    if (typeof window !== "undefined") {
      const isDarkMode = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      setDarkMode(isDarkMode);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <html lang="en" className={darkMode ? "dark" : ""}>
      <body
        className={`${inter.className} bg-background text-foreground min-h-screen`}
      >
        <Header isDarkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <JazzAndAuth>
          <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
        </JazzAndAuth>
      </body>
    </html>
  );
}
