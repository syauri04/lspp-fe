"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import React from "react";

export function GoogleAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId="62455913390-00afjjphgofb0jcsv1pl9qe4qlr2b9vq.apps.googleusercontent.com">
      {children}
    </GoogleOAuthProvider>
  );
}
