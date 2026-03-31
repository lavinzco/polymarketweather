import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-md border border-border bg-muted px-3 text-sm text-foreground outline-none ring-teal-500/40 placeholder:text-muted-foreground focus:ring-2",
        className
      )}
      {...props}
    />
  );
}
