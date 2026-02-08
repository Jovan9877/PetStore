import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IUserAPI } from "../../../api/users/IUserAPI";
import { useAuth } from "../../../hooks/useAuthHook";
import { UserDTO } from "../../../models/users/UserDTO";
 
type DashboardNavbarProps = {
  userAPI: IUserAPI;
};

export const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ userAPI }) => {
  const { user: authUser, token, logout } = useAuth();
  const [user, setUser] = useState<UserDTO | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      if (!authUser?.id || !token) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await userAPI.getUserById(token, authUser.id);
        setUser(userData);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [authUser?.id, token, userAPI]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const displayEmail = user?.email ?? authUser?.username ?? "Unknown user";
  const displayRole = user?.role ?? authUser?.role ?? "";

  return (
    <nav className="titlebar" style={{ height: "60px", borderRadius: 0 }}>
      <div className="flex items-center gap-3" style={{ marginLeft: "auto" }}>
        {isLoading ? (
          <div className="spinner" style={{ width: "16px", height: "16px", borderWidth: 2 }} />
        ) : authUser ? (
          <>
            <div className="flex flex-col" style={{ gap: 0 }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--win11-text-primary)" }}>
                {displayEmail}
              </span>
              <span style={{ fontSize: "11px", color: "var(--win11-text-tertiary)" }}>
                {displayRole}
              </span>
            </div>

            <button className="btn btn-ghost" onClick={handleLogout} style={{ padding: "8px 16px" }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M6 2v2H3v8h3v2H2V2h4zm4 3l4 3-4 3V9H6V7h4V5z"/>
              </svg>
              Logout
            </button>
          </>
        ) : null}
      </div>
    </nav>
  );
};
