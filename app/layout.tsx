'use client';

import { Monda } from "next/font/google";
import Navbar from "./components/navbar/navbar";
import "./globals.css";
import { AuthProvider } from "./providers/authProvider";
import { usePathname } from "next/navigation";
import { ConfigProvider, theme } from "antd";

const monda = Monda({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-monda",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Define routes where the public Landing Page Navbar should NOT appear
  const hideNavbarRoutes = ["/dashboard"];
  const shouldHideNavbar = hideNavbarRoutes.some((route) => pathname.startsWith(route));
  return (
    <html lang="en">
      <body className={monda.variable} style={{ margin: 0, background: 'black' }}>
        <ConfigProvider 
          theme={{ 
            algorithm: theme.darkAlgorithm,
            token: {              colorPrimary: "#595959",              colorText: "#ffffff",
              colorTextSecondary: "#a80808",
              colorTextTertiary: "#cbcaca",
              colorTextQuaternary: "#d9d5d5",
            }
          }}
        >
          <AuthProvider>
            {!shouldHideNavbar && <Navbar />}
            {children}
          </AuthProvider>
        </ConfigProvider>
          
      </body>
    </html>
  );
}