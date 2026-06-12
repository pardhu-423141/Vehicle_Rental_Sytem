import { useState, useEffect } from 'react';
import { 
  MessageSquareWarning, Search, Bell, CheckCircle2, 
  ArrowRight, Plus, X, Loader2, Trash2 
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

interface Issue {
  id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
  response: string | null;
  createdAt: string;
  vehicle: { make: string; model: string; licensePlate: string };
  reportedByAdmin: { name: string };
  assignedManager: { name: string; email: string };
}

interface Manager {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  licensePlate: string;
}

export default function IssueLogs() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    vehicleId: '',
    assignedManagerId: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [issuesRes, staffRes, vehiclesRes] = await Promise.all([
        api.get('/issues'),
        api.get('/admin/staff'),
        api.get('/admin/vehicles')
      ]);
      setIssues(issuesRes.data);
      setManagers(staffRes.data.filter((s: Manager) => s.role === 'VEHICLE_MANAGER'));
      setVehicles(vehiclesRes.data);
    } catch (error) {
      toast.error('Failed to load issue logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.vehicleId || !form.assignedManagerId) {
      toast.error('Please fill in all fields.');
      return;
    }
    setCreating(true);
    try {
      await api.post('/issues', form);
      toast.success('Issue created and manager notified via email.');
      setShowCreateModal(false);
      setForm({ title: '', description: '', vehicleId: '', assignedManagerId: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to create issue.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this issue permanently?')) return;
    try {
      await api.delete(`/issues/${id}`);
      setIssues(prev => prev.filter(i => i.id !== id));
      toast.success('Issue deleted.');
    } catch {
      toast.error('Failed to delete issue.');
    }
  };

  const filtered = issues.filter(issue => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      issue.title.toLowerCase().includes(q) ||
      issue.vehicle.licensePlate.toLowerCase().includes(q) ||
      issue.assignedManager.name.toLowerCase().includes(q);
    const matchesStatus = filterStatus === 'ALL' || issue.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl px-4 animate-in fade-in duration-700">

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-lg p-8 relative animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <MessageSquareWarning className="text-yellow-400" size={20} />
              Raise New Issue
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1 block">Issue Title</label>
                <input
                  type="text"
                  placeholder="e.g. Brake noise reported"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500 transition text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1 block">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe the issue in detail..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500 transition text-sm resize-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1 block">Vehicle</label>
                <select
                  value={form.vehicleId}
                  onChange={e => setForm({ ...form, vehicleId: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500 transition text-sm"
                >
                  <option value="" className="bg-slate-900">Select a vehicle</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id} className="bg-slate-900">
                      {v.make} {v.model} — {v.licensePlate}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1 block">Assign to Manager</label>
                <select
                  value={form.assignedManagerId}
                  onChange={e => setForm({ ...form, assignedManagerId: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500 transition text-sm"
                >
                  <option value="" className="bg-slate-900">Select a manager</option>
                  {managers.map(m => (
                    <option key={m.id} value={m.id} className="bg-slate-900">
                      {m.name} ({m.email})
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={creating}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {creating ? <Loader2 className="animate-spin" size={18} /> : <Bell size={18} />}
                {creating ? 'Sending...' : 'Raise Issue & Notify Manager'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Issue & Communication Logs</h1>
          <p className="text-gray-400 mt-2">Admin-to-Manager issue tracking and resolution history.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-lg shadow-blue-900/40 shrink-0"
        >
          <Plus size={18} /> Raise New Issue
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by title, plate, or manager..."
            className="w-full pl-11 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {['ALL', 'OPEN', 'ACKNOWLEDGED', 'RESOLVED'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition border ${
                filterStatus === s
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-gray-400 text-[10px] uppercase tracking-[0.2em] border-b border-white/10">
                <th className="px-6 py-5 font-bold">Issue Details</th>
                <th className="px-6 py-5 font-bold">Communication Path</th>
                <th className="px-6 py-5 font-bold">Manager Response</th>
                <th className="px-6 py-5 font-bold">Created</th>
                <th className="px-6 py-5 font-bold">Status</th>
                <th className="px-6 py-5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length > 0 ? filtered.map(issue => (
                <tr key={issue.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-400 shrink-0">
                        <MessageSquareWarning size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{issue.title}</div>
                        <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-0.5">
                          {issue.vehicle.make} {issue.vehicle.model} — {issue.vehicle.licensePlate}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 max-w-[200px] truncate">{issue.description}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <span className="font-semibold text-white">{issue.reportedByAdmin.name}</span>
                      <ArrowRight size={12} className="text-gray-500" />
                      <span className="font-semibold text-blue-300">{issue.assignedManager.name}</span>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    {issue.response ? (
                      <p className="text-xs text-green-300 max-w-[180px] truncate" title={issue.response}>
                        {issue.response}
                      </p>
                    ) : (
                      <span className="text-xs text-gray-600 italic">Awaiting response</span>
                    )}
                  </td>

                  <td className="px-6 py-5 text-xs text-gray-400">
                    {new Date(issue.createdAt).toLocaleString([], {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </td>

                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                      issue.status === 'RESOLVED'
                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                        : issue.status === 'ACKNOWLEDGED'
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        : 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse'
                    }`}>
                      {issue.status}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-right">
                    <button
                      onClick={() => handleDelete(issue.id)}
                      className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-all"
                      title="Delete issue"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <CheckCircle2 size={36} className="text-gray-600 mx-auto mb-3" />
                    <p className="text-white font-bold">No issues found</p>
                    <p className="text-gray-400 text-sm mt-1">
                      {searchTerm || filterStatus !== 'ALL' ? 'Try adjusting your filters.' : 'All clear — no issues raised yet.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 p-6 bg-blue-600/10 border border-blue-400/20 rounded-2xl flex items-start gap-4">
        <Bell size={24} className="text-blue-400 shrink-0 mt-1" />
        <div>
          <h4 className="text-white font-bold mb-1 uppercase text-xs tracking-widest">How Issue Tracking Works</h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            When an Admin raises an issue, the assigned Vehicle Manager receives an email notification immediately.
            The manager then logs in, acknowledges the issue, and responds with updates until it is resolved.
          </p>
        </div>
      </div>
    </div>
  );
}
