import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function ClientChat() {
  const navigate  = useNavigate();
  const user      = JSON.parse(localStorage.getItem("loggedInUser"));
  const bottomRef = useRef(null);

  const [agents,       setAgents]       = useState([]);
  const [selectedAgent,setSelectedAgent]= useState(null);
  const [messages,     setMessages]     = useState([]);
  const [input,        setInput]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [sending,      setSending]      = useState(false);
  const pollRef = useRef(null);

  /* ── Load agents ─────────────────────────────── */
  useEffect(() => {
    fetch("http://localhost:5000/chat/agents")
      .then(r => r.json())
      .then(setAgents)
      .catch(console.log);
  }, []);

  /* ── Poll messages every 2s when a room is open ─ */
  const roomId = selectedAgent
    ? `${user.email}__${selectedAgent.email}`
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

  /* ── Auto-scroll to bottom ───────────────────── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ── Send message ────────────────────────────── */
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
          role:       "client",
          message:    text
        })
      });
      fetchMessages();
    } catch (e) { console.log(e); }
    finally { setSending(false); }
  };

  const handleKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  const formatTime = (d) => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="container mt-4">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>💬 Chat with Agent</h2>
          <p className="text-muted mb-0">Get help from an insurance agent</p>
        </div>
        <button className="btn btn-outline-secondary" onClick={() => navigate("/client")}>
          ← Dashboard
        </button>
      </div>

      <div className="row" style={{ height: "70vh" }}>

        {/* ── Agent List ───────────────────────────── */}
        <div className="col-md-3 border-end">
          <h6 className="text-muted mb-3">Available Agents</h6>
          {agents.length === 0 && <div className="text-muted small">No agents available.</div>}
          {agents.map(agent => (
            <div key={agent._id}
              className={`p-3 mb-2 rounded border`}
              style={{
                cursor: "pointer",
                backgroundColor: selectedAgent?._id === agent._id ? "#0d6efd18" : "#fff",
                borderColor:     selectedAgent?._id === agent._id ? "#0d6efd" : "#dee2e6",
                borderWidth:     selectedAgent?._id === agent._id ? 2 : 1,
                borderStyle: "solid"
              }}
              onClick={() => { setSelectedAgent(agent); setMessages([]); }}
            >
              <div className="d-flex align-items-center gap-2">
                <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                  style={{ width: 38, height: 38, minWidth: 38, backgroundColor: "#0d6efd", fontSize: 14 }}>
                  {agent.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="fw-semibold" style={{ fontSize: 14 }}>{agent.fullName}</div>
                  <div style={{ fontSize: 11, color: "#6c757d" }}>{agent.employeeRole}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Chat Window ──────────────────────────── */}
        <div className="col-md-9 d-flex flex-column">
          {!selectedAgent ? (
            <div className="flex-grow-1 d-flex align-items-center justify-content-center text-muted flex-column gap-2">
              <div style={{ fontSize: 48 }}>💬</div>
              <div>Select an agent to start chatting</div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="d-flex align-items-center gap-3 p-3 border-bottom mb-2">
                <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                  style={{ width: 42, height: 42, backgroundColor: "#0d6efd", fontSize: 16 }}>
                  {selectedAgent.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="fw-semibold">{selectedAgent.fullName}</div>
                  <div className="text-muted" style={{ fontSize: 12 }}>{selectedAgent.employeeRole}</div>
                </div>
                <span className="ms-auto badge bg-success">● Online</span>
              </div>

              {/* Messages */}
              <div className="flex-grow-1 overflow-auto px-2" style={{ maxHeight: "calc(70vh - 140px)" }}>
                {loading && messages.length === 0 && (
                  <div className="text-center text-muted py-4">Loading messages...</div>
                )}
                {!loading && messages.length === 0 && (
                  <div className="text-center text-muted py-4">
                    No messages yet. Say hello! 👋
                  </div>
                )}
                {messages.map((msg) => {
                  const isMine = msg.sender === user.email;
                  return (
                    <div key={msg._id} className={`d-flex mb-3 ${isMine ? "justify-content-end" : "justify-content-start"}`}>
                      {!isMine && (
                        <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold me-2 align-self-end"
                          style={{ width: 32, height: 32, minWidth: 32, backgroundColor: "#0d6efd", fontSize: 12 }}>
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
                  placeholder={`Message ${selectedAgent.fullName}...`}
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