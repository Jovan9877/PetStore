import React, { useEffect, useState } from "react";
import { IAuthAPI } from "../../api/auth/IAuthAPI";
import { LoginUserDTO } from "../../models/auth/LoginUserDTO";
import { useAuth } from "../../hooks/useAuthHook";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "../../helpers/error_message";

type LoginFormProps = {
  authAPI: IAuthAPI;
};

export const LoginForm: React.FC<LoginFormProps> = ({ authAPI }) => {
  const now = new Date();
  const defaultTime = now.toTimeString().slice(0, 5);
  const defaultDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const [formData, setFormData] = useState<LoginUserDTO>({
    username: "",
    password: "",
  });
  const [sessionTime, setSessionTime] = useState<string>(defaultTime);
  const [sessionDate, setSessionDate] = useState<string>(defaultDate);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await authAPI.login({
        username: formData.username.trim(),
        password: formData.password,
      });

      if (response.success && response.token) {
        login(response.token, `${sessionDate}T${sessionTime}`);
        navigate("/dashboard");
      } else {
        setError(response.message || "Login failed. Please try again.");
        setFormData({ username: "", password: "" });
      }
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Login failed. Please try again."));
      setFormData({ username: "", password: "" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex gap-2">
        <div className="flex-1">
          <label htmlFor="sessionDate" style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600 }}>
            Simulation Date
          </label>
          <input
            type="date"
            id="sessionDate"
            name="sessionDate"
            value={sessionDate}
            onChange={(e) => setSessionDate(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className="flex-1">
        <label htmlFor="username" style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600 }}>
          Username
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Enter your username"
          required
          disabled={isLoading}
        />
        </div>
      </div>

      <div>
        <label htmlFor="password" style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600 }}>
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="sessionTime" style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600 }}>
          Simulation Time
        </label>
        <input
          type="time"
          id="sessionTime"
          name="sessionTime"
          value={sessionTime}
          onChange={(e) => setSessionTime(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      {error && (
        <div
          className="card"
          style={{
            padding: "12px 16px",
            backgroundColor: "rgba(196, 43, 28, 0.15)",
            borderColor: "var(--win11-close-hover)",
          }}
        >
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="var(--win11-close-hover)">
              <path d="M8 2a6 6 0 100 12A6 6 0 008 2zm0 1a5 5 0 110 10A5 5 0 018 3zm0 2a.5.5 0 01.5.5v3a.5.5 0 01-1 0v-3A.5.5 0 018 5zm0 6a.75.75 0 110 1.5.75.75 0 010-1.5z"/>
            </svg>
            <span style={{ fontSize: "13px", color: "var(--win11-text-primary)" }}>{error}</span>
          </div>
        </div>
      )}

      <button
        type="submit"
        className="btn btn-accent"
        disabled={isLoading}
        style={{ marginTop: "8px" }}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }}></div>
            <span>Logging in...</span>
          </div>
        ) : (
          "Login"
        )}
      </button>
    </form>
  );
};
