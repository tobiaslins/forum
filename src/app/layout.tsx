"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import { JazzAndAuth } from "./jazz";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <html lang="en" className={darkMode ? "dark" : ""}>
      <body
        className={`${inter.className} bg-background text-foreground min-h-screen`}
      >
        <div className="container mx-auto py-4">
          <div className="relative z-10">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
              className="absolute right-0 top-0"
            >
              {darkMode ? (
                <Sun className="h-[1rem] w-[1rem]" />
              ) : (
                <Moon className="h-[1rem] w-[1rem]" />
              )}
            </Button>
          </div>
          <JazzAndAuth>{children}</JazzAndAuth>
        </div>
      </body>
    </html>
  );
}
