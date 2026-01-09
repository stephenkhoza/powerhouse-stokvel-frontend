import React, { useState, useEffect } from 'react';
import { Users, DollarSign, Bell, Home, LogOut, Eye, EyeOff, Plus, Trash2, Save, X, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { authAPI, membersAPI, contributionsAPI, announcementsAPI, statsAPI } from './services/api';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [members, setMembers] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [stats, setStats] = useState({ totalSaved: 0, monthsContributed: 0, estimatedPayout: 0 });
  const [showBankDetails, setShowBankDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddContribution, setShowAddContribution] = useState(false);
  const [showAddAnnouncement, setShowAddAnnouncement] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  // Load data when user logs in
  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load contributions
      const contribRes = await contributionsAPI.getAll();
      setContributions(contribRes.data);

      // Load announcements
      const announceRes = await announcementsAPI.getAll();
      setAnnouncements(announceRes.data);

      // Load members if admin
      if (currentUser.role === 'admin') {
        const membersRes = await membersAPI.getAll();
        setMembers(membersRes.data);
      }

      // Load stats
      const statsRes = await statsAPI.getMemberStats(currentUser.id);
      setStats(statsRes.data);

      setError(null);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.login(email, password);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    setCurrentUser(null);
    setActiveTab('home');
    setMembers([]);
    setContributions([]);
    setAnnouncements([]);
    setError(null);
  };

  const addMember = async (memberData) => {
    try {
      setLoading(true);
      await membersAPI.create(memberData);
      await loadData();
      setShowAddMember(false);
      setError(null);
    } catch (err) {
      console.error('Error adding member:', err);
      setError(err.response?.data?.error || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const deleteMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to delete this member?')) return;
    
    try {
      setLoading(true);
      await membersAPI.delete(memberId);
      await loadData();
      setError(null);
    } catch (err) {
      console.error('Error deleting member:', err);
      setError('Failed to delete member');
    } finally {
      setLoading(false);
    }
  };

  const addContribution = async (contributionData) => {
    try {
      setLoading(true);
      await contributionsAPI.create(contributionData);
      await loadData();
      setShowAddContribution(false);
      setError(null);
    } catch (err) {
      console.error('Error adding contribution:', err);
      setError('Failed to add contribution');
    } finally {
      setLoading(false);
    }
  };

  const updateContributionStatus = async (contributionId, status) => {
    try {
      setLoading(true);
      await contributionsAPI.updateStatus(contributionId, status);
      await loadData();
      setError(null);
    } catch (err) {
      console.error('Error updating contribution:', err);
      setError('Failed to update contribution');
    } finally {
      setLoading(false);
    }
  };

  const addAnnouncement = async (announcementData) => {
    try {
      setLoading(true);
      await announcementsAPI.create(announcementData);
      await loadData();
      setShowAddAnnouncement(false);
      setError(null);
    } catch (err) {
      console.error('Error adding announcement:', err);
      setError('Failed to add announcement');
    } finally {
      setLoading(false);
    }
  };

  const deleteAnnouncement = async (announcementId) => {
    if (!window.confirm('Delete this announcement?')) return;
    
    try {
      setLoading(true);
      await announcementsAPI.delete(announcementId);
      await loadData();
      setError(null);
    } catch (err) {
      console.error('Error deleting announcement:', err);
      setError('Failed to delete announcement');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} error={error} loading={loading} />;
  }

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">The Powerhouse Stokvel Club</h1>
              <p className="text-green-100 text-sm">Save Together - Grow Together - Succeed Together!</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-medium">{currentUser.name}</p>
                <p className="text-sm text-green-100">{currentUser.id}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-white text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 flex items-center gap-2 transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
            <div className="flex items-center gap-2">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            <NavButton
              icon={<Home size={18} />}
              label="Dashboard"
              active={activeTab === 'home'}
              onClick={() => setActiveTab('home')}
            />
            {isAdmin && (
              <NavButton
                icon={<Users size={18} />}
                label="Members"
                active={activeTab === 'members'}
                onClick={() => setActiveTab('members')}
              />
            )}
            <NavButton
              icon={<DollarSign size={18} />}
              label="Contributions"
              active={activeTab === 'contributions'}
              onClick={() => setActiveTab('contributions')}
            />
            <NavButton
              icon={<Bell size={18} />}
              label="Announcements"
              active={activeTab === 'announcements'}
              onClick={() => setActiveTab('announcements')}
            />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading && (
          <div className="flex justify-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        )}

        {activeTab === 'home' && (
          <DashboardTab
            currentUser={currentUser}
            stats={stats}
            contributions={contributions}
            announcements={announcements}
          />
        )}
        {activeTab === 'members' && isAdmin && (
          <MembersTab
            members={members}
            contributions={contributions}
            showBankDetails={showBankDetails}
            setShowBankDetails={setShowBankDetails}
            onAddMember={() => setShowAddMember(true)}
            onDeleteMember={deleteMember}
          />
        )}
        {activeTab === 'contributions' && (
          <ContributionsTab
            currentUser={currentUser}
            contributions={contributions}
            members={members}
            isAdmin={isAdmin}
            onAddContribution={() => setShowAddContribution(true)}
            onUpdateStatus={updateContributionStatus}
          />
        )}
        {activeTab === 'announcements' && (
          <AnnouncementsTab
            announcements={announcements}
            isAdmin={isAdmin}
            onAddAnnouncement={() => setShowAddAnnouncement(true)}
            onDeleteAnnouncement={deleteAnnouncement}
          />
        )}
      </main>

      {/* Modals */}
      {showAddMember && (
        <AddMemberModal
          onClose={() => setShowAddMember(false)}
          onSave={addMember}
        />
      )}
      {showAddContribution && (
        <AddContributionModal
          members={members}
          onClose={() => setShowAddContribution(false)}
          onSave={addContribution}
        />
      )}
      {showAddAnnouncement && (
        <AddAnnouncementModal
          onClose={() => setShowAddAnnouncement(false)}
          onSave={addAnnouncement}
        />
      )}
    </div>
  );
}

// Login Screen Component
const LoginScreen = ({ onLogin, error, loading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    if (!email || !password) return;
    await onLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Powerhouse Stockvel</h1>
          <p className=" text-2xl font-bold text-gray-600  mt-2">Login</p>

          
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="your.email@example.com"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          {/* <p className="text-sm text-blue-800 font-medium mb-2">Demo Credentials:</p>
          <p className="text-xs text-blue-700">Admin: thabo@example.com / admin123</p>
          <p className="text-xs text-blue-700">Member: zanele@example.com / member123</p> */}
        </div>
      </div>
    </div>
  );
};

// Navigation Button Component
const NavButton = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
      active
        ? 'text-green-600 border-b-2 border-green-600'
        : 'text-gray-600 hover:text-green-600'
    }`}
  >
    {icon}
    {label}
  </button>
);

// Dashboard Tab Component
const DashboardTab = ({ currentUser, stats, contributions, announcements }) => {
  const myContributions = contributions.filter(c => c.member_id === currentUser.id);
  const recentAnnouncements = announcements.slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Hi, {currentUser.name.split(' ')[0]}!
        </h2>
        <p className="text-gray-600">Here's your stokvel overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Saved"
          value={`R ${stats.totalSaved?.toLocaleString() || 0}`}
          subtitle={`${stats.monthsContributed || 0} months contributed`}
          color="green"
        />
        <StatCard
          title="Estimated Payout"
          value={`R ${stats.estimatedPayout?.toLocaleString() || 0}`}
          subtitle="Between 10 and 15 December 2026"
          color="blue"
        />
        <StatCard
          title="Membership Status"
          value={currentUser.status}
          subtitle={`ID: ${currentUser.id}`}
          color="purple"
        />
      </div>

      {/* Recent Contributions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Contributions</h3>
        <div className="space-y-3">
          {myContributions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No contributions yet</p>
          ) : (
            myContributions.slice(0, 5).map(contrib => (
              <div key={contrib.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{contrib.month}</p>
                  <p className="text-sm text-gray-600">R {contrib.amount}</p>
                </div>
                <StatusBadge status={contrib.status} />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Announcements */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Latest Announcements</h3>
        <div className="space-y-3">
          {recentAnnouncements.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No announcements yet</p>
          ) : (
            recentAnnouncements.map(announcement => (
              <div key={announcement.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Bell className="text-green-600 mt-1" size={20} />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{announcement.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{announcement.message}</p>
                    <p className="text-xs text-gray-500 mt-2">{announcement.announcement_date}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Members Tab Component
const MembersTab = ({ members, contributions, showBankDetails, setShowBankDetails, onAddMember, onDeleteMember }) => {
  const toggleBankDetails = (memberId) => {
    setShowBankDetails(prev => ({
      ...prev,
      [memberId]: !prev[memberId]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Member Management</h2>
          <p className="text-gray-600">Total Members: {members.length}</p>
        </div>
        <button
          onClick={onAddMember}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          Add Member
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Banking</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {members.map(member => {
                const memberContribs = contributions.filter(c => c.member_id === member.id);
                const totalPaid = memberContribs.filter(c => c.status === 'Paid').length;
                
                return (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-800">{member.name}</p>
                        <p className="text-sm text-gray-600">{member.id}</p>
                        <p className="text-xs text-gray-500">ID: {member.id_number?.substring(0, 6)}***</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-800">{member.phone}</p>
                        <p className="text-gray-600">{member.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={member.status} />
                      <p className="text-xs text-gray-600 mt-1">{totalPaid} payments</p>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleBankDetails(member.id)}
                        className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 transition-colors"
                      >
                        {showBankDetails[member.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                        {showBankDetails[member.id] ? 'Hide' : 'View'}
                      </button>
                      {showBankDetails[member.id] && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs space-y-1">
                          <p className="font-medium text-red-700 mb-2">🔒 FOR CLUB USE ONLY - POPIA Protected</p>
                          <p><span className="font-medium">Bank:</span> {member.bank_name}</p>
                          <p><span className="font-medium">Holder:</span> {member.account_holder}</p>
                          <p><span className="font-medium">Account:</span> {member.account_number}</p>
                          <p><span className="font-medium">Branch:</span> {member.branch_code}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => onDeleteMember(member.id)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                        title="Delete member"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Contributions Tab Component
const ContributionsTab = ({ currentUser, contributions, members, isAdmin, onAddContribution, onUpdateStatus }) => {
  const displayContributions = isAdmin 
    ? contributions 
    : contributions.filter(c => c.member_id === currentUser.id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Contributions</h2>
          <p className="text-gray-600">Monthly contribution: R300 and above</p>
        </div>
        {isAdmin && (
          <button
            onClick={onAddContribution}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
          >
            <Plus size={18} />
            Add Contribution
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Paid</th>
                {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {displayContributions.map(contrib => {
                const member = members.find(m => m.id === contrib.member_id);
                return (
                  <tr key={contrib.id} className="hover:bg-gray-50">
                    {isAdmin && (
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {member?.name || 'Unknown'}
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm text-gray-800">{contrib.month}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">R {contrib.amount}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={contrib.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{contrib.date_paid || '-'}</td>
                    {isAdmin && (
                      <td className="px-6 py-4 flex gap-2">
                        {contrib.status !== 'Paid' && (
                          <button
                            onClick={() => onUpdateStatus(contrib.id, 'Paid')}
                            className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 text-xs"
                          >
                            Mark Paid
                          </button>
                        )}
                        {contrib.status !== 'Pending' && (
                          <button
                            onClick={() => onUpdateStatus(contrib.id, 'Pending')}
                            className="bg-yellow-400 text-white px-3 py-1 rounded-lg hover:bg-yellow-500 text-xs"
                          >
                            Mark Pending
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
              {displayContributions.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 6 : 4} className="text-center text-gray-500 py-4">
                    No contributions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Announcements Tab Component
const AnnouncementsTab = ({ announcements, isAdmin, onAddAnnouncement, onDeleteAnnouncement }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Announcements</h2>
        {isAdmin && (
          <button
            onClick={onAddAnnouncement}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
          >
            <Plus size={18} />
            Add Announcement
          </button>
        )}
      </div>

      <div className="space-y-4">
        {announcements.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No announcements yet</p>
        ) : (
          announcements.map(a => (
            <div key={a.id} className="bg-white rounded-xl shadow-md p-4 flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-800">{a.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{a.message}</p>
                <p className="text-xs text-gray-500 mt-2">{a.announcement_date}</p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => onDeleteAnnouncement(a.id)}
                  className="text-red-600 hover:text-red-700"
                  title="Delete announcement"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const colors = {
    Paid: 'bg-green-100 text-green-800',
    Pending: 'bg-yellow-100 text-yellow-800',
    Overdue: 'bg-red-100 text-red-800',
    Active: 'bg-green-100 text-green-800',
    Inactive: 'bg-gray-100 text-gray-800',
  };
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

// Stat Card Component
const StatCard = ({ title, value, subtitle, color }) => {
  const colors = {
    green: 'bg-green-50 text-green-700',
    blue: 'bg-blue-50 text-blue-700',
    purple: 'bg-purple-50 text-purple-700',
  };
  return (
    <div className={`p-6 rounded-xl shadow-md ${colors[color] || 'bg-gray-50 text-gray-700'}`}>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
};


// Add Member Modal
const AddMemberModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    idNumber: '',
    phone: '',
    email: '',
    password: 'member123',
    status: 'Active',
    role: 'member',
    bankName: '',
    accountHolder: '',
    accountNumber: '',
    branchCode: ''
  });

  const handleSave = () => {
    if (!formData.name || !formData.email || !formData.idNumber) {
      alert('Please fill in all required fields');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-800">Add New Member</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ID Number *</label>
              <input
                type="text"
                value={formData.idNumber}
                onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="9001011234567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="082 123 4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="text"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Default: member123"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="font-medium text-gray-800 mb-3">Banking Details (POPIA Protected)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="FNB, Standard Bank, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder</label>
                <input
                  type="text"
                  value={formData.accountHolder}
                  onChange={(e) => setFormData({...formData, accountHolder: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Account holder name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="1234567890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Branch Code</label>
                <input
                  type="text"
                  value={formData.branchCode}
                  onChange={(e) => setFormData({...formData, branchCode: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="250655"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t flex justify-end gap-3 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
          >
            <Save size={18} />
            Save Member
          </button>
        </div>
      </div>
    </div>
  );
};

// Add Contribution Modal
const AddContributionModal = ({ members, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    memberId: '',
    month: '',
    amount: 300,
    status: 'Pending',
    date: null
  });

  const handleSave = () => {
    if (!formData.memberId || !formData.month) {
      alert('Please fill in all required fields');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Add Contribution</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Member *</label>
            <select
              value={formData.memberId}
              onChange={(e) => setFormData({...formData, memberId: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select Member</option>
              {members.map(member => (
                <option key={member.id} value={member.id}>{member.name} ({member.id})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Month *</label>
            <input
              type="text"
              value={formData.month}
              onChange={(e) => setFormData({...formData, month: e.target.value})}
              placeholder="e.g., January 2026"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount (R)</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
            </select>
          </div>
        </div>

        <div className="p-6 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
          >
            <Save size={18} />
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

// Add Announcement Modal
const AddAnnouncementModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'normal'
  });

  const handleSave = () => {
    if (!formData.title || !formData.message) {
      alert('Please fill in all required fields');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Add Announcement</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Announcement title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Announcement message"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({...formData, priority: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div className="p-6 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
          >
            <Save size={18} />
            Save
          </button>
        </div>
      </div>
    </div>
  );
};




export default App;
