import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import type { VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

interface LinkButtonProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof buttonVariants> {
  href: string;
}

export function LinkButton({
  href,
  variant = "default",
  size = "default",
  className,
  children,
  ...props
}: LinkButtonProps) {
  // External links
  if (href.startsWith("http")) {
    return (
      <a
        href={href}
        className={cn(buttonVariants({ variant, size, className }))}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </Link>
  );
}
