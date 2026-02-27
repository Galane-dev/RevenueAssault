"use client";

import { ComponentType, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useAuthState } from "@/app/providers/authProvider";

export const withAuth = <P extends object>(
  Component: ComponentType<P>
): ComponentType<P> => {
  return function AuthWrapper(props: P) {
    const router = useRouter();
    const { isAuthenticated, isPending } = useAuthState();

    useEffect(() => {
      // If not pending and not authenticated, redirect to auth page
      if (!isPending && !isAuthenticated) {
        router.push("/auth");
      }
    }, [isAuthenticated, isPending, router]);

    // Show loading spinner while checking authentication
    if (isPending) {
      return (
        <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: "#fff" }} spin />} />
        </div>
      );
    }

    // If not authenticated, don't render component (redirect will happen)
    if (!isAuthenticated) {
      return null;
    }

    // Render the protected component
    return <Component {...props} />;
  };
};
