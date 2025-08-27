"use client"

import { redirect } from "next/navigation";
import { axiosInstance } from "../lib/axios";

export default function Page() {
  const fetchTeams = () => {
    axiosInstance.get("/api/user/team/fetch-teams")
  }
  return (
    <div className="">
      Collabchain
      <br />
      <button
        className="border px-3 py-2 rounded-md" 
        onClick={() => {
        redirect("/signin")
      }} >
        Sign In
      </button>
      <button className="border px-3 py-2 rounded-md" onClick={fetchTeams}>
        fetch teams
      </button>
    </div>
  );
}
