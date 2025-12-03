"use client";

import { useState } from "react";

const conversations = [
  {
    id: 1,
    name: "Dr. Emily Carter",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBLuVT5CoIegkA7tfmXMNSHbEo9TgrY6usaaTU5KY2p9l_L9idpefoavvA7OPMqFWMrmfbQ-o33DomnMDYbAM9diG1v_shaFJ7nlwc-R5ILF3BruJufelxsWmN0re55OYm9xUqXSQBb9pfZJCRQDrjyhsNWukjfjPHIpnmQ_rg2fCvj32EzfQJukCy38_LIHf927qM0saLFEW6KpKu-XRWd4foSiqyymaXg3Vu6OkvJtIDGMET3tAUDbhFEJ3Uxa5pyX4j1HJ1svu4",
    lastMessage: "Sounds great, I will check on...",
    timestamp: "10:42 AM",
    isOnline: true,
    isActive: true,
  },
  {
    id: 2,
    name: "Front Desk",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBLuVT5CoIegkA7tfmXMNSHbEo9TgrY6usaaTU5KY2p9l_L9idpefoavvA7OPMqFWMrmfbQ-o33DomnMDYbAM9diG1v_shaFJ7nlwc-R5ILF3BruJufelxsWmN0re55OYm9xUqXSQBb9pfZJCRQDrjyhsNWukjfjPHIpnmQ_rg2fCvj32EzfQJukCy38_LIHf927qM0saLFEW6KpKu-XRWd4foSiqyymaXg3Vu6OkvJtIDGMET3tAUDbhFEJ3Uxa5pyX4j1HJ1svu4",
    lastMessage: "Your appointment is confirmed for...",
    timestamp: "Yesterday",
    isOnline: false,
    isActive: false,
  },
  {
    id: 3,
    name: "Dr. Alex Chen",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBLuVT5CoIegkA7tfmXMNSHbEo9TgrY6usaaTU5KY2p9l_L9idpefoavvA7OPMqFWMrmfbQ-o33DomnMDYbAM9diG1v_shaFJ7nlwc-R5ILF3BruJufelxsWmN0re55OYm9xUqXSQBb9pfZJCRQDrjyhsNWukjfjPHIpnmQ_rg2fCvj32EzfQJukCy38_LIHf927qM0saLFEW6KpKu-XRWd4foSiqyymaXg3Vu6OkvJtIDGMET3tAUDbhFEJ3Uxa5pyX4j1HJ1svu4",
    lastMessage: "The lab results for Buster are in.",
    timestamp: "Mon",
    isOnline: true,
    isActive: false,
  },
];

const messages = [
  {
    id: 1,
    sender: "Dr. Emily Carter",
    text: "Hi Jane, I'm just following up on Buddy's recovery after his procedure. How has he been doing over the past couple of days?",
    timestamp: "10:35 AM",
    isOutgoing: false,
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBLuVT5CoIegkA7tfmXMNSHbEo9TgrY6usaaTU5KY2p9l_L9idpefoavvA7OPMqFWMrmfbQ-o33DomnMDYbAM9diG1v_shaFJ7nlwc-R5ILF3BruJufelxsWmN0re55OYm9xUqXSQBb9pfZJCRQDrjyhsNWukjfjPHIpnmQ_rg2fCvj32EzfQJukCy38_LIHf927qM0saLFEW6KpKu-XRWd4foSiqyymaXg3Vu6OkvJtIDGMET3tAUDbhFEJ3Uxa5pyX4j1HJ1svu4",
  },
  {
    id: 2,
    sender: "Jane Doe",
    text: "Hi Dr. Carter! He's doing much better, thank you. His appetite is back to normal and he's starting to be his playful self again.",
    timestamp: "10:38 AM",
    isOutgoing: true,
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBLuVT5CoIegkA7tfmXMNSHbEo9TgrY6usaaTU5KY2p9l_L9idpefoavvA7OPMqFWMrmfbQ-o33DomnMDYbAM9diG1v_shaFJ7nlwc-R5ILF3BruJufelxsWmN0re55OYm9xUqXSQBb9pfZJCRQDrjyhsNWukjfjPHIpnmQ_rg2fCvj32EzfQJukCy38_LIHf927qM0saLFEW6KpKu-XRWd4foSiqyymaXg3Vu6OkvJtIDGMET3tAUDbhFEJ3Uxa5pyX4j1HJ1svu4",
  },
  {
    id: 3,
    sender: "Dr. Emily Carter",
    text: "That's wonderful to hear. Are you having any trouble administering his medication?",
    timestamp: "10:40 AM",
    isOutgoing: false,
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBLuVT5CoIegkA7tfmXMNSHbEo9TgrY6usaaTU5KY2p9l_L9idpefoavvA7OPMqFWMrmfbQ-o33DomnMDYbAM9diG1v_shaFJ7nlwc-R5ILF3BruJufelxsWmN0re55OYm9xUqXSQBb9pfZJCRQDrjyhsNWukjfjPHIpnmQ_rg2fCvj32EzfQJukCy38_LIHf927qM0saLFEW6KpKu-XRWd4foSiqyymaXg3Vu6OkvJtIDGMET3tAUDbhFEJ3Uxa5pyX4j1HJ1svu4",
  },
  {
    id: 4,
    sender: "Jane Doe",
    text: "Not at all, the pill pockets are working like a charm. He thinks they're treats!",
    timestamp: "10:41 AM",
    isOutgoing: true,
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBLuVT5CoIegkA7tfmXMNSHbEo9TgrY6usaaTU5KY2p9l_L9idpefoavvA7OPMqFWMrmfbQ-o33DomnMDYbAM9diG1v_shaFJ7nlwc-R5ILF3BruJufelxsWmN0re55OYm9xUqXSQBb9pfZJCRQDrjyhsNWukjfjPHIpnmQ_rg2fCvj32EzfQJukCy38_LIHf927qM0saLFEW6KpKu-XRWd4foSiqyymaXg3Vu6OkvJtIDGMET3tAUDbhFEJ3Uxa5pyX4j1HJ1svu4",
  },
  {
    id: 5,
    sender: "Dr. Emily Carter",
    text: "Sounds great, I will check on him again in a couple of days. Let us know if anything changes.",
    timestamp: "10:42 AM",
    isOutgoing: false,
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBLuVT5CoIegkA7tfmXMNSHbEo9TgrY6usaaTU5KY2p9l_L9idpefoavvA7OPMqFWMrmfbQ-o33DomnMDYbAM9diG1v_shaFJ7nlwc-R5ILF3BruJufelxsWmN0re55OYm9xUqXSQBb9pfZJCRQDrjyhsNWukjfjPHIpnmQ_rg2fCvj32EzfQJukCy38_LIHf927qM0saLFEW6KpKu-XRWd4foSiqyymaXg3Vu6OkvJtIDGMET3tAUDbhFEJ3Uxa5pyX4j1HJ1svu4",
  },
];

