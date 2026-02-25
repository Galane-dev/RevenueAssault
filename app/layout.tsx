import { Monda } from "next/font/google";
import Navbar from "./components/navbar/navbar";
import "./globals.css";
import { AuthProvider } from "./providers/authProvider";

const monda = Monda({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-monda",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={monda.variable} style={{ margin: 0, background: 'black' }}>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
          
      </body>
    </html>
  );
}