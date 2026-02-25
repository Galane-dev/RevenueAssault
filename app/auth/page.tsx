"use client";

import React from "react";
import Image from "next/image"; // Import the optimized component
import { Input, Button } from "antd";
import { useStyles } from "./style";

export default function LoginPage() {
  const { styles } = useStyles();

  return (
    <div className={styles.loginWrapper}>
      <main className={styles.mainContent}>
        <h1 className={styles.title}>Login to your account</h1>

        <div className={styles.formImageContainer}>
          <div className={styles.formSection}>
            <Input placeholder="Enter username" />
            <Input.Password placeholder="Enter password" />
            
            <Button className={styles.loginBtn} block>
              Log In
            </Button>

            <div className={styles.dividerContainer}>
              <span>or</span>
            </div>

            <a href="#" className={styles.createAccountLink}>
              Create an Account
            </a>
          </div>

          {/* Optimized Next.js Image */}
          <div className={styles.imageWrapper}>
            <Image 
              src="https://firebasestorage.googleapis.com/v0/b/grade-12-life-sciences-st.firebasestorage.app/o/image.png?alt=media&token=3d24f202-be66-480f-81f0-ca06066b2a4d" 
              alt="Partnership Illustration"
              width={550}
              height={600} // Adjusted based on original aspect ratio
              priority // Since this is a main element above the fold
              className={styles.handshakeImage}
            />
          </div>
        </div>
      </main>
    </div>
  );
}