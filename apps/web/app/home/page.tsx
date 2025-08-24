"use client"

import { axiosInstance } from "../../lib/axios"


export default function HomePage() {
  const handleLogout = async () => {
    await axiosInstance.post("/api/auth/logout")
  }
  return <div>
    Welcome to collabchain
    <br />
    <button 
      className="border"
      onClick={handleLogout}
    > 
      logout
    </button>
  </div>
}