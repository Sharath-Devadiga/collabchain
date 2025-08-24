export type User = {
  id: number;
  username: string;
  email: string;
};

export type AuthStore = {
  authUser: User | null;
  isLoggingOut: boolean;
  
  fetchUser: () => void;
  logout: () => void;
};