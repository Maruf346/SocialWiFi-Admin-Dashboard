import { useNavigate, useParams } from 'react-router'

const FleetUserRouteHistory = () => {
  const navigate = useNavigate()
  const { userEmail } = useParams()

  return (
    <main className="min-h-full bg-white px-2 py-3 text-sm text-[#777] md:px-5 md:py-4">
      <button type="button" onClick={() => navigate(-1)} className="mb-5 underline">Back to fleet user</button>
      <h1 className="mb-2 text-xl font-normal text-[#999]">Route history</h1>
      <p>Routes created by <strong className="text-[#444]">{userEmail}</strong></p>
      <div className="mt-5 border border-[#eee] bg-[#fafafa] p-4">No routes found for this driver.</div>
    </main>
  )
}

export default FleetUserRouteHistory