"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ADMIN_TOKEN_KEY, getStoredToken } from "@/lib/client-auth";

export function useAdminToken(redirectTo = "/admin") {
  const router = useRouter();
  const [token, setToken] = useState(() => getStoredToken(ADMIN_TOKEN_KEY));

  useEffect(() => {
    if (!token) {
      router.replace(redirectTo);
    }
  }, [token, redirectTo, router]);

  return token;
}
