"use client";

import { PaystackModal } from "@/components/escrow/PaystackModal";
import { useApp } from "@/context/AppContext";
import { formatNaira } from "@/lib/geo";
import type { BookingStatus } from "@/lib/types";
import {
  AlertTriangle,
  CheckCheck,
  CircleCheck,
  Clock,
  CreditCard,
  FileText,
  Hammer,
  Lock,
  ShieldAlert,
  Terminal,
  Trash2,
} from "lucide-react";

const NODES: {
  status: BookingStatus;
  title: string;
  desc: string;
  icon: typeof Clock;
}[] = [
  {
    status: "pending",
    title: "Pending Payment",
    desc: "Booking registered. Awaiting Paystack webhook.",
    icon: Clock,
  },
  {
    status: "paid",
    title: "Escrow Paid & Held",
    desc: "Funds verified and locked in platform escrow.",
    icon: Lock,
  },
  {
    status: "completed",
    title: "Artisan Logged Completion",
    desc: "Client must confirm or dispute within 24h.",
    icon: CheckCheck,
  },
  {
    status: "released",
    title: "Funds Released",
    desc: "90% paid to artisan; 10% platform commission.",
    icon: CircleCheck,
  },
];

function logColor(type: string) {
  if (type === "green-success") return "text-emerald-500";
  if (type === "red-alert") return "text-red-500";
  return "text-sky-500";
}

export function EscrowPanel() {
  const {
    escrow,
    setPaymentAmount,
    forceExploitPrice,
    setPaystackModalOpen,
    advanceEscrowStatus,
    appendAuditLog,
    auditLogs,
    clearAuditLogs,
    resetEscrow,
  } = useApp();

  const { artisan, status } = escrow;
  const statusOrder: BookingStatus[] = [
    "pending",
    "paid",
    "completed",
    "released",
  ];

  const nodeActive = (s: BookingStatus) => {
    const idx = statusOrder.indexOf(status);
    const nodeIdx = statusOrder.indexOf(s);
    if (status === "disputed" && s === "completed") return true;
    return nodeIdx <= idx && status !== "disputed";
  };

  return (
    <div>
      <PaystackModal />
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold">
          Escrow Payment Engine
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Paystack checkout, price validation, and fund release simulator.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass space-y-5 p-6">
          <h3 className="flex items-center gap-2 font-display font-bold">
            <FileText className="h-5 w-5 text-gold" />
            Booking Checkout Summary
          </h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Professional</dt>
              <dd className="font-semibold">
                {artisan.full_name} ({artisan.trade_category[0]})
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Callout Fee</dt>
              <dd>{formatNaira(escrow.calloutFee)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Service Fee</dt>
              <dd>{formatNaira(escrow.serviceFee)}</dd>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 dark:border-white/10">
              <dt className="font-semibold">Total</dt>
              <dd className="text-lg font-bold text-forest">
                {formatNaira(escrow.total)}
              </dd>
            </div>
          </dl>

          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
            <h4 className="flex items-center gap-2 text-sm font-bold">
              <ShieldAlert className="h-4 w-4 text-amber-500" />
              Price Exploitation Tester
            </h4>
            <p className="mt-1 text-xs text-slate-500">
              Simulate a hacked checkout amount vs database price.
            </p>
            <div className="mt-3 flex gap-2">
              <input
                type="number"
                value={escrow.paymentAmount}
                onChange={(e) =>
                  setPaymentAmount(parseFloat(e.target.value) || 0)
                }
                className="flex-1 rounded-xl border px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-800"
              />
              <button
                type="button"
                onClick={forceExploitPrice}
                className="shrink-0 rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-white"
              >
                ₦1 Exploit
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              resetEscrow();
              setPaystackModalOpen(true);
              appendAuditLog("blue", "[PAYSTACK] Checkout initialized.");
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-forest py-3.5 font-semibold text-white hover:bg-forest-light"
          >
            <CreditCard className="h-5 w-5" />
            Pay Securely with Paystack
          </button>
        </div>

        <div className="glass p-6">
          <h3 className="mb-4 font-display font-bold">Escrow State Machine</h3>
          <div className="space-y-3">
            {NODES.map(({ status: s, title, desc, icon: Icon }) => (
              <div
                key={s}
                className={`flex gap-4 rounded-xl border p-4 transition ${
                  nodeActive(s)
                    ? "border-forest/40 bg-forest/5"
                    : "border-transparent opacity-50"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    nodeActive(s) ? "bg-forest text-white" : "bg-slate-200 dark:bg-slate-700"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold">{title}</h4>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
              </div>
            ))}
            {status === "disputed" && (
              <div className="flex gap-4 rounded-xl border border-red-500/40 bg-red-500/5 p-4">
                <AlertTriangle className="h-10 w-10 text-red-500" />
                <div>
                  <h4 className="font-semibold text-red-500">Escrow Locked</h4>
                  <p className="text-xs text-slate-500">
                    Admin dispute panel holds funds.
                  </p>
                </div>
              </div>
            )}
          </div>

          {status === "paid" && (
            <div className="mt-4 space-y-2 border-t pt-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Escrow Actions
              </p>
              <button
                type="button"
                onClick={() => {
                  advanceEscrowStatus("completed");
                  appendAuditLog(
                    "blue",
                    "🛠️ Artisan logged completion. Awaiting client confirm."
                  );
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-forest py-2.5 text-sm font-semibold text-white"
              >
                <Hammer className="h-4 w-4" />
                Log Artisan Complete
              </button>
            </div>
          )}
          {status === "completed" && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  const commission = escrow.total * 0.1;
                  advanceEscrowStatus("released");
                  appendAuditLog("green-success", "🎉 Escrow released to artisan.");
                  appendAuditLog(
                    "green-success",
                    `💸 Payout ₦${(escrow.total - commission).toLocaleString()}; commission ₦${commission.toLocaleString()}`
                  );
                }}
                className="rounded-xl bg-forest py-2.5 text-sm font-semibold text-white"
              >
                Confirm Release
              </button>
              <button
                type="button"
                onClick={() => {
                  advanceEscrowStatus("disputed");
                  appendAuditLog("red-alert", "🚨 DISPUTE OPENED. escrow_status = disputed");
                }}
                className="rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white"
              >
                Open Dispute
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="glass mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-white/10">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Terminal className="h-4 w-4" />
            Webhook & Database Audit Log
          </span>
          <button
            type="button"
            onClick={clearAuditLogs}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
          >
            <Trash2 className="h-3 w-3" />
            Clear
          </button>
        </div>
        <div className="max-h-48 overflow-y-auto bg-slate-950 p-4 font-mono text-xs">
          {auditLogs.map((log) => (
            <div key={log.id} className={`mb-1 ${logColor(log.type)}`}>
              [{log.time}] {log.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
