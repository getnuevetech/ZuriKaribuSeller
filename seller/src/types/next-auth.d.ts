declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: string;
      isSuperAdmin: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    role: string;
    isSuperAdmin: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    isSuperAdmin: boolean;
  }
}
