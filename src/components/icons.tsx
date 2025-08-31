import type { SVGProps } from "react";

export function TesseraLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 3h18v18H3z" fill="hsl(var(--primary))" stroke="none" />
      <path d="M9 9h6v6H9z" fill="hsl(var(--background))" stroke="none" />
      <path d="M3 9h6V3" stroke="hsl(var(--background))" />
      <path d="M21 9h-6V3" stroke="hsl(var(--background))" />
      <path d="M3 15h6v6" stroke="hsl(var(--background))" />
      <path d="M21 15h-6v6" stroke="hsl(var(--background))" />
    </svg>
  );
}
