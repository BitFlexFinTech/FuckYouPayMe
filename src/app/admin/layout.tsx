"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (session?.user && (session.user as any).role !== "admin") {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  if (status === "loading" || !session?.user) return null;

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar role="admin" />
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}