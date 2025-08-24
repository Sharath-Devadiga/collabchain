"use client"

import { Loader2 } from "lucide-react"
import { useAuthStore } from "../../stores/auth-store/useAuthStore"
import { ProtectedRoute } from "../../components/protected-route"


export default function HomePage() {
  const { logout, isLoggingOut } = useAuthStore()
  
  return <ProtectedRoute>
    <div>
      Welcome to collabchain
        
      <br />
      <button 
        className="border px-3 py-2 rounded-md"
        onClick={logout}
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
  </ProtectedRoute>
}