"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // Simple redirect to login
    router.replace("/login");
  }, [router]);
  
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <p>Redirigiendo...</p>
    </div>
  );
}
