import Image from "next/image";
import Link from "next/link";
import {
  LESSON_UPGRADE_BANNER,
  lessonUpgradeHref,
} from "@/lib/aulas/upgrade-cta";

/**
 * F091 — bloco na descrição da aula. Só o caller decide quem vê
 * (`shouldShowLessonUpgradeCta`); este componente não consulta membership.
 */
export function LessonUpgradeCta() {
  const href = lessonUpgradeHref();
  const { desktop, mobile, alt, cta } = LESSON_UPGRADE_BANNER;

  return (
    <Link
      href={href}
      className="mt-8 block overflow-hidden rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      aria-label={cta}
    >
      <Image
        src={desktop.src}
        alt={alt}
        width={desktop.width}
        height={desktop.height}
        className="hidden h-auto w-full md:block"
        unoptimized
      />
      <Image
        src={mobile.src}
        alt={alt}
        width={mobile.width}
        height={mobile.height}
        className="h-auto w-full md:hidden"
        unoptimized
      />
    </Link>
  );
}
