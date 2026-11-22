import { useEffect, useState } from "react";

const API_BASE = "http://localhost:3000/api";

export default function App() {
  const [adopterId, setAdopterId] = useState("");
  const [petId, setPetId] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [message, setMessage] = useState("");
  const [requests, setRequests] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchMyRequests = async (currentAdopterId = adopterId) => {
    setError("");
    if (!currentAdopterId.trim()) {
      setRequests([]);
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/requests/mine?adopterId=${encodeURIComponent(currentAdopterId.trim())}`
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to load adoption requests.");
        return;
      }
      setRequests(data);
    } catch {
      setError("Could not reach backend server on port 3000.");
    }
  };

  useEffect(() => {
    if (adopterId.trim()) {
      fetchMyRequests(adopterId);
    }
  }, [adopterId]);

  const handleSendRequest = async (e) => {
    e.preventDefault();
    setFeedback("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petId: petId.trim(),
          adopterId: adopterId.trim(),
          ownerId: ownerId.trim(),
          message: message.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Could not send adoption request.");
      } else {
        setFeedback("Adoption request sent with status: pending.");
        setMessage("");
        await fetchMyRequests(adopterId);
      }
    } catch {
      setError("Could not reach backend server on port 3000.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    setFeedback("");
    setError("");

    try {
      const res = await fetch(`${API_BASE}/requests/${requestId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adopterId: adopterId.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Could not cancel adoption request.");
      } else {
        setFeedback("Pending adoption request cancelled and removed.");
        setRequests((prev) => prev.filter((item) => item._id !== requestId));
      }
    } catch {
      setError("Could not reach backend server on port 3000.");
    }
  };

  return (
    <div style={{ maxWidth: 760, margin: "2rem auto", padding: "0 1rem", fontFamily: "sans-serif" }}>
      <h1 id="project-name">PawHome</h1>
      <p>Connect pets with loving homes across Egypt.</p>

      <hr />

      <h2>Request to Adopt</h2>
      <form onSubmit={handleSendRequest} style={{ display: "grid", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <label>
          Your Adopter ID (User ObjectId)
          <input
            type="text"
            value={adopterId}
            onChange={(e) => setAdopterId(e.target.value)}
            placeholder="e.g. 674000000000000000000001"
            required
            style={{ display: "block", width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
          />
        </label>

        <label>
          Pet ID (Pet ObjectId)
          <input
            type="text"
            value={petId}
            onChange={(e) => setPetId(e.target.value)}
            placeholder="e.g. 674000000000000000000002"
            required
            style={{ display: "block", width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
          />
        </label>

        <label>
          Pet Owner ID (User ObjectId)
          <input
            type="text"
            value={ownerId}
            onChange={(e) => setOwnerId(e.target.value)}
            placeholder="e.g. 674000000000000000000003"
            required
            style={{ display: "block", width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
          />
        </label>

        <label>
          Message about your home (optional)
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell the owner about your home, experience, and schedule..."
            style={{ display: "block", width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
          />
        </label>

        <button type="submit" disabled={loading} style={{ padding: "0.6rem 1rem", width: "fit-content" }}>
          {loading ? "Sending..." : "Request to adopt"}
        </button>
      </form>

      {feedback && <p style={{ color: "green" }}>{feedback}</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <hr />

      <h2>My Requests</h2>
      {!adopterId.trim() ? (
        <p>Enter your Adopter ID above to view your sent adoption requests.</p>
      ) : requests.length === 0 ? (
        <p>No adoption requests found.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "0.75rem" }}>
          {requests.map((reqItem) => (
            <li
              key={reqItem._id}
              style={{
                border: "1px solid #ccc",
                borderRadius: 6,
                padding: "0.75rem 1rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <div>
                <div>
                  <strong>Pet:</strong>{" "}
                  {reqItem.pet && typeof reqItem.pet === "object"
                    ? `${reqItem.pet.name} (${reqItem.pet.type || "pet"})`
                    : reqItem.pet}
                </div>
                <div>
                  <strong>Status:</strong> <span>{reqItem.status}</span>
                </div>
                {reqItem.message && (
                  <div>
                    <strong>Message:</strong> {reqItem.message}
                  </div>
                )}
              </div>

              {reqItem.status === "pending" && (
                <button type="button" onClick={() => handleCancelRequest(reqItem._id)}>
                  Cancel Request
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
