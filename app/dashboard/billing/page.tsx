"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Payment {
  id: string;
  created_at: string;
  description?: string;
  amount: number;
  total?: number;
  status: string;
  due_date?: string; // Assuming relevant column exists
  payment_method?: string;
}

export default function BillingPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalOutstanding, setTotalOutstanding] = useState(0);

  useEffect(() => {
    async function fetchBillingData() {
      try {
        setLoading(true);
        // 1. Get current user email
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.email) return;

        // 2. Get Client ID from email
        const { data: clientData, error: clientError } = await supabase
          .from('client')
          .select('id')
          .eq('email', session.user.email)
          .single();
        
        if (clientError || !clientData) {
            console.warn("Client not found for email (billing):", session.user.email);
            setLoading(false);
            return;
        }

        // 3. Get Payments
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select('*')
          .eq('client_id', clientData.id)
          .order('created_at', { ascending: false });

        if (paymentsError) throw paymentsError;

        const fetchedPayments = paymentsData || [];
        setPayments(fetchedPayments);

        // 4. Calculate Outstanding
        const outstanding = fetchedPayments
          .filter(p => p.status === 'pending' || p.status === 'billed' || p.status === 'due')
          .reduce((sum, p) => sum + (p.total || p.amount || 0), 0);
        
        setTotalOutstanding(outstanding);

      } catch (err) {
        console.error("Error loading billing data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchBillingData();
  }, []);

  return (
    <div className="font-display space-y-8 max-w-7xl mx-auto p-8 min-h-screen bg-background-dark">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Billing & Invoices</h1>
          <p className="text-gray-400 mt-2 text-lg">
            Manage your payments and view invoice history.
          </p>
        </div>
        
        <div className="bg-surface-dark p-6 rounded-2xl border border-border-dark text-right min-w-[280px] shadow-lg">
          <p className="text-sm font-medium text-gray-400 mb-1 uppercase tracking-wider">Total Outstanding</p>
          <p className="text-4xl font-bold text-white mb-4">
            ${totalOutstanding.toFixed(2)}
          </p>
          <button 
            disabled={totalOutstanding <= 0}
            className="w-full bg-primary text-black text-sm font-bold py-3 px-4 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">payments</span>
            Pay Now
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-dark rounded-2xl border border-border-dark overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/5 border-b border-border-dark">
              <tr>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Invoice ID</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Description</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark">
              {loading ? (
                <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading invoices...</td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No invoices found.</td>
                </tr>
              ) : (
                payments.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 text-sm font-medium text-white font-mono">{invoice.id.slice(0, 8).toUpperCase()}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                        {new Date(invoice.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                        {invoice.description || "Medical Services"}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-white">
                        ${(invoice.total || invoice.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                        invoice.status === 'paid' 
                            ? 'bg-green-500/20 text-green-400' 
                            : invoice.status === 'pending' || invoice.status === 'billed'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-red-500/20 text-red-400'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button className="text-primary hover:text-white font-medium transition-colors flex items-center gap-1 group-hover:underline">
                        <span className="material-symbols-outlined text-base">download</span>
                        Download
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
  );
}
