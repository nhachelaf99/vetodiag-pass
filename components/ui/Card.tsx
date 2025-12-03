import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  title: string;
  description: string;
  children?: ReactNode;
  className?: string;
}

export default function Card({
  title,
  description,
  children,
  className,
}: CardProps) {
  return (
    <div
      className={cn(
        "p-6 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200",
        className
      )}
    >
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      {children}
    </div>
  );
}

