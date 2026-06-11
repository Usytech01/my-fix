"use client";

import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { formatNaira } from "@/lib/geo";
import { Lock, Shield, X } from "lucide-react";

export function PaystackModal() {
  const {
    paystackModalOpen,
    setPaystackModalOpen,
    escrow,
    processMockPayment,
    appendAuditLog,
  } = useApp();
  const { user } = useAuth();

  if (!paystackModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="bg-[#011b33] px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold italic text-[#00c3f7]">paystack</span>
            <button
              type="button"
              onClick={() => {
                setPaystackModalOpen(false);
                appendAuditLog("blue", "[PAYSTACK] Payment cancelled.");
              }}
              className="rounded-lg p-1 hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-2 text-sm text-slate-300">{user?.email || "chidinma@myfix.ng"}</p>
          <p className="text-3xl font-bold">
            {formatNaira(escrow.paymentAmount)}
          </p>
        </div>
        <div className="space-y-4 p-6">
          <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Shield className="h-4 w-4 text-forest" />
            Secure escrow via card, transfer, or USSD.
          </p>
          <div className="space-y-2 opacity-70">
            <input
              value="5061 2495 2049 2048"
              readOnly
              className="w-full rounded-lg border px-3 py-2 font-mono text-sm dark:border-white/10 dark:bg-slate-800"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                value="12/28"
                readOnly
                className="rounded-lg border px-3 py-2 text-center text-sm dark:border-white/10 dark:bg-slate-800"
              />
              <input
                value="482"
                readOnly
                className="rounded-lg border px-3 py-2 text-center text-sm dark:border-white/10 dark:bg-slate-800"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={processMockPayment}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-forest py-3 font-semibold text-white hover:bg-forest-light"
          >
            <Lock className="h-4 w-4" />
            Authorize Escrow Payment
          </button>
          <button
            type="button"
            onClick={() => setPaystackModalOpen(false)}
            className="w-full text-center text-sm text-slate-500 hover:text-slate-700"
          >
            Cancel Payment
          </button>
        </div>
        <p className="border-t px-6 py-3 text-center text-xs text-slate-500">
          PCI-DSS Level 1 Certified Gateway
        </p>
      </div>
    </div>
  );
}
