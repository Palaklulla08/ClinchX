
// import { createLovableAuth } from "@Lovable.dev/cloud-auth-js";
// import { supabase } from "../Supabase/client.js";

// const LovableAuth = createLovableAuth();

// export const Lovable = {
//   auth: {
//     signInWithOAuth: async (provider, opts) => {
//       const result = await LovableAuth.signInWithOAuth(provider, {
//         redirect_uri: opts?.redirect_uri,
//         extraParams: {
//           ...opts?.extraParams,
//         },
//       });

//       if (result.redirected) {
//         return result;
//       }

//       if (result.error) {
//         return result;
//       }

//       try {
//         await supabase.auth.setSession(result.tokens);
//       } catch (e) {
//         return { error: e instanceof Error ? e : new Error(String(e)) };
//       }

//       return result;
//     },
//   },
// };
export const Lovable = {
  signIn: async () => null,
  signOut: async () => null,
  getUser: async () => null,
};