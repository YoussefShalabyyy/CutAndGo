export const authService = {
  // Send OTP to phone number
  sendOTP: async (phone: string) => {
    return { messageId: "mock-123" };
  },

  // Verify the submitted OTP
  verifyOTP: async (phone: string, token: string) => {
    return {
      session: { access_token: "mock-token" },
      user: { id: "mock-user" },
    };
  },

  // Get current session
  getSession: async () => {
    return { access_token: "mock-token", user: { id: "mock-user" } };
  },

  // Logout
  signOut: async () => {
    return;
  },
};
