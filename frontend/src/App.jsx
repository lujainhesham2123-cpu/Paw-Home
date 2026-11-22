import { useEffect, useState } from "react";

const API_BASE = "http://localhost:3000/api";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [currentUserId, setCurrentUserId] = useState("");
  const [activeTab, setActiveTab] = useState("browse");

  const [petForm, setPetForm] = useState({
    name: "",
    type: "cat",
    breed: "",
    age: "",
    gender: "male",
    city: "",
    description: "",
    photoUrl: "",
  });

  const [availablePets, setAvailablePets] = useState([]);
  const [myPets, setMyPets] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [requestMessages, setRequestMessages] = useState({});

  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const fetchAvailablePets = async () => {
    try {
      const res = await fetch(`${API_BASE}/pets`);
      const data = await res.json();
      if (res.ok) setAvailablePets(data);
    } catch {
      // Backend may not be running
    }
  };

  const fetchUserData = async (userId) => {
    if (!userId.trim()) {
      setMyPets([]);
      setMyRequests([]);
      return;
    }

    try {
      const [petsRes, reqsRes] = await Promise.all([
        fetch(`${API_BASE}/pets/mine?owner=${encodeURIComponent(userId.trim())}`),
        fetch(`${API_BASE}/requests/mine?adopterId=${encodeURIComponent(userId.trim())}`),
      ]);
      if (petsRes.ok) setMyPets(await petsRes.json());
      if (reqsRes.ok) setMyRequests(await reqsRes.json());
    } catch {
      setError("Could not reach backend server on port 3000.");
    }
  };

  useEffect(() => {
    fetchAvailablePets();
  }, []);

  useEffect(() => {
    fetchUserData(currentUserId);
  }, [currentUserId]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setFeedback("");
    setError("");

    const endpoint = authMode === "register" ? "register" : "login";
    const payload =
      authMode === "register"
        ? { name: authForm.name, email: authForm.email, password: authForm.password }
        : { email: authForm.email, password: authForm.password };

    try {
      const res = await fetch(`${API_BASE}/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Authentication failed.");
      } else {
        setCurrentUser(data.user);
        setCurrentUserId(data.user._id || data.user.id || "");
        if (data.token) {
          localStorage.setItem("pawhome_token", data.token);
        }
        setAuthForm({ name: "", email: "", password: "" });
        setFeedback(
          authMode === "register"
            ? `Welcome to PawHome, ${data.user.name}!`
            : `Welcome back, ${data.user.name}!`
        );
      }
    } catch {
      setError("Could not reach backend server on port 3000.");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentUserId("");
    localStorage.removeItem("pawhome_token");
    setFeedback("You have been logged out.");
    setError("");
  };

  const handlePostPet = async (e) => {
    e.preventDefault();
    setFeedback("");
    setError("");

    if (!currentUserId.trim()) {
      setError("Please log in or enter your User ID at the top first.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/pets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...petForm,
          age: Number(petForm.age),
          owner: currentUserId.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to post pet.");
      } else {
        setFeedback(`${data.name} has been posted for adoption!`);
        setPetForm({
          name: "",
          type: "cat",
          breed: "",
          age: "",
          gender: "male",
          city: "",
          description: "",
          photoUrl: "",
        });
        await fetchAvailablePets();
        await fetchUserData(currentUserId);
        setActiveTab("browse");
      }
    } catch {
      setError("Could not reach backend server on port 3000.");
    }
  };

  const handleSendRequest = async (pet) => {
    setFeedback("");
    setError("");

    if (!currentUserId.trim()) {
      setError("Please log in or enter your User ID at the top before sending a request.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petId: pet._id,
          adopterId: currentUserId.trim(),
          ownerId: pet.owner,
          message: requestMessages[pet._id] || "",
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Could not send adoption request.");
      } else {
        setFeedback(`Adoption request sent for ${pet.name}!`);
        setRequestMessages((prev) => ({ ...prev, [pet._id]: "" }));
        await fetchUserData(currentUserId);
      }
    } catch {
      setError("Could not reach backend server on port 3000.");
    }
  };

  const handleCancelRequest = async (requestId) => {
    setFeedback("");
    setError("");

    try {
      const res = await fetch(`${API_BASE}/requests/${requestId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adopterId: currentUserId.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Could not cancel adoption request.");
      } else {
        setFeedback("Adoption request cancelled and removed.");
        setMyRequests((prev) => prev.filter((r) => r._id !== requestId));
      }
    } catch {
      setError("Could not reach backend server on port 3000.");
    }
  };

  return (
    <div style={{ maxWidth: 840, margin: "2rem auto", padding: "0 1rem", fontFamily: "sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
        <div>
          <h1 id="project-name" style={{ marginBottom: "0.25rem" }}>PawHome</h1>
          <p style={{ marginTop: 0 }}>Connect pets with loving homes across Egypt.</p>
        </div>
        {currentUser ? (
          <div style={{ textAlign: "right" }}>
            <div data-testid="header-user-name">
              <strong>Signed in as: {currentUser.name}</strong>
            </div>
            <div style={{ fontSize: "0.85rem", color: "#555" }}>{currentUser.email}</div>
            <button type="button" onClick={handleLogout} style={{ marginTop: "0.35rem" }}>
              Log out
            </button>
          </div>
        ) : (
          <div>
            <span>Not logged in</span>
          </div>
        )}
      </header>

      <div style={{ margin: "1rem 0", padding: "0.75rem", background: "#f5f5f5", borderRadius: 6 }}>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
          <button type="button" onClick={() => setAuthMode("login")}>
            Login
          </button>
          <button type="button" onClick={() => setAuthMode("register")}>
            Register
          </button>
        </div>

        <form onSubmit={handleAuthSubmit} style={{ display: "grid", gap: "0.5rem", maxWidth: 420, marginBottom: "0.75rem" }}>
          {authMode === "register" && (
            <input
              type="text"
              placeholder="Full Name"
              value={authForm.name}
              onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={authForm.email}
            onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={authForm.password}
            onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
            required
          />
          <button type="submit">{authMode === "register" ? "Create Account" : "Log In"}</button>
        </form>

        <label>
          <strong>Active User ID (ObjectId): </strong>
          <input
            type="text"
            value={currentUserId}
            onChange={(e) => setCurrentUserId(e.target.value)}
            placeholder="Auto-filled on login or paste a 24-character ObjectId"
            style={{ width: "320px", padding: "0.4rem", marginLeft: "0.5rem" }}
          />
        </label>
      </div>

      <nav style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <button type="button" onClick={() => setActiveTab("browse")}>Browse Pets</button>
        <button type="button" onClick={() => setActiveTab("post")}>Post a Pet</button>
        <button type="button" onClick={() => setActiveTab("myPets")}>My Pets</button>
        <button type="button" onClick={() => setActiveTab("myRequests")}>My Requests</button>
      </nav>

      {feedback && <p style={{ color: "green" }}>{feedback}</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <hr />

      {activeTab === "browse" && (
        <div>
          <h2>Available Pets for Adoption</h2>
          {availablePets.length === 0 ? (
            <p>No available pets posted yet.</p>
          ) : (
            <div style={{ display: "grid", gap: "1rem" }}>
              {availablePets.map((pet) => {
                const isOwnPet = currentUserId.trim() && pet.owner === currentUserId.trim();
                return (
                  <div key={pet._id} style={{ border: "1px solid #ccc", borderRadius: 6, padding: "1rem" }}>
                    {pet.photoUrl && (
                      <img
                        src={pet.photoUrl}
                        alt={pet.name}
                        style={{ maxWidth: 200, borderRadius: 6, display: "block", marginBottom: "0.5rem" }}
                      />
                    )}
                    <h3>{pet.name} ({pet.type})</h3>
                    <p>
                      <strong>Breed:</strong> {pet.breed || "N/A"} · <strong>Age:</strong> {pet.age} months ·{" "}
                      <strong>Gender:</strong> {pet.gender} · <strong>City:</strong> {pet.city}
                    </p>
                    <p>{pet.description}</p>

                    {!isOwnPet && (
                      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                        <input
                          type="text"
                          placeholder="Short message about your home..."
                          value={requestMessages[pet._id] || ""}
                          onChange={(e) =>
                            setRequestMessages((prev) => ({ ...prev, [pet._id]: e.target.value }))
                          }
                          style={{ flex: 1, padding: "0.4rem" }}
                        />
                        <button type="button" onClick={() => handleSendRequest(pet)}>
                          Request to adopt
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === "post" && (
        <div>
          <h2>Post a Pet for Adoption</h2>
          <form onSubmit={handlePostPet} style={{ display: "grid", gap: "0.75rem", maxWidth: 500 }}>
            <input
              type="text"
              placeholder="Pet Name"
              value={petForm.name}
              onChange={(e) => setPetForm({ ...petForm, name: e.target.value })}
              required
            />
            <select
              value={petForm.type}
              onChange={(e) => setPetForm({ ...petForm, type: e.target.value })}
            >
              <option value="cat">Cat</option>
              <option value="dog">Dog</option>
              <option value="bird">Bird</option>
              <option value="rabbit">Rabbit</option>
              <option value="other">Other</option>
            </select>
            <input
              type="text"
              placeholder="Breed (optional)"
              value={petForm.breed}
              onChange={(e) => setPetForm({ ...petForm, breed: e.target.value })}
            />
            <input
              type="number"
              min="0"
              placeholder="Age (in months)"
              value={petForm.age}
              onChange={(e) => setPetForm({ ...petForm, age: e.target.value })}
              required
            />
            <select
              value={petForm.gender}
              onChange={(e) => setPetForm({ ...petForm, gender: e.target.value })}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <input
              type="text"
              placeholder="City (e.g. New Cairo)"
              value={petForm.city}
              onChange={(e) => setPetForm({ ...petForm, city: e.target.value })}
              required
            />
            <textarea
              rows={3}
              placeholder="Description"
              value={petForm.description}
              onChange={(e) => setPetForm({ ...petForm, description: e.target.value })}
              required
            />
            <input
              type="url"
              placeholder="Photo URL (optional)"
              value={petForm.photoUrl}
              onChange={(e) => setPetForm({ ...petForm, photoUrl: e.target.value })}
            />
            <button type="submit">Post Pet</button>
          </form>
        </div>
      )}

      {activeTab === "myPets" && (
        <div>
          <h2>My Pets</h2>
          {!currentUserId.trim() ? (
            <p>Log in or enter your User ID above to see your posted pets.</p>
          ) : myPets.length === 0 ? (
            <p>You have not posted any pets yet.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "0.75rem" }}>
              {myPets.map((pet) => (
                <li key={pet._id} style={{ border: "1px solid #ccc", borderRadius: 6, padding: "0.75rem" }}>
                  <strong>{pet.name}</strong> ({pet.type}) — {pet.city} · Status: <em>{pet.status}</em>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {activeTab === "myRequests" && (
        <div>
          <h2>My Requests</h2>
          {!currentUserId.trim() ? (
            <p>Log in or enter your User ID above to view your adoption requests.</p>
          ) : myRequests.length === 0 ? (
            <p>No adoption requests found.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "0.75rem" }}>
              {myRequests.map((reqItem) => (
                <li
                  key={reqItem._id}
                  style={{
                    border: "1px solid #ccc",
                    borderRadius: 6,
                    padding: "0.75rem 1rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div>
                      <strong>Pet:</strong>{" "}
                      {reqItem.pet && typeof reqItem.pet === "object"
                        ? `${reqItem.pet.name} (${reqItem.pet.type})`
                        : reqItem.pet}
                    </div>
                    <div>
                      <strong>Status:</strong> {reqItem.status}
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
      )}
    </div>
  );
}