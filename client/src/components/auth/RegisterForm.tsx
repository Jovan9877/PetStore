import React, { useState } from "react";
import { IAuthAPI } from "../../api/auth/IAuthAPI";
import { RegistrationUserDTO } from "../../models/auth/RegistrationUserDTO";
import { getErrorMessage } from "../../helpers/error_message";

type RegisterFormProps = {
  authAPI: IAuthAPI;
};

const initialRegistration: RegistrationUserDTO = {
  username: "",
  password: "",
  firstName: "",
  lastName: "",
};

export const RegisterForm: React.FC<RegisterFormProps> = ({ authAPI }) => {
  const [formData, setFormData] = useState<RegistrationUserDTO>(initialRegistration);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (formData.password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 8 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(formData.password)) {
      setError("Password must be at least 8 characters and include uppercase, lowercase, number and special character.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.register({
        username: formData.username.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
      });

      if (response.success) {
        setSuccess("Registration successful. Please login and choose simulation time.");
        setFormData(initialRegistration);
        setConfirmPassword("");
      } else {
        setError(response.message || "Registration failed. Please try again.");
        setFormData(initialRegistration);
        setConfirmPassword("");
      }
    } catch (error: unknown) {
      setError(getErrorMessage(error, "An error occurred. Please try again."));
      setFormData(initialRegistration);
      setConfirmPassword("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="username" style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600 }}>
          Username
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Choose a username"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="firstName" style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600 }}>
          First name
        </label>
        <input
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          placeholder="Enter first name"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="lastName" style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600 }}>
          Last name
        </label>
        <input
          id="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          placeholder="Enter last name"
          required
          disabled={isLoading}
        />
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
          placeholder="At least 8 chars, upper/lower/number/symbol"
          minLength={8}
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600 }}>
          Confirm Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setError("");
          }}
          placeholder="Re-enter your password"
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

      {success && (
        <div
          className="card"
          style={{
            padding: "12px 16px",
            backgroundColor: "rgba(16, 124, 16, 0.15)",
            borderColor: "#107c10",
          }}
        >
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="#107c10">
              <path d="M8 2a6 6 0 110 12A6 6 0 018 2zm2.354 4.146a.5.5 0 010 .708l-3 3a.5.5 0 01-.708 0l-1.5-1.5a.5.5 0 11.708-.708L7 8.793l2.646-2.647a.5.5 0 01.708 0z"/>
            </svg>
            <span style={{ fontSize: "13px", color: "var(--win11-text-primary)" }}>{success}</span>
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
            <span>Creating account...</span>
          </div>
        ) : (
          "Register"
        )}
      </button>
    </form>
  );
};
