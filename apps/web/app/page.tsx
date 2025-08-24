"use client"

import { redirect } from "next/navigation";

export default function Page() {

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
    </div>
  );
}
