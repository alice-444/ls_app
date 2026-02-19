"use client";

import { CheckCircle2, Hourglass, XCircle } from "lucide-react";

export function StatusBadge({ status }: { readonly status: string }) {
  switch (status) {
    case "ACCEPTED":
      return (
        <div className="bg-[rgba(52,177,98,0.08)] border border-[#34b162] rounded-[32px] px-4 py-2 flex items-center gap-2">
          <span className="text-[12px] font-semibold text-[#34b162]">
            Acceptée
          </span>
          <CheckCircle2 className="h-[18px] w-[18px] text-[#34b162]" />
        </div>
      );
    case "PENDING":
      return (
        <div className="bg-[rgba(94,94,94,0.08)] border border-[#5e5e5e] rounded-[32px] px-4 py-2 flex items-center gap-2">
          <span className="text-[12px] font-semibold text-[#5e5e5e]">
            En attente
          </span>
          <Hourglass className="h-[18px] w-[18px] text-[#5e5e5e]" />
        </div>
      );
    case "REJECTED":
      return (
        <div className="bg-[rgba(244,67,54,0.08)] border border-[#f44336] rounded-[32px] px-4 py-2 flex items-center gap-2">
          <span className="text-[12px] font-semibold text-[#f44336]">
            Refusée
          </span>
          <XCircle className="h-[18px] w-[18px] text-[#f44336]" />
        </div>
      );
    default:
      return null;
  }
}

