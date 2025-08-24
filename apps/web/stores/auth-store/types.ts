export type User = {
  id: number;
  username: string;
  email: string;
};

export type AuthStore = {
  user: User | null;
  fetchUser: () => Promise<void>;
  logout: () => void;
};