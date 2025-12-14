"use client";

import { useState } from "react";

// Mock data for invoices
const invoices = [
  {
    id: "INV-2023-001",
    date: "Oct 27, 2023",
    description: "Wellness Exam - Rocky",
    amount: 150.00,
    status: "Paid",
    dueDate: "Oct 27, 2023",
  },
  {
    id: "INV-2023-002",
    date: "Nov 5, 2023",
    description: "X-Ray Services - Milo",
    amount: 350.00,
    status: "Pending",
    dueDate: "Nov 19, 2023",
  },
  {
    id: "INV-2023-003",
    date: "Nov 15, 2023",
    description: "Vaccination Package - Daisy",
    amount: 85.00,
    status: "Paid",
    dueDate: "Nov 15, 2023",
  },
];

export default function BillingPage() {
  return (
    <div className="font-inter space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white">Billing & Invoices</h1>
          <p className="text-gray-400 mt-2">
            Manage your payments and view invoice history.
          </p>
        </div>
        <div className="bg-card-dark p-4 rounded-lg border border-border-dark text-right">
          <p className="text-sm text-gray-400 mb-1">Total Outstanding</p>
          <p className="text-2xl font-bold text-white">$350.00</p>
          <button className="mt-3 w-full bg-primary text-white text-sm font-bold py-2 px-4 rounded hover:bg-green-500 transition-colors">
            Pay Now
          </button>
        </div>
      </div>

      <div className="bg-surface-dark rounded-lg border border-border-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-border-dark">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Invoice ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-white">{invoice.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{invoice.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{invoice.description}</td>
                  <td className="px-6 py-4 text-sm font-medium text-white">${invoice.amount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      invoice.status === 'Paid' ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400'
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button className="text-primary hover:text-green-400 font-medium  transition-colors">Download</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
