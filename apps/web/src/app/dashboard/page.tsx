import { SignOutButton, UserButton } from '@clerk/nextjs'

export default function TempDashboard() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
      <h1 className="text-2xl font-bold mb-6">Temporary Dashboard</h1>
      <p className="mb-8 text-zinc-400">You are currently signed in.</p>
      
      <div className="flex gap-4 items-center">
        <UserButton />
        
        <SignOutButton>
          <button className="bg-red-500/20 text-red-500 hover:bg-red-500/30 px-4 py-2 rounded-lg transition">
            Force Sign Out
          </button>
        </SignOutButton>
      </div>
    </div>
  )
}
