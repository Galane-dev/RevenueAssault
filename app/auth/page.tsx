"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Input, Button, Form, message, Row, Col } from "antd";
import { useRouter } from "next/navigation";
import { useStyles } from "./style";
import { useAuthActions, useAuthState } from "../providers/authProvider";

export default function AuthPage() {
  const { styles } = useStyles();
  const router = useRouter();
  const [form] = Form.useForm();
  
  const [view, setView] = useState<"login" | "register">("login");
  
  const { login, register } = useAuthActions();
  const { isPending, isError, isAuthenticated } = useAuthState();

  // 1. Success Redirect
  useEffect(() => {
    if (isAuthenticated) {
      message.success(view === "login" ? "Welcome back!" : "Account created successfully!");
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  // 2. Failure Feedback
  useEffect(() => {
  // We check isError, but we also ensure we aren't currently loading 
  // and that the user has actually interacted with the form.
  if (isError && !isPending) {
    const errorMsg = view === "login" 
      ? "Invalid email or password. Please try again." 
      : "Registration failed. This email might already be in use.";
    
    message.error(errorMsg);
  }
}, [isError, isPending]);

  // 3. Handle Form Submission
  const onFinish = async (values: any) => {
    if (view === "login") {
      await login(values);
    } else {
      await register(values);
    }
  };

  // 4. Handle View Toggle & Reset
  const toggleView = () => {
    setView(view === "login" ? "register" : "login");
    form.resetFields(); // Clears inputs and validation messages
  };

  return (
    <div className={styles.loginWrapper}>
      <main className={styles.mainContent}>
        <h1 className={styles.title}>
          {view === "login" ? "Login to your account" : "Create an account"}
        </h1>

        <div className={styles.formImageContainer}>
          <Form
            form={form}
            onFinish={onFinish}
            layout="vertical"
            className={styles.formSection}
            requiredMark={false}
          >
            {view === "register" && (
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item 
                    name="firstName" 
                    rules={[{ required: true, message: "Required" }]}
                  >
                    <Input placeholder="First Name" disabled={isPending} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item 
                    name="lastName" 
                    rules={[{ required: true, message: "Required" }]}
                  >
                    <Input placeholder="Last Name" disabled={isPending} />
                  </Form.Item>
                </Col>
              </Row>
            )}

            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Invalid email address" }
              ]}
            >
              <Input placeholder="Enter email" disabled={isPending} />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please enter your password" },
                { min: 6, message: "Password must be at least 6 characters" }
              ]}
            >
              <Input.Password placeholder="Enter password" disabled={isPending} />
            </Form.Item>
            
            <Form.Item>
              <Button 
                type="primary"
                htmlType="submit"
                className={styles.loginBtn} 
                block
                loading={isPending}
              >
                {view === "login" ? "Log In" : "Create Account"}
              </Button>
            </Form.Item>

            <div className={styles.dividerContainer}>
              <span>or</span>
            </div>

            <div style={{ textAlign: 'center' }}>
              <Button 
                type="link" 
                className={styles.createAccountLink}
                onClick={toggleView}
              >
                {view === "login" ? "Create an Account" : "Back to Login"}
              </Button>
            </div>
          </Form>

          <div className={styles.imageWrapper}>
            <Image 
              src="https://firebasestorage.googleapis.com/v0/b/grade-12-life-sciences-st.firebasestorage.app/o/image.png?alt=media&token=3d24f202-be66-480f-81f0-ca06066b2a4d" 
              alt="Partnership Illustration"
              width={550}
              height={600}
              priority
              className={styles.handshakeImage}
            />
          </div>
        </div>
      </main>
    </div>
  );
}