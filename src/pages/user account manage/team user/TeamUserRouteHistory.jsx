import { useNavigate, useParams } from 'react-router'

const TeamUserRouteHistory = () => {
  const navigate = useNavigate()
  const { userEmail } = useParams()

  return (
    <main className="min-h-full bg-white px-2 py-3 text-sm text-[#777] md:px-8 md:py-6">
      <button type="button" onClick={() => navigate(-1)} className="mb-5 underline cursor-pointer">Back to team users</button>
      <h1 className="mb-2 text-xl font-normal text-[#999] md:text-2xl">Route history</h1>
      <p>Routes created by <strong className="text-[#444]">{userEmail}</strong></p>
      <div className="mt-5 border border-[#eee] bg-[#fafafa] p-4">No routes found for this driver.</div>
    </main>
  )
}

export default TeamUserRouteHistory
