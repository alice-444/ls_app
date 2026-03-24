"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  gradient?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  className?: string;
  children?: ReactNode;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  gradient = "from-blue-500 to-cyan-600",
  buttonText,
  onButtonClick,
  className = "",
  children,
}: Readonly<StatCardProps>) {
  return (
    <Card
      className={`bg-linear-to-br ${gradient} text-white border-0 shadow-lg ${className}`}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {children || (
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">{value}</div>
            {subtitle && <p className="text-xs mb-2">{subtitle}</p>}
            {buttonText && onButtonClick && (
              <Button
                variant="secondary"
                size="sm"
                className="w-full text-xs"
                onClick={onButtonClick}
              >
                {buttonText}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

