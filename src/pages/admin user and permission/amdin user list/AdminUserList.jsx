import { useState } from 'react'
import { useNavigate } from 'react-router'

const adminUsers = [
  { name: 'John Doe', role: 'Super Admin', id: 'USR-1001', status: 'Allowed' },
  { name: 'Suzy Cue', role: 'Fleet Acct Mgmt', id: 'USR-1785', status: 'Allowed' },
  { name: 'G. I. Joe', role: 'Customer Support', id: 'USR-1513', status: 'Locked' },
  { name: 'Tom Thumb', role: 'Revenue Metrics', id: 'USR-2549', status: 'Allowed' },
  { name: 'Jimmy Hendrix', role: 'Subscription Mgmt', id: 'USR-8391', status: 'Allowed' },
  { name: 'Sponge Bob', role: 'Audit Log Mgmt', id: 'USR-0127', status: 'Allowed' },
  { name: 'Robin Hood', role: 'Marketing', id: 'USR-4567', status: 'Allowed' },
]

const actionButtonClass =
  'w-36 rounded-full bg-[#888] px-3 py-1 text-center text-[10px] text-white  cursor-pointer'

const AdminUserList = () => {
  const [selectedUsers, setSelectedUsers] = useState([])
  const navigate = useNavigate()

  const toggleUser = (userId) => {
    setSelectedUsers((currentUsers) =>
      currentUsers.includes(userId)
        ? currentUsers.filter((selectedId) => selectedId !== userId)
        : [...currentUsers, userId],
    )
  }

  const toggleAllUsers = () => {
    setSelectedUsers((currentUsers) =>
      currentUsers.length === adminUsers.length ? [] : adminUsers.map((user) => user.id),
    )
  }

  return (
    <div className="min-h-full  px-2 py-2 text-[#888] md:px-10 md:py-4">
      <div className="mb-16 flex items-center justify-between">
        <h1 className="text-xl font-normal text-[#999] md:text-2xl">Admin user list</h1>
        <button
          type="button"
          onClick={() => navigate('/dashboard/add-user')}
          className={actionButtonClass}
        >
          ADD ADMIN USER <span className="font-bold">+</span>
        </button>
      </div>

      <div className="mb-2 flex items-center gap-1 text-[11px]">
        <label htmlFor="admin-action">Action:</label>
        <select
          id="admin-action"
          defaultValue=""
          className="h-6 w-48 border border-[#ccc] bg-white px-1 text-[11px] text-[#777]"
        >
          <option value="">-----------</option>
          <option value="delete">Delete selected</option>
          <option value="lock">Lock selected</option>
          <option value="unlock">Unlock selected</option>
        </select>
        <button type="button" className="h-6 border border-[#ccc] bg-[#f2f2f2] px-2 text-[10px] cursor-pointer">
          Go
        </button>
        <span className="ml-2">{selectedUsers.length} of 7 selected</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px] border-collapse text-left text-[11px]">
          <thead>
            <tr className="h-7 bg-[#f5f5f5] text-[10px] font-semibold uppercase text-[#999]">
              <th className="w-8 px-2">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === adminUsers.length}
                  onChange={toggleAllUsers}
                  aria-label="Select all admin users"
                />
              </th>
              <th className="px-2">Admin users</th>
              <th className="px-2">User role</th>
              <th className="px-2">User ID</th>
              <th className="px-2">Access status</th>
            </tr>
          </thead>
          <tbody>
            {adminUsers.map((user) => (
              <tr key={user.id} className="h-7 border-b border-white bg-[#f5f5f5] even:bg-[#fafafa]">
                <td className="px-2">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => toggleUser(user.id)}
                    aria-label={`Select ${user.name}`}
                  />
                </td>
                <td className="px-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/dashboard/edit-user/${user.id}`)}
                    className="underline underline-offset-2 hover:text-[#ff823d] cursor-pointer"
                  >
                    {user.name}
                  </button>
                </td>
                <td className="px-2">{user.role}</td>
                <td className="px-2">{user.id}</td>
                <td className="px-2">{user.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 border-b border-[#eee] pb-3 text-[11px]">7 admin users</p>
    </div>
  )
}

export default AdminUserList
