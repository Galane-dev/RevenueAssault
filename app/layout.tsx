'use client';

import { Monda } from "next/font/google";
import Navbar from "./components/navbar/navbar";
import "./globals.css";
import { AuthProvider } from "./providers/authProvider";
import { usePathname } from "next/navigation";

const monda = Monda({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-monda",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Define routes where the public Landing Page Navbar should NOT appear
  const hideNavbarRoutes = ["/auth", "/dashboard"];
  const shouldHideNavbar = hideNavbarRoutes.some((route) => pathname.startsWith(route));
  return (
    <html lang="en">
      <body className={monda.variable} style={{ margin: 0, background: 'black' }}>
        <AuthProvider>
          {!shouldHideNavbar && <Navbar />}
          {children}
        </AuthProvider>
          
      </body>
    </html>
  );
}