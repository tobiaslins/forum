import "./globals.css";
import { Geist } from "next/font/google";
import { JazzAndAuth } from "./jazz";
import { Header } from "@/components/header";
import { cookies } from "next/headers";
import { Suspense } from "react";

const geist = Geist({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("theme")?.value;
  const isDark = themeCookie ? themeCookie === "dark" : false;

  // Inline script runs before hydration to reconcile user preference
  const themeInit = `
    (function() {
      try {
        function getCookie(n){try{return document.cookie.split('; ').find(r=>r.startsWith(n+'='))?.split('=')[1]}catch(e){return null}}
        var cookie = getCookie('theme');
        var stored = localStorage.getItem('theme');
        var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        var src = cookie || stored;
        var shouldDark = src ? src === 'dark' : prefersDark;
        var c = document.documentElement.classList;
        if (shouldDark) c.add('dark'); else c.remove('dark');
      } catch (_) {}
    })();
  `;

  return (
    <html lang="en" className={isDark ? "dark" : ""}>
      <head>
        <meta name="color-scheme" content="light dark" />
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body
        className={`${geist.className} bg-background text-foreground min-h-screen`}
      >
        <JazzAndAuth>
          <Header />
          <Suspense fallback={<div>Loading...</div>}>
            <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
          </Suspense>
        </JazzAndAuth>
      </body>
    </html>
  );
}
