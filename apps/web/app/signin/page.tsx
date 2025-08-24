// components/SignIn.tsx
'use client'

import { API_URL } from '../../lib/config';

export default function SignIn() {
  const handleSignIn = () => {
      window.location.href = `${API_URL}/api/auth/github/signin`;
    };
  
    return (
      <button
        onClick={handleSignIn}
        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
      >
        Sign in with GitHub
      </button>
    );
}
