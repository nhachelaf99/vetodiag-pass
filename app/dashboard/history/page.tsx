"use client";

import { useState } from "react";
import { useHistoryQuery } from "@/hooks/useHistoryQuery";
import SkeletonHistoryItem from "@/components/skeletons/SkeletonHistoryItem";
import { 
    FileText, 
    Calendar, 
    Syringe, 
    Receipt, 
    Activity, 
    Filter, 
    Clock, 
    Dog, 
    User,
    CheckCircle2
} from "lucide-react";

export default function HistoryPage() {
  const [filterType, setFilterType] = useState("All");
  const { data: historyItems = [], isLoading } = useHistoryQuery();

  const filteredHistory = filterType === "All"
      ? historyItems
      : historyItems.filter((item) => item.type === filterType);

  const filters = ["All", "Medical Record", "Appointment", "Vaccination", "Invoice"];

  const getIcon = (type: string) => {
      switch (type) {
          case 'Medical Record': return FileText;
          case 'Appointment': return Calendar;
          case 'Vaccination': return Syringe;
          case 'Invoice': return Receipt;
          case 'Lab Result': return Activity;
          default: return FileText;
      }
  };

  const getColor = (type: string) => {
      switch (type) {
          case 'Medical Record': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
          case 'Appointment': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
          case 'Vaccination': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
          case 'Invoice': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
          default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
      }
  };

  return (
    <div className="font-display space-y-8 max-w-7xl mx-auto p-4 md:p-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
             <Clock className="w-8 h-8 text-primary" />
             History
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
            View your pet's medical history timeline.
          </p>
        </div>
        
        {/* Filter Scroll Container */}
        <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
             <div className="flex gap-2 p-1 bg-gray-900/50 rounded-xl border border-gray-800 backdrop-blur-sm min-w-max">
                {filters.map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilterType(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                        filterType === f
                            ? "bg-gray-800 text-white shadow-sm ring-1 ring-white/10"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                    >
                        {f === 'All' && <Filter className="w-3.5 h-3.5" />}
                        {f}
                    </button>
                ))}
             </div>
        </div>
      </div>

      {/* History Timeline */}
      <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 md:before:ml-[2.25rem] before:-translate-x-px md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-800 before:to-transparent">
        {isLoading ? (
          <>
            <SkeletonHistoryItem />
            <SkeletonHistoryItem />
            <SkeletonHistoryItem />
          </>
        ) : filteredHistory.length > 0 ? (
          filteredHistory.map((item, index) => {
            const Icon = getIcon(item.type);
            const colorClass = getColor(item.type);
            
            return (
              <div key={item.id} className="relative flex items-start gap-4 md:gap-8 group">
                 {/* Timeline Node */}
                 <div className={`absolute left-0 md:left-4 mt-6 w-10 md:w-10 h-10 md:h-10 rounded-xl border-4 border-[#09090b] shadow-sm z-10 flex items-center justify-center transition-transform group-hover:scale-110 ${colorClass.split(" ")[1]}`}>
                    <Icon className={`w-5 h-5 ${colorClass.split(" ")[0]}`} />
                 </div>

                 <div className="flex-1 ml-14 md:ml-20">
                     <div className={`p-1 rounded-2xl bg-gradient-to-b from-white/5 to-transparent p-[1px]`}>
                        <div className="bg-[#09090b] rounded-[15px] p-5 sm:p-6 relative overflow-hidden group-hover:bg-[#101012] transition-colors">
                            
                            {/* Header Row */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                <div className="flex items-center gap-3">
                                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${colorClass}`}>
                                        {item.type}
                                    </span>
                                    <span className="text-xs font-mono text-gray-500">
                                        {new Date(item.date).toLocaleDateString(undefined, { 
                                            year: 'numeric', month: 'short', day: 'numeric',
                                            hour: 'numeric', minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Content */}
                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-primary transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    {item.description}
                                </p>
                            </div>

                            {/* Footer Tags */}
                            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-800/50">
                                {item.petName && (
                                    <div className="flex items-center gap-2 text-xs font-medium text-gray-400 bg-gray-800/30 px-2 py-1 rounded-md">
                                        <Dog className="w-3.5 h-3.5" />
                                        {item.petName}
                                    </div>
                                )}
                                {item.doctorName && (
                                    <div className="flex items-center gap-2 text-xs font-medium text-gray-400 bg-gray-800/30 px-2 py-1 rounded-md">
                                        <User className="w-3.5 h-3.5" />
                                        {item.doctorName}
                                    </div>
                                )}
                            </div>

                        </div>
                     </div>
                 </div>
              </div>
            );
          })
        ) : (
          <div className="ml-14 md:ml-20 py-20 bg-[#09090b] rounded-2xl border border-gray-800 border-dashed text-center">
            <Clock className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">No history found for this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
