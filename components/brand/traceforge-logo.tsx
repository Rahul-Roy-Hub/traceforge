import Image from "next/image";
import { cn } from "@/lib/utils";

export function TraceForgeLogo({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <span className={cn("relative inline-flex h-12 items-center", className)}>
      <Image
        src="/brand/logo-black.png"
        alt=""
        width={1330}
        height={340}
        priority={priority}
        className="h-full w-auto dark:hidden"
      />
      <Image
        src="/brand/logo-white.png"
        alt=""
        width={1210}
        height={290}
        priority={priority}
        className="hidden h-full w-auto dark:block"
      />
    </span>
  );
}

export function TraceForgeMark({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/brand/icon-192.png"
      alt="TraceForge"
      width={192}
      height={192}
      priority={priority}
      className={cn("size-8 rounded-lg", className)}
    />
  );
}
