"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { markReadAction } from "@/actions/notifications";

/** Clique marca como lida e navega ao post (ou fallback). */
export function NotificationLink({
  notificationId,
  href,
  children,
  className,
}: {
  notificationId: string;
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <Link
      href={href}
      className={className}
      aria-disabled={pending}
      onClick={(e) => {
        e.preventDefault();
        start(async () => {
          try {
            await markReadAction(notificationId);
          } catch {
            /* ainda navega */
          }
          router.push(href);
          router.refresh();
        });
      }}
    >
      {children}
    </Link>
  );
}