export default function MessagesPage() {
  const [message, setMessage] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      // Handle send message
      setMessage("");
    }
  };

  const activeConversation = conversations.find((c) => c.isActive);

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Conversations List */}
      <aside className="w-80 bg-surface-dark border-r border-border-dark flex flex-col">
        <div className="p-4 border-b border-border-dark">
          <h2 className="text-xl font-bold text-white">Conversations</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col">
            {conversations.map((conversation) => (
              <a
                key={conversation.id}
                href="#"
                className={`flex items-center gap-4 p-4 hover:bg-white/5 transition-colors border-b border-border-dark ${
                  conversation.isActive ? "bg-white/10" : ""
                }`}
              >
                <div className="relative">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12"
                    style={{
                      backgroundImage: `url("${conversation.avatar}")`,
                    }}
                  />
                  {conversation.isOnline && (
                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-primary ring-2 ring-surface-dark" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-white truncate">
                      {conversation.name}
                    </h3>
                    <span className="text-xs text-text-dark-secondary shrink-0 ml-2">
                      {conversation.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-text-dark-secondary truncate">
                    {conversation.lastMessage}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </aside>

      {/* Chat Area */}
      <section className="flex-1 flex flex-col">
        <header className="flex items-center p-4 border-b border-border-dark bg-surface-dark">
          <div className="flex items-center gap-3">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
              style={{
                backgroundImage: activeConversation
                  ? `url("${activeConversation.avatar}")`
                  : "none",
              }}
            />
            <div>
              <h2 className="font-bold text-lg text-white">
                {activeConversation?.name || "Select a conversation"}
              </h2>
              {activeConversation?.isOnline && (
                <p className="text-sm text-primary">Online</p>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-4 ${
                msg.isOutgoing ? "justify-end" : ""
              }`}
            >
              {!msg.isOutgoing && (
                <div
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 shrink-0"
                  style={{ backgroundImage: `url("${msg.avatar}")` }}
                />
              )}
              <div
                className={`flex flex-col ${
                  msg.isOutgoing ? "items-end max-w-lg" : "items-start max-w-lg"
                }`}
              >
                <div
                  className={`p-3 rounded-lg ${
                    msg.isOutgoing
                      ? "bg-primary text-black rounded-tr-none"
                      : "bg-surface-dark text-white rounded-tl-none"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
                <span className="text-xs text-text-dark-secondary mt-1">
                  {msg.timestamp}
                </span>
              </div>
              {msg.isOutgoing && (
                <div
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 shrink-0"
                  style={{ backgroundImage: `url("${msg.avatar}")` }}
                />
              )}
            </div>
          ))}
        </div>

        <div className="p-4 bg-surface-dark">
          <form onSubmit={handleSend} className="flex items-center gap-4">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-background-dark border border-border-dark rounded-lg px-4 py-2 text-white placeholder:text-text-dark-secondary focus:ring-primary focus:border-primary transition-colors outline-none"
            />
            <button
              type="submit"
              className="flex items-center justify-center size-10 rounded-lg bg-primary text-black hover:bg-primary/80 transition-opacity"
            >
              <span className="material-symbols-outlined text-xl">send</span>
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

