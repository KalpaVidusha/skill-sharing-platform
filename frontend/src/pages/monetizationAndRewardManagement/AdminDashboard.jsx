import { Users, Settings, BarChart3, BookOpenCheck, BadgeDollarSign, LogOut, ShieldCheck } from 'lucide-react';
import Navbar from '../../components/Navbar';

export default function AdminDashboard() {
  return (
    <div>
        <div className="fixed">
    <Navbar />
    </div>
    <div className="flex min-h-screen bg-gray-100">
        
      {/* Sidebar */}
      <aside className="w-64 p-6 mt-8 space-y-6 text-white bg-blue-700">
        <h2 className="text-2xl font-bold">SkillSphere</h2>
        <nav className="space-y-3">
          <button className="flex items-center w-full gap-3 p-3 text-left bg-blue-800 rounded-xl">
            <ShieldCheck size={20} />
            Admin Overview
          </button>
          <button className="flex items-center w-full gap-3 p-3 text-left hover:bg-blue-800 rounded-xl">
            <Users size={20} />
            Manage Users
          </button>
          <button className="flex items-center w-full gap-3 p-3 text-left hover:bg-blue-800 rounded-xl">
            <BarChart3 size={20} />
            Site Analytics
          </button>
          <button className="flex items-center w-full gap-3 p-3 text-left hover:bg-blue-800 rounded-xl">
            <BookOpenCheck size={20} />
            Course Approvals
          </button>
          <button className="flex items-center w-full gap-3 p-3 text-left hover:bg-blue-800 rounded-xl">
            <BadgeDollarSign size={20} />
            Monetization Requests
          </button>
          <button className="flex items-center w-full gap-3 p-3 text-left hover:bg-blue-800 rounded-xl">
            <Settings size={20} />
            Settings
          </button>
        </nav>
        <button className="flex items-center w-full gap-3 p-3 mt-10 bg-red-600 rounded-xl">
          <LogOut size={20} />
          Logout
        </button>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 p-8 mt-20">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold text-gray-800">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search..."
              className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <div className="flex items-center justify-center w-10 h-10 font-bold text-white bg-blue-600 rounded-full">R</div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-white shadow-md rounded-2xl">
            <h2 className="mb-2 text-lg font-semibold text-gray-700">Total Users</h2>
            <p className="text-3xl font-bold text-blue-600">1,243</p>
          </div>
          <div className="p-6 bg-white shadow-md rounded-2xl">
            <h2 className="mb-2 text-lg font-semibold text-gray-700">Courses Pending</h2>
            <p className="text-3xl font-bold text-yellow-500">14</p>
          </div>
          <div className="p-6 bg-white shadow-md rounded-2xl">
            <h2 className="mb-2 text-lg font-semibold text-gray-700">Monetization Requests</h2>
            <p className="text-3xl font-bold text-green-500">7</p>
          </div>
        </div>

        {/* Latest Activities Section */}
        <div className="p-6 bg-white shadow-md rounded-2xl">
          <h2 className="mb-4 text-xl font-semibold text-gray-700">Recent Activities</h2>
          <ul className="space-y-3 text-gray-600">
            <li>✅ User “JaneDoe” approved for monetization</li>
            <li>🚫 Course “React Basics” rejected by reviewer</li>
            <li>👤 New user “dev_guru” signed up</li>
            <li>📈 Site traffic increased by 8% last week</li>
          </ul>
        </div>
      </main>
    </div>
    </div>
  );
}
