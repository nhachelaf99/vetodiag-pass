"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

interface Message {
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
}

interface Conversation {
  otherUser: UserProfile;
  lastMessage: Message;
  unreadCount: number;
}

export default function MessagesPage() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 1. Get Current User
  useEffect(() => {
    const getUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            setCurrentUser(session.user.id);
        }
    };
    getUser();
  }, []);

  // 2. Fetch Conversations (Grouped Messages)
  useEffect(() => {
    if (!currentUser) return;

    const fetchConversations = async () => {
      try {
        setLoading(true);
        // 1. Fetch raw messages
        const { data: msgs, error: msgError } = await supabase
          .from("messages")
          .select("*")
          .or(`sender_id.eq.${currentUser},receiver_id.eq.${currentUser}`)
          .order("created_at", { ascending: false });

        if (msgError) {
             console.error("Error fetching messages:", msgError);
             throw msgError;
        }

        // 2. Identify unique User IDs involved (excluding current user)
        const userIds = new Set<string>();
        msgs?.forEach((m: any) => {
             if (m.sender_id !== currentUser) userIds.add(m.sender_id);
             if (m.receiver_id !== currentUser) userIds.add(m.receiver_id);
        });
        const uniqueIds = Array.from(userIds);

        // 3. Fetch Profiles (Try both 'users' and 'client' tables)
        const role = 'unknown'; // In mixed chat we don't know roles easily without checking both
        let profilesMap = new Map<string, UserProfile>();

        if (uniqueIds.length > 0) {
            // A. Fetch from 'users'
            const { data: usersData } = await supabase
                .from('users')
                .select('id, first_name, last_name') 
                .in('id', uniqueIds);
            
            usersData?.forEach((u: any) => {
                profilesMap.set(u.id, {
                    id: u.id,
                    first_name: u.first_name,
                    last_name: u.last_name,
                    avatar_url: undefined 
                });
            });

            // B. Fetch from 'client'
            const { data: clientData } = await supabase
                .from('client')
                .select('id, full_name') 
                .in('id', uniqueIds);

             clientData?.forEach((c: any) => {
                if (!profilesMap.has(c.id)) {
                    const [first, ...rest] = (c.full_name || "Unknown User").split(" ");
                    profilesMap.set(c.id, {
                        id: c.id,
                        first_name: first,
                        last_name: rest.join(" "),
                    });
                }
            });
        }

        // 4. Group Messages into Conversations
        const convMap = new Map<string, Conversation>();
        
        msgs?.forEach((msg: any) => {
          const isSender = msg.sender_id === currentUser;
          const otherId = isSender ? msg.receiver_id : msg.sender_id;
          const otherProfile = profilesMap.get(otherId);

          const profile = otherProfile || { 
              id: otherId, 
              first_name: "Unknown", 
              last_name: "User" 
          };

          if (!convMap.has(otherId)) {
            convMap.set(otherId, {
              otherUser: profile,
              lastMessage: {
                id: msg.id,
                sender_id: msg.sender_id,
                receiver_id: msg.receiver_id,
                content: msg.content,
                created_at: msg.created_at,
                is_read: msg.is_read
              },
              unreadCount: 0
            });
          }
          
          if (!isSender && !msg.is_read) {
             const conv = convMap.get(otherId)!;
             conv.unreadCount++;
          }
        });

        setConversations(Array.from(convMap.values()));
      } catch (err: any) {
        console.error("Error in conversation logic:", err?.message || err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    fetchConversations();
    
    // Subscribe to new messages (simplified)
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
          fetchConversations(); // Refresh list on new message
      })
      .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
  }, [currentUser]);

  // 3. Fetch Messages for Active Conversation
  useEffect(() => {
    if (!currentUser || !activeConvId) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${currentUser},receiver_id.eq.${activeConvId}),and(sender_id.eq.${activeConvId},receiver_id.eq.${currentUser})`)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setMessages(data);
        // Mark as read
        const unreadIds = data.filter(m => m.receiver_id === currentUser && !m.is_read).map(m => m.id);
        if (unreadIds.length > 0) {
             await supabase.from("messages").update({ is_read: true }).in("id", unreadIds);
        }
      }
    };

    fetchMessages();
    
    // Subscribe to specific conversation messages
    const channel = supabase
      .channel(`chat:${activeConvId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `sender_id=eq.${activeConvId}` 
      }, payload => {
         setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();

      return () => { supabase.removeChannel(channel); }

  }, [currentUser, activeConvId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !activeConvId) return;

    const msgContent = newMessage.trim();
    setNewMessage(""); // Optimistic clear

    const { error } = await supabase
      .from("messages")
      .insert({
        sender_id: currentUser,
        receiver_id: activeConvId,
        content: msgContent,
        is_read: false
      });

    if (error) {
      console.error("Error sending message:", error);
      // Ideally show error toast
    } else {
        // Optimistic update
        const fakeMsg: Message = {
            id: Date.now().toString(),
            sender_id: currentUser,
            receiver_id: activeConvId,
            content: msgContent,
            created_at: new Date().toISOString(),
            is_read: false
        };
        setMessages(prev => [...prev, fakeMsg]);
    }
  };

  const activeConv = conversations.find(c => c.otherUser.id === activeConvId);

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] bg-background-dark font-display overflow-hidden">
      {/* 
          REMOVED HEADER as requested.
          Layout is Sidebar (Conversations) | Chat Area 
      */}

      {/* Conversations Sidebar */}
      <aside className="w-80 border-r border-border-dark flex flex-col bg-surface-dark">
        <div className="p-4 border-b border-border-dark flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Messages</h2>
          {/* <button className="text-primary hover:text-white"><span className="material-symbols-outlined">edit_square</span></button> */}
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loading && conversations.length === 0 ? (
             <div className="p-4 text-gray-500 text-center">Loading conversations...</div>
          ) : conversations.length === 0 ? (
             <div className="p-4 text-gray-500 text-center">No conversations yet.</div>
          ) : (
            <div className="flex flex-col">
              {conversations.map((conv) => (
                <button
                  key={conv.otherUser.id}
                  onClick={() => setActiveConvId(conv.otherUser.id)}
                  className={`flex items-center gap-4 p-4 hover:bg-white/5 transition-colors border-b border-border-dark text-left ${
                    activeConvId === conv.otherUser.id ? "bg-white/10" : ""
                  }`}
                >
                  <div className="relative">
                    <div
                      className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12 bg-gray-700"
                      style={{
                        backgroundImage: conv.otherUser.avatar_url ? `url("${conv.otherUser.avatar_url}")` : "none",
                      }}
                    >
                         {!conv.otherUser.avatar_url && (
                             <span className="flex items-center justify-center h-full w-full text-white text-lg font-bold">
                                 {conv.otherUser.first_name?.[0]}{conv.otherUser.last_name?.[0]}
                             </span>
                         )}
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-black ring-2 ring-surface-dark">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-bold text-white truncate">
                        {conv.otherUser.first_name} {conv.otherUser.last_name}
                      </h3>
                      <span className="text-xs text-gray-500 shrink-0 ml-2">
                        {new Date(conv.lastMessage.created_at).toLocaleDateString(undefined, {weekday: 'short'})}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${conv.unreadCount > 0 ? "text-white font-medium" : "text-gray-500"}`}>
                      {conv.lastMessage.sender_id === currentUser ? "You: " : ""}{conv.lastMessage.content}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Chat Area */}
      <section className="flex-1 flex flex-col bg-background-dark">
        {activeConv ? (
          <>
            <header className="flex items-center p-4 border-b border-border-dark bg-surface-dark/50 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3">
                 <div
                      className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 bg-gray-700"
                      style={{
                        backgroundImage: activeConv.otherUser.avatar_url ? `url("${activeConv.otherUser.avatar_url}")` : "none",
                      }}
                 >
                     {!activeConv.otherUser.avatar_url && (
                        <span className="flex items-center justify-center h-full w-full text-white font-bold">
                            {activeConv.otherUser.first_name?.[0]}
                        </span>
                     )}
                 </div>
                <div>
                  <h2 className="font-bold text-lg text-white">
                    {activeConv.otherUser.first_name} {activeConv.otherUser.last_name}
                  </h2>
                  <p className="text-xs text-gray-400">Online</p>
                </div>
              </div>
            </header>

            <div 
                ref={chatContainerRef}
                className="flex-1 p-6 overflow-y-auto space-y-4 scroll-smooth"
            >
              {messages.map((msg) => {
                const isMe = msg.sender_id === currentUser;
                return (
                    <div
                    key={msg.id}
                    className={`flex items-end gap-3 ${isMe ? "justify-end" : "justify-start"}`}
                    >
                    {!isMe && (
                        <div className="size-8 rounded-full bg-gray-700 mb-1 overflow-hidden"> 
                            {/* Avatar placeholder */}
                        </div>
                    )}
                    <div
                        className={`max-w-[70%] p-3 rounded-2xl ${
                        isMe
                            ? "bg-primary text-black rounded-br-none"
                            : "bg-surface-dark border border-border-dark text-white rounded-bl-none"
                        }`}
                    >
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>
                    </div>
                );
              })}
            </div>

            <div className="p-4 bg-surface-dark border-t border-border-dark">
              <form onSubmit={handleSend} className="flex items-center gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="flex items-center justify-center size-12 rounded-xl bg-primary text-black hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <span className="material-symbols-outlined">send</span>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <span className="material-symbols-outlined text-6xl mb-4 opacity-20">chat_bubble</span>
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </section>
    </div>
  );
}
