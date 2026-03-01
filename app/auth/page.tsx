"use client";

import React, { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { Input, Button, Form, message, Row, Col, Radio, Select, Divider, Alert } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useStyles } from "./style";
import { useAuthActions, useAuthState } from "../providers/authProvider";

type RegScenario = "new" | "join" | "default";
type InviteRole = "SalesRep" | "SalesManager" | "BusinessDevelopmentManager";
type StoredInviteRole = InviteRole | null;

const INVITE_ROLES: InviteRole[] = ["SalesRep", "SalesManager", "BusinessDevelopmentManager"];
const INVITE_TENANT_ID_KEY = "inviteTenantId";
const INVITE_ROLE_KEY = "inviteRole";

const isInviteRole = (role: string | null): role is InviteRole => {
  return !!role && INVITE_ROLES.includes(role as InviteRole);
};

const getStoredInviteRole = (): StoredInviteRole => {
  if (typeof window === "undefined") return null;
  const storedRole = sessionStorage.getItem(INVITE_ROLE_KEY);
  return isInviteRole(storedRole) ? storedRole : null;
};

export default function AuthContent() {
  const { styles } = useStyles();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form] = Form.useForm();

  const tenantIdFromUrl = searchParams.get("tenantId");
  const roleFromUrl = useMemo<InviteRole>(() => {
    const roleParam = searchParams.get("role");
    return isInviteRole(roleParam) ? roleParam : "SalesRep";
  }, [searchParams]);
  const invitedTenantId = tenantIdFromUrl || (typeof window !== "undefined" ? sessionStorage.getItem(INVITE_TENANT_ID_KEY) : null);
  const invitedRole = isInviteRole(searchParams.get("role"))
    ? roleFromUrl
    : getStoredInviteRole() || "SalesRep";

  const requestedView = searchParams.get("view");
  const shouldOpenRegister = requestedView === "register" || !!invitedTenantId;

  const [view, setView] = useState<"login" | "register">(shouldOpenRegister ? "register" : "login");
  // v2.0 Scenarios: new = Scenario A, join = Scenario B, default = Scenario C
  const [regScenario, setRegScenario] = useState<RegScenario>(invitedTenantId ? "join" : "new");
  
  const { login, register } = useAuthActions();
  const { isPending, isError, isAuthenticated } = useAuthState();

  useEffect(() => {
    if (!tenantIdFromUrl || typeof window === "undefined") return;

    sessionStorage.setItem(INVITE_TENANT_ID_KEY, tenantIdFromUrl);
    sessionStorage.setItem(INVITE_ROLE_KEY, roleFromUrl);

    const cleanParams = new URLSearchParams(searchParams.toString());
    cleanParams.delete("tenantId");
    cleanParams.delete("role");
    cleanParams.set("view", "register");

    const cleanQuery = cleanParams.toString();
    router.replace(cleanQuery ? `/auth?${cleanQuery}` : "/auth?view=register");
  }, [tenantIdFromUrl, roleFromUrl, searchParams, router]);

  // 1. Success Redirect
  useEffect(() => {
    if (isAuthenticated) {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(INVITE_TENANT_ID_KEY);
        sessionStorage.removeItem(INVITE_ROLE_KEY);
      }
      message.success(view === "login" ? "Welcome back!" : "Account created successfully!");
      router.push("/dashboard");
    }
  }, [isAuthenticated, router, view]);

  // 2. Failure Feedback
  useEffect(() => {
    if (isError && !isPending) {
      const errorMsg = view === "login" 
        ? "Invalid email or password. Please try again." 
        : "Registration failed. Check your Tenant ID or organization details.";
      
      message.error(errorMsg);
    }
  }, [isError, isPending, view]);

  // 3. Handle Form Submission
  const onFinish = async (values: any) => {
    if (view === "login") {
      await login(values);
    } else {
      // Clean up payload based on scenario to match v2.0 spec
      const payload = { ...values };

      if (invitedTenantId) {
        payload.tenantId = invitedTenantId;
        payload.role = invitedRole;
        delete payload.tenantName;
      } else if (regScenario === "new") {
        delete payload.tenantId;
        delete payload.role; // Admin is assigned by default for new orgs
      } else if (regScenario === "join") {
        delete payload.tenantName;
      } else {
        delete payload.tenantId;
        delete payload.tenantName;
      }
      await register(payload);
    }
  };

  // 4. Handle View Toggle & Reset
  const toggleView = () => {
    const nextView = view === "login" ? "register" : "login";
    setView(nextView);
    form.resetFields();

    if (nextView === "register" && invitedTenantId) {
      setRegScenario("join");
    }
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
              <>
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

                {invitedTenantId ? (
                  <>
                    <Alert
                      type="info"
                      message="You've been invited to join an organisation"
                      style={{ paddingLeft:25, marginBottom: 12, backgroundColor: '#35c5004e', borderColor: '#089903', color: '#28fc11' }}
                    />
                    <Form.Item label={<span style={{ color: '#8c8c8c', fontSize: '12px' }}>ASSIGNED ROLE</span>}>
                      <Input value={invitedRole} disabled />
                    </Form.Item>
                  </>
                ) : (
                  <>
                    <Form.Item label={<span style={{ color: '#8c8c8c', fontSize: '12px' }}>ORGANIZATION SETUP</span>}>
                      <Radio.Group 
                        value={regScenario} 
                        onChange={(e) => {
                            setRegScenario(e.target.value);
                            form.setFieldsValue({ tenantId: undefined, tenantName: undefined });
                        }}
                        style={{ marginBottom: 8 }}
                        disabled={isPending}
                      >
                        <Radio value="new">New Org</Radio>
                        <Radio value="join">Join Existing</Radio>
                        <Radio value="default">Default</Radio>
                      </Radio.Group>
                    </Form.Item>

                    {regScenario === "new" && (
                      <Form.Item 
                        name="tenantName" 
                        rules={[{ required: true, message: "Please enter your company name" }]}
                      >
                        <Input placeholder="Organization / Company Name" disabled={isPending} />
                      </Form.Item>
                    )}

                    {regScenario === "join" && (
                      <Form.Item 
                        name="tenantId" 
                        rules={[{ required: true, message: "Please enter the Tenant ID" }]}
                      >
                        <Input placeholder="Paste Tenant ID (GUID)" disabled={isPending} />
                      </Form.Item>
                    )}

                    {regScenario !== "new" && (
                      <Form.Item name="role" initialValue="SalesRep">
                        <Select disabled={isPending}>
                          <Select.Option value="SalesRep">Sales Rep</Select.Option>
                          <Select.Option value="SalesManager">Sales Manager</Select.Option>
                          <Select.Option value="BusinessDevelopmentManager">BDM</Select.Option>
                        </Select>
                      </Form.Item>
                    )}
                  </>
                )}
                <Divider style={{ margin: '12px 0', borderColor: '#303030' }} />
              </>
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

export default function AuthPage() {
   return (
      <Suspense fallback={<div>Loading...</div>}>
         <AuthContent />
      </Suspense>
   );
}