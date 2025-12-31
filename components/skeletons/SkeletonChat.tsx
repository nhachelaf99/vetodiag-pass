export default function SkeletonChat() {
  return (
    <div className="flex-1 p-6 space-y-6 animate-pulse w-full">
      {/* Received message */}
      <div className="flex flex-col items-start w-full">
         <div className="flex items-end gap-3 max-w-[80%] flex-row">
            <div className="shrink-0 size-8 rounded-full bg-gray-800"></div>
            <div className="p-3 rounded-2xl bg-gray-800/50 rounded-bl-none w-48 h-12"></div>
         </div>
      </div>

      {/* Sent message */}
      <div className="flex flex-col items-end w-full">
         <div className="flex items-end gap-3 max-w-[80%] flex-row-reverse">
             <div className="w-8"></div>
             <div className="p-3 rounded-2xl bg-gray-700/30 rounded-br-none w-64 h-16"></div>
         </div>
      </div>

      {/* Received message */}
      <div className="flex flex-col items-start w-full">
         <div className="flex items-end gap-3 max-w-[80%] flex-row">
            <div className="shrink-0 size-8 rounded-full bg-gray-800"></div>
            <div className="p-3 rounded-2xl bg-gray-800/50 rounded-bl-none w-56 h-20"></div>
         </div>
      </div>
      
       {/* Sent message */}
      <div className="flex flex-col items-end w-full">
         <div className="flex items-end gap-3 max-w-[80%] flex-row-reverse">
             <div className="w-8"></div>
             <div className="p-3 rounded-2xl bg-gray-700/30 rounded-br-none w-32 h-10"></div>
         </div>
      </div>
    </div>
  );
}
