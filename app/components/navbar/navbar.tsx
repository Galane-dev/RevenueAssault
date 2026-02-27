"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStyles } from "./style";

export default function Navbar() {
  const { styles } = useStyles();
  const pathname = usePathname();

  return (
    <nav className={styles.navbar}>
      <Link href="/" className={styles.logo}>
        RevenueAssault
      </Link>
      <div className={styles.navLinks}>
        <Link 
          href="https://github.com/Galane-dev/RevenueAssault" 
          style={{ color: pathname === "/about" ? "white" : "#999" }}
        >
          About
        </Link>
        <Link 
          href="/auth" 
          style={{ color: pathname === "/auth" ? "white" : "#999" }}
        >
          Account
        </Link>
      </div>
    </nav>
  );
}