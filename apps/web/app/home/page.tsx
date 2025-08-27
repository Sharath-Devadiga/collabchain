"use client"

import { Loader2 } from "lucide-react"
import { useAuthStore } from "../../stores/auth-store/useAuthStore"
import { useRouter } from "next/navigation"
import { axiosInstance } from "../../lib/axios"


export default function HomePage() {
  const {  isLoggingOut } = useAuthStore()
  const router = useRouter()
  const handleLogout = async () => {
    await axiosInstance.post("/api/auth/logout")
    router.push("/")
  }
  const fetchTeams = () => {
    axiosInstance.get("/api/auth/user")
  }
  
  return <div>
    <div>
      Welcome to collabchain
        
      <br />
      <button 
        className="border px-3 py-2 rounded-md"
        onClick={handleLogout}
      > 
        {
          isLoggingOut ? 
            <div className="flex gap-2 items-center">
              Logging out...<Loader2 className="animate-spin size-5" />
            </div> : 
            "Logout"
        }
      </button>
    </div>
    <button className="border px-3 py-2 rounded-md" onClick={fetchTeams}>
      fetch teams
    </button>
  </div>
}