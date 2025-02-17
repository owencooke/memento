import React from "react";
import { AuthContext, UserSession } from "@/src/context/AuthContext";

type MockUserSession = Omit<
  UserSession["session"],
  "app_metadata" | "aud" | "created_at"
>;

const mockSession: Partial<MockUserSession> = {
  user: {
    user_metadata: {
      id: "123456",
      full_name: "Test User",
      avatar_url: "https://example.com/avatar.png",
    },
    id: "123456",
  },
};

export const MockAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <AuthContext.Provider
      value={{
        session: mockSession as UserSession["session"],
        isLoading: false,
        signIn: async () => {},
        signOut: async () => {},
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
