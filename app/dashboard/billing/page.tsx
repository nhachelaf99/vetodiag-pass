"use client";

import { useBillingQuery, Payment } from "@/hooks/useBillingQuery";
import SkeletonTable from "@/components/skeletons/SkeletonTable";
import { Download, CreditCard, Wallet, Receipt, AlertCircle, CheckCircle2, Clock } from "lucide-react";

export default function BillingPage() {
  const { data, isLoading } = useBillingQuery();
  const payments = data?.payments || [];
  const totalOutstanding = data?.totalOutstanding || 0;

  return (
    <div className="font-display space-y-8 max-w-7xl mx-auto p-4 md:p-8 min-h-screen">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
             <Wallet className="w-8 h-8 text-primary" />
             Billing & Payments
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
            Manage your invoices and track your payment history.
          </p>
        </div>
        
        {/* Balance Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-black p-8 rounded-3xl border border-gray-800 shadow-2xl min-w-[320px] group">
           <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity group-hover:bg-primary/10" />
           
           <div className="relative z-10">
               <div className="flex items-center justify-between mb-4">
                   <p className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                       <CreditCard className="w-4 h-4" />
                       Outstanding Balance
                   </p>
                   {totalOutstanding > 0 && (
                       <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                   )}
               </div>
               
               {isLoading ? (
                    <div className="h-12 w-48 bg-gray-800 rounded animate-pulse mb-6"></div>
               ) : (
                    <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-5xl font-bold text-white tracking-tighter">
                            ${totalOutstanding.toFixed(2)}
                        </span>
                        <span className="text-gray-500 font-medium">USD</span>
                    </div>
               )}

               <button 
                 disabled={totalOutstanding <= 0 || isLoading}
                 className="w-full bg-white text-black text-sm font-bold py-3.5 px-4 rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
               >
                 Pay Outstanding Balance
               </button>
           </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
               <h2 className="text-xl font-bold text-white flex items-center gap-2">
                   <Receipt className="w-5 h-5 text-gray-400" />
                   Recent Invoices
               </h2>
               <button className="text-sm text-primary hover:text-white transition-colors">
                   View All
               </button>
          </div>

          <div className="bg-[#09090b] rounded-2xl border border-gray-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 bg-white/5">
                    <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Invoice Details</th>
                    <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Date Issued</th>
                    <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {isLoading ? (
                    <tr>
                        <td colSpan={5} className="p-0">
                            <SkeletonTable rows={5} columns={5} />
                        </td>
                    </tr>
                  ) : payments.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                            <div className="flex flex-col items-center gap-2">
                                <Receipt className="w-8 h-8 opacity-20" />
                                <p>No invoices found on record.</p>
                            </div>
                        </td>
                    </tr>
                  ) : (
                    payments.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4">
                            <div className="flex flex-col">
                                <span className="font-bold text-white text-sm">{invoice.description || "Medical Consultation"}</span>
                                <span className="text-xs text-gray-500 font-mono mt-0.5">#{invoice.id.slice(0, 8).toUpperCase()}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400 font-medium">
                            {new Date(invoice.created_at).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                            })}
                        </td>
                        <td className="px-6 py-4">
                            <span className="font-bold text-white text-sm">
                                ${(invoice.total || invoice.amount).toFixed(2)}
                            </span>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={invoice.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all inline-flex items-center gap-2 group-hover:text-primary">
                            <span className="text-xs font-medium hidden md:inline">Invoice</span>
                            <Download className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
    const s = status.toLowerCase();
    
    if (s === 'paid') {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Paid
            </span>
        );
    }
    
    if (s === 'pending' || s === 'billed' || s === 'due') {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Clock className="w-3.5 h-3.5" />
                Pending
            </span>
        );
    }
    
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertCircle className="w-3.5 h-3.5" />
            {status}
        </span>
    );
}
