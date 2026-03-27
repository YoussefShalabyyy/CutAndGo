import { supabase } from '@/lib/supabase';

export const socialAuthService = {
  // We use standard email signup behind the scenes just to get
  // a real Supabase session so your RLS policies for booking succeed.
  // We'll replace this with real OAuth logic when you get the Client IDs.
  mockSocialSignIn: async (provider: 'google' | 'apple') => {
    const mockEmail = `test_${provider}_${Date.now()}@example.com`;
    const mockPassword = 'SecurePassword123!';

    // Sign up the mock user 
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: mockEmail,
      password: mockPassword,
      options: {
        data: {
          full_name: `${provider} User`,
        }
      }
    });

    if (signUpError) throw new Error(signUpError.message);

    // Some Supabase configurations don't auto-sign-in on signup without email verifications
    // If it doesn't return a session but requires email confirmation, this will error 
    // unless you disabled "Confirm email" in Supabase -> Authentication -> Providers -> Email
    // Let's assume Confirm Email is off since this is a dev DB, or we'll sign in.
    if (signUpData.session) {
      return signUpData.session;
    }

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
       email: mockEmail,
       password: mockPassword
    });

    if (signInError) throw new Error(signInError.message);
    
    return signInData.session;
  }
};
