export const socialAuthService = {
  // We'll replace this with real OAuth logic when you get the Client IDs.
  mockSocialSignIn: async (provider: "google" | "apple") => {
    return { access_token: "mock-token", user: { id: "mock-user" } };
  },
};
