import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function AgentChat() {
  const navigate  = useNavigate();
  const user      = JSON.parse(localStorage.getItem("loggedInUser"));
  const bottomRef = useRef(null);
  const pollRef   = useRef(null);

  const [clients,        setClients]        = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [messages,       setMessages]       = useState([]);
  const [input,          setInput]          = useState("");
  const [loading,        setLoading]        = useState(false);
  const [sending,        setSending]        = useState(false);
  const [unreadMap,      setUnreadMap]      = useState({}); // clientEmail → bool (has new client msg)
  const [search,         setSearch]         = useState("");

  /* ── Load clients ────────────────────────────────── */
  useEffect(() => {
    fetch("http://localhost:5000/chat/clients")
      .then(r => r.json())
      .then(setClients)
      .catch(console.log);
  }, []);

  /* ── Poll unread rooms every 5s ──────────────────── */
  useEffect(() => {
    const checkUnread = async () => {
      try {
        const res  = await fetch(`http://localhost:5000/chat/unread/${encodeURIComponent(user.email)}`);
        const data = await res.json();
        const map  = {};
        (data.rooms || []).forEach(r => {
          if (r.lastRole === "client") {
            const clientEmail = r._id.split("__")[0];
            map[clientEmail]  = true;
          }
        });
        setUnreadMap(map);
      } catch (e) { console.log(e); }
    };
    checkUnread();
    const t = setInterval(checkUnread, 5000);
    return () => clearInterval(t);
  }, [user.email]);

  /* ── Room messages polling ───────────────────────── */
  const roomId = selectedClient
    ? `${selectedClient.email}__${user.email}`
    : null;

  const fetchMessages = async () => {
    if (!roomId) return;
    try {
      const res  = await fetch(`http://localhost:5000/chat/messages/${encodeURIComponent(roomId)}`);
      const data = await res.json();
      setMessages(data);
    } catch (e) { console.log(e); }
  };

  useEffect(() => {
    if (!roomId) return;
    setLoading(true);
    fetchMessages().finally(() => setLoading(false));
    pollRef.current = setInterval(fetchMessages, 2000);
    return () => clearInterval(pollRef.current);
  }, [roomId]);

  /* ── Auto-scroll ─────────────────────────────────── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ── Send message ────────────────────────────────── */
  const sendMessage = async () => {
    if (!input.trim() || !roomId) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    try {
      await fetch("http://localhost:5000/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          sender:     user.email,
          senderName: user.fullName || user.email,
          role:       "agent",
          message:    text
        })
      });
      fetchMessages();
      // clear unread for this client
      setUnreadMap(prev => ({ ...prev, [selectedClient.email]: false }));
    } catch (e) { console.log(e); }
    finally { setSending(false); }
  };

  const handleKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };
  const formatTime = (d) => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const filteredClients = clients.filter(c =>
    !search ||
    c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mt-4">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>💬 Client Chat</h2>
          <p className="text-muted mb-0">Chat with clients and answer their queries</p>
        </div>
        <button className="btn btn-outline-secondary" onClick={() => navigate("/employee")}>
          ← Dashboard
        </button>
      </div>

      <div className="row" style={{ height: "72vh" }}>

        {/* ── Client List ──────────────────────────── */}
        <div className="col-md-3 border-end d-flex flex-column" style={{ overflowY: "auto" }}>
          <input
            className="form-control form-control-sm mb-2"
            placeholder="🔍 Search clients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <h6 className="text-muted mb-2" style={{ fontSize: 12 }}>ALL CLIENTS ({filteredClients.length})</h6>
          {filteredClients.length === 0 && <div className="text-muted small">No clients found.</div>}
          {filteredClients.map(client => {
            const hasUnread = unreadMap[client.email];
            const isActive  = selectedClient?._id === client._id;
            return (
              <div key={client._id}
                className="p-2 mb-2 rounded"
                style={{
                  cursor: "pointer",
                  backgroundColor: isActive ? "#0d6efd18" : "#fff",
                  border: `${isActive ? 2 : 1}px solid ${isActive ? "#0d6efd" : "#dee2e6"}`
                }}
                onClick={() => { setSelectedClient(client); setMessages([]); setUnreadMap(prev => ({ ...prev, [client.email]: false })); }}
              >
                <div className="d-flex align-items-center gap-2">
                  <div className="position-relative">
                    <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                      style={{ width: 36, height: 36, minWidth: 36, backgroundColor: "#198754", fontSize: 13 }}>
                      {client.fullName?.charAt(0).toUpperCase()}
                    </div>
                    {hasUnread && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                        style={{ fontSize: 9 }}>
                        New
                      </span>
                    )}
                  </div>
                  <div style={{ overflow: "hidden" }}>
                    <div className="fw-semibold text-truncate" style={{ fontSize: 13 }}>{client.fullName}</div>
                    <div className="text-muted text-truncate" style={{ fontSize: 11 }}>{client.email}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Chat Window ──────────────────────────── */}
        <div className="col-md-9 d-flex flex-column">
          {!selectedClient ? (
            <div className="flex-grow-1 d-flex align-items-center justify-content-center text-muted flex-column gap-2">
              <div style={{ fontSize: 48 }}>💬</div>
              <div>Select a client to start chatting</div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="d-flex align-items-center gap-3 p-3 border-bottom mb-2">
                <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                  style={{ width: 42, height: 42, backgroundColor: "#198754", fontSize: 16 }}>
                  {selectedClient.fullName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="fw-semibold">{selectedClient.fullName}</div>
                  <div className="text-muted" style={{ fontSize: 12 }}>{selectedClient.email}</div>
                </div>
                <span className="ms-auto badge bg-primary">Client</span>
              </div>

              {/* Messages */}
              <div className="flex-grow-1 overflow-auto px-2" style={{ maxHeight: "calc(72vh - 140px)" }}>
                {loading && messages.length === 0 && (
                  <div className="text-center text-muted py-4">Loading messages...</div>
                )}
                {!loading && messages.length === 0 && (
                  <div className="text-center text-muted py-4">
                    No messages yet. Send the first message! 👋
                  </div>
                )}
                {messages.map((msg) => {
                  const isMine = msg.sender === user.email;
                  return (
                    <div key={msg._id} className={`d-flex mb-3 ${isMine ? "justify-content-end" : "justify-content-start"}`}>
                      {!isMine && (
                        <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold me-2 align-self-end"
                          style={{ width: 32, height: 32, minWidth: 32, backgroundColor: "#198754", fontSize: 12 }}>
                          {msg.senderName?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div style={{ maxWidth: "70%" }}>
                        {!isMine && (
                          <div className="text-muted mb-1" style={{ fontSize: 11 }}>{msg.senderName}</div>
                        )}
                        <div className={`px-3 py-2 rounded-3 ${isMine ? "text-white" : "bg-light border"}`}
                          style={{ backgroundColor: isMine ? "#0d6efd" : undefined, fontSize: 14 }}>
                          {msg.message}
                        </div>
                        <div className={`text-muted mt-1 ${isMine ? "text-end" : ""}`} style={{ fontSize: 10 }}>
                          {formatTime(msg.createdAt)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="d-flex gap-2 pt-2 border-top mt-2">
                <input
                  className="form-control"
                  placeholder={`Reply to ${selectedClient.fullName}...`}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  disabled={sending}
                />
                <button className="btn btn-primary px-3" onClick={sendMessage} disabled={sending || !input.trim()}>
                  {sending ? "..." : "Send"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}