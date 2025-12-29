"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Send, User as UserIcon, MessageSquare, Plus } from "lucide-react";

interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  avatar_url?: string;
  role?: string;
  full_name?: string; 
}

interface Conversation {
  otherUser: UserProfile;
  lastMessage: ChatMessage;
  unreadCount: number;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const currentUser = user ? { id: user.clientId, clinic_id: user.clinicId, clinic_name: user.clinicName } : null;
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Cache for user profiles (doctors/workers)
  const [profilesMap, setProfilesMap] = useState<Map<string, UserProfile>>(new Map());
  const [linkedClientId, setLinkedClientId] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch ALL messages for this client (Shared Inbox Pattern)
  const fetchMessages = async () => {
    if (!currentUser?.id) return;
    
    setLoading(true);
    
    try {
      // A. Resolve Linked Client ID (if not already found)
      let currentLinkedId = linkedClientId;
      if (!currentLinkedId && user?.email) {
        try {
          const { data: clientData } = await supabase
            .from('client')
            .select('id')
            .eq('email', user.email)
            .maybeSingle();
          
          if (clientData) {
            currentLinkedId = clientData.id;
            setLinkedClientId(clientData.id);
          }
        } catch (clientLookupErr) {
          console.warn("[Messages] Could not resolve linked client:", clientLookupErr);
        }
      }

      // B. Build OR query for BOTH Auth ID and Linked Client ID
      const myIds = [currentUser.id];
      if (currentLinkedId) myIds.push(currentLinkedId);
      const idString = myIds.join(',');
      
      const { data: msgs, error: msgError } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.in.(${idString}),receiver_id.in.(${idString})`)
        .order("created_at", { ascending: true });

      if (msgError) {
        console.warn("[Messages] Could not fetch messages:", msgError.message);
        setLoading(false);
        return;
      }

      if (!msgs || msgs.length === 0) {
        setMessages([]);
        setLoading(false);
        return;
      }

      // Identify all unique other participants (Staff)
      const otherUserIds = new Set<string>();
      msgs.forEach((m: any) => {
        if (!myIds.includes(m.sender_id)) otherUserIds.add(m.sender_id);
      });
      
      // Fetch profiles if we have unknown IDs (GRACEFUL - do not throw)
      const unknownIds = Array.from(otherUserIds).filter(id => !profilesMap.has(id));
      
      if (unknownIds.length > 0) {
        try {
          const { data: usersData, error: usersError } = await supabase
            .from('users')
            .select('id, first_name, last_name, role')
            .in('id', unknownIds);
          
          if (!usersError && usersData) {
            setProfilesMap(prev => {
              const newMap = new Map(prev);
              usersData.forEach((u: any) => {
                newMap.set(u.id, { 
                  id: u.id, 
                  first_name: u.first_name || "Membre", 
                  last_name: u.last_name || "", 
                  role: u.role,
                  full_name: `${u.first_name || 'Membre'} ${u.last_name || ''}`.trim()
                });
              });
              return newMap;
            });
          } else if (usersError) {
            console.warn("[Messages] Users table access issue (expected if RLS not configured):", usersError.code);
            // Add fallback profiles for unknown IDs
            setProfilesMap(prev => {
              const newMap = new Map(prev);
              unknownIds.forEach(id => {
                if (!newMap.has(id)) {
                  newMap.set(id, { 
                    id, 
                    first_name: "Membre", 
                    last_name: "Clinique",
                    full_name: "Membre de la clinique"
                  });
                }
              });
              return newMap;
            });
          }
        } catch (userFetchErr) {
          console.warn("[Messages] Failed to fetch user profiles:", userFetchErr);
          // Add fallback profiles
          setProfilesMap(prev => {
            const newMap = new Map(prev);
            unknownIds.forEach(id => {
              if (!newMap.has(id)) {
                newMap.set(id, { 
                  id, 
                  first_name: "Membre", 
                  last_name: "Clinique",
                  full_name: "Membre de la clinique"
                });
              }
            });
            return newMap;
          });
        }
      }

      setMessages(msgs);
    } catch (err: any) {
      // This should only trigger for truly unexpected errors now
      console.error("[Messages] Unexpected error in fetchMessages:", err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
        fetchMessages();

        // Subscribe to NEW messages
        const channel = supabase
        .channel('public:messages_shared')
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages'
        }, (payload: any) => {
            // Check if message is Relevant
            // Relevant if: Receiver is Me/Linked OR Sender is Me/Linked
            const myIds = [currentUser.id];
            if (linkedClientId) myIds.push(linkedClientId);

            const isForMe = myIds.includes(payload.new.receiver_id);
            const isFromMe = myIds.includes(payload.new.sender_id);

            if (isForMe || isFromMe) {
                // If from 'other', check profile
                if (!isFromMe && !profilesMap.has(payload.new.sender_id)) {
                     fetchMessages();
                } else {
                    setMessages(prev => [...prev, payload.new as ChatMessage]);
                }
            }
        })
        .subscribe();

        return () => { supabase.removeChannel(channel); };
    }
  }, [currentUser?.id, linkedClientId]); // Add linkedClientId dependency

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    console.log("Send clicked. User:", currentUser?.id, "Message:", newMessage);

    if (!newMessage.trim()) return;
    if (!currentUser?.id) {
        console.error("No current user ID");
        setErrorMsg("Erreur session utilisateur. Veuillez recharger.");
        return;
    }

    let targetId = null;

    // A. Try last received message sender to reply in thread
    const lastIncoming = [...messages].reverse().find(m => m.sender_id !== currentUser.id);
    if (lastIncoming) {
        targetId = lastIncoming.sender_id;
    } else {
        // B. New chat: Find ANY clinic staff (Anchor) - prioritizing doctor
        try {
            let clinicId = currentUser.clinic_id;
            // Fallback fetch if missing in context
            if (!clinicId) {
                console.log("Fetching clinic_id from client table...");
                const { data, error: clientErr } = await supabase.from('client').select('clinic_id').eq('id', currentUser.id).single();
                if (clientErr) console.error("Client table fetch error:", clientErr);
                clinicId = data?.clinic_id;
            }
            
            if (clinicId) {
                 console.log("Searching for doctor in clinic:", clinicId);
                 // Try to find a doctor
                 let { data: staffData, error: distErr } = await supabase
                    .from('users')
                    .select('id')
                    .eq('clinic_id', clinicId)
                    .eq('role', 'doctor')
                    .limit(1)
                    .maybeSingle();

                 if (distErr) console.error("Doctor lookup error:", distErr);

                 // If no doctor found, try ANY user in that clinic
                 if (!staffData) {
                    console.log("No doctor found, looking for any staff...");
                    const { data: anyStaff, error: staffErr } = await supabase
                      .from('users')
                      .select('id')
                      .eq('clinic_id', clinicId)
                      .limit(1)
                      .maybeSingle();
                    
                    if (staffErr) console.error("Staff lookup error:", staffErr);
                    staffData = anyStaff;
                 }

                 targetId = staffData?.id;
            } else {
                console.warn("No clinic ID found for user.");
            }
        } catch (e) { 
            console.error("Error finding target:", e); 
        }
    }

    if (!targetId) {
        console.warn("No target ID found. Message insert would fail.");
        setErrorMsg("Impossible d'envoyer : aucun vétérinaire trouvé (Problème de permissions probable).");
        return;
    }

    const msgContent = newMessage.trim();
    setNewMessage(""); 

    // Optimistic
    const fakeMsg: ChatMessage = {
        id: Date.now().toString(),
        sender_id: currentUser.id,
        receiver_id: targetId,
        content: msgContent,
        created_at: new Date().toISOString(),
        is_read: false
    };
    setMessages(prev => [...prev, fakeMsg]);

    const { error } = await supabase.from("messages").insert({
        sender_id: currentUser.id,
        receiver_id: targetId,
        content: msgContent,
        is_read: false
    });

    if (error) {
        console.error("Error sending message:", error);
        setErrorMsg("Échec de l'envoi du message.");
    }
  };


  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] bg-[#0a0f0a] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl m-4">
      {/* Sidebar - Just one item: My Clinic */}
      <aside className="w-80 border-r border-gray-800 bg-[#0f1419] flex flex-col hidden md:flex">
          <div className="p-4 border-b border-gray-800">
               <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#00ff88]" />
                    Messagerie
                </h2>
          </div>
          <div className="flex-1 p-2">
              <div className="bg-[#00ff88]/10 border border-[#00ff88]/20 rounded-xl p-4 cursor-default">
                  <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
                           <span className="text-xl">🏥</span>
                      </div>
                      <div>
                          <h3 className="font-bold text-white">Ma Clinique</h3>
                          <p className="text-xs text-[#00ff88]">
                              {currentUser?.clinic_name || "Support Vétérinaire"}
                          </p>
                      </div>
                  </div>

              </div>
          </div>
      </aside>

      {/* Chat Area */}
      <section className="flex-1 flex flex-col bg-[#0a0f0a]">
            {/* ... (Header code remains unchanged) ... */}
            <header className="flex items-center p-4 border-b border-gray-800 bg-[#0f1419]/50 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center overflow-hidden">
                     <span className="text-[#00ff88] font-bold text-lg">🏥</span>
                 </div>
                <div>
                  <h2 className="font-bold text-gray-200">
                    {currentUser?.clinic_name || "Ma Clinique"}
                  </h2>
                  <p className="text-xs text-green-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Support disponible
                  </p>
                </div>
              </div>
            </header>

            {/* Messages List */}
            <div 
                ref={chatContainerRef}
                className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar"
            >
              {loading && <div className="text-center text-gray-500 text-sm">Chargement...</div>}
              
              {!loading && messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
                      <MessageSquare className="w-12 h-12 opacity-20" />
                      <p>Posez votre première question à la clinique !</p>
                  </div>
              )}

              {messages.map((msg, index) => {
                const isMe = msg.sender_id === currentUser?.id;
                const senderProfile = !isMe ? profilesMap.get(msg.sender_id) : null;
                const showAvatar = !isMe; 
                
                return (
                    <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                    >
                        {!isMe && (
                            <span className="text-[10px] text-gray-400 mb-1 ml-12">
                                {senderProfile?.full_name || "Membre de la clinique"}
                                {senderProfile?.role === 'doctor' && " (Vétérinaire)"}
                            </span>
                        )}

                        <div className={`flex items-end gap-3 max-w-[80%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                            {/* Avatar */}
                            <div className="shrink-0 size-8">
                                {showAvatar ? (
                                    <div className="w-full h-full rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-xs font-bold text-[#00ff88] overflow-hidden">
                                        {senderProfile?.avatar_url ? (
                                            <img src={senderProfile.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            senderProfile?.first_name?.[0] || "C"
                                        )}
                                    </div>
                                ) : (
                                    <div className="w-8" /> 
                                )}
                            </div>

                            {/* Bubble */}
                            <div
                                className={`p-3 rounded-2xl ${
                                isMe
                                    ? "bg-[#00ff88]/20 border border-[#00ff88]/30 text-white rounded-br-none"
                                    : "bg-gray-800/50 border border-gray-700 text-gray-200 rounded-bl-none"
                                }`}
                            >
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        </div>
                        
                        <span className={`text-[10px] text-gray-600 mt-1 ${isMe ? "mr-12" : "ml-12"}`}>
                             {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                    </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#0f1419] border-t border-gray-800">
              <form onSubmit={handleSend} className="flex items-center gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Écrivez votre message à la clinique..."
                  className="flex-1 bg-[#0a0f0a] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] transition-all outline-none"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="flex items-center justify-center size-12 rounded-xl bg-[#00ff88] text-black hover:bg-[#00cc6a] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
              {errorMsg && (
                  <p className="text-red-500 text-xs mt-2 text-center">{errorMsg}</p>
              )}
            </div>
      </section>
    </div>
  );
}
