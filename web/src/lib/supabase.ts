// src/lib/supabase.ts
// Versão Neutralizada (Mock) para a Demonstração 100% Frontend

// Criamos um objeto falso com a mesma estrutura do Supabase.
// Assim, se algum componente esquecido tentar chamar supabase.auth.getUser(),
// a aplicação não vai quebrar.
export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe: () => {} } },
    }),
    getUser: async () => ({ data: { user: null }, error: null }),
    signOut: async () => ({ error: null }),
    signUp: async () => ({ data: { user: null }, error: null }),
    signInWithPassword: async () => ({ data: { user: null }, error: null }),
    resetPasswordForEmail: async () => ({ error: null }),
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: null }),
        order: () => ({ data: [], error: null }),
      }),
    }),
    insert: async () => ({ data: null, error: null }),
    update: async () => ({ data: null, error: null }),
    delete: async () => ({ data: null, error: null }),
  }),
} as any; // Usamos 'any' para evitar que o TypeScript reclame de tipagens ausentes
