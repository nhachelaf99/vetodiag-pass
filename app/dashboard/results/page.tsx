"use client";

import { useState } from "react";
import { useResultsQuery } from "@/hooks/useResultsQuery";
import SkeletonResultItem from "@/components/skeletons/SkeletonResultItem";

export default function ResultsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: results = [], isLoading } = useResultsQuery();

  const filteredResults = results.filter((result) =>
    result.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.pet.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="font-inter space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Test Results</h1>
        <p className="text-gray-400 mt-2">
          View and download your pet's laboratory and imaging results.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="material-icons text-gray-500">search</span>
        </span>
        <input
          type="text"
          placeholder="Search results by test name or pet..."
          className="w-full bg-card-dark border border-border-dark rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {isLoading ? (
          <>
            <SkeletonResultItem />
            <SkeletonResultItem />
            <SkeletonResultItem />
          </>
        ) : filteredResults.length > 0 ? (
          filteredResults.map((result) => (
            <div
              key={result.id}
              className="bg-card-dark p-6 rounded-lg border border-border-dark hover:border-gray-600 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-6">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  result.type === 'Blood Work' ? 'bg-red-500/10 text-red-500' :
                  result.type === 'Imaging' ? 'bg-blue-500/10 text-blue-500' :
                  'bg-green-500/10 text-green-500'
                }`}>
                  <span className="material-icons">
                    {result.type === 'Blood Work' ? 'bloodtype' :
                     result.type === 'Imaging' ? 'image' : 'science'}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {result.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                    <span className="flex items-center gap-1">
                      <span className="material-icons text-base">pets</span>
                      {result.pet}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-icons text-base">calendar_today</span>
                      {result.date}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      result.status === 'Normal' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {result.status}
                    </span>
                  </div>
                </div>
              </div>
              <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Download Result">
                <span className="material-icons">download</span>
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-card-dark rounded-lg border border-border-dark border-dashed">
            <span className="material-icons text-4xl text-gray-600 mb-2">
              assignment_late
            </span>
            <p className="text-gray-400">No results found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
