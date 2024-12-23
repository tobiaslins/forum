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
        <div className="container mx-auto p-4">
          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? (
                <Sun className="h-[1.2rem] w-[1.2rem]" />
              ) : (
                <Moon className="h-[1.2rem] w-[1.2rem]" />
              )}
            </Button>
          </div>
          <JazzAndAuth>{children}</JazzAndAuth>
        </div>
      </body>
    </html>
  );
}
