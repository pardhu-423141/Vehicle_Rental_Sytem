import { useState, useEffect } from 'react';
import {
  MessageSquareWarning, CheckCircle2, Clock,
  Loader2, Send, ChevronDown, ChevronUp, Car
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

interface Issue {
  id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
  response: string | null;
  createdAt: string;
  vehicle: { make: string; model: string; licensePlate: string };
  reportedByAdmin: { name: string };
}

export default function IssueInbox() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/issues/inbox');
      setIssues(data);
    } catch (error) {
      toast.error('Failed to load your issue inbox.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleUpdate = async (issueId: string, newStatus: 'ACKNOWLEDGED' | 'RESOLVED') => {
    setUpdating(issueId);
    try {
      const response = responses[issueId] || '';
      await api.put(`/issues/${issueId}`, { status: newStatus, response });

      setIssues(prev =>
        prev.map(i =>
          i.id === issueId ? { ...i, status: newStatus, response: response || i.response } : i
        )
      );

      if (newStatus === 'RESOLVED') {
        toast.success('Issue resolved. Admin has been notified.');
      } else {
        toast.success('Issue acknowledged. Admin has been notified.');
      }
    } catch (error) {
      toast.error('Failed to update issue.');
    } finally {
      setUpdating(null);
    }
  };

  const openCount = issues.filter(i => i.status === 'OPEN').length;
  const acknowledgedCount = issues.filter(i => i.status === 'ACKNOWLEDGED').length;

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pt-8 pb-12 animate-in fade-in duration-700">

      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <MessageSquareWarning className="text-yellow-400" size={30} /> Issue Inbox
          </h1>
          <p className="text-gray-400 mt-2">Issues assigned to you by the admin. Acknowledge and respond.</p>
        </div>

        <div className="flex gap-4 shrink-0">
          <div className="px-5 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
            <p className="text-2xl font-bold text-red-400 leading-none">{openCount}</p>
            <p className="text-[10px] text-red-500/70 uppercase tracking-widest font-bold mt-1">Open</p>
          </div>
          <div className="px-5 py-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-center">
            <p className="text-2xl font-bold text-blue-400 leading-none">{acknowledgedCount}</p>
            <p className="text-[10px] text-blue-500/70 uppercase tracking-widest font-bold mt-1">Acknowledged</p>
          </div>
        </div>
      </div>

      {/* Issue List */}
      <div className="space-y-4">
        {issues.length > 0 ? issues.map(issue => (
          <div
            key={issue.id}
            className={`bg-white/5 backdrop-blur-xl border rounded-3xl overflow-hidden shadow-xl transition-all duration-300 ${
              issue.status === 'RESOLVED'
                ? 'border-green-500/20 opacity-70'
                : issue.status === 'ACKNOWLEDGED'
                ? 'border-blue-500/20'
                : 'border-red-500/20'
            }`}
          >
            {/* Issue Header Row */}
            <div
              className="p-6 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition"
              onClick={() => setExpandedId(expandedId === issue.id ? null : issue.id)}
            >
              <div className={`p-2.5 rounded-xl shrink-0 ${
                issue.status === 'RESOLVED' ? 'bg-green-500/20 text-green-400' :
                issue.status === 'ACKNOWLEDGED' ? 'bg-blue-500/20 text-blue-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                <MessageSquareWarning size={20} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-base font-bold text-white">{issue.title}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                    issue.status === 'RESOLVED'
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : issue.status === 'ACKNOWLEDGED'
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      : 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse'
                  }`}>
                    {issue.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Car size={12} /> {issue.vehicle.make} {issue.vehicle.model} · {issue.vehicle.licensePlate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {new Date(issue.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                  <span>From: <span className="text-white font-medium">{issue.reportedByAdmin.name}</span></span>
                </div>
              </div>

              <div className="text-gray-400 shrink-0">
                {expandedId === issue.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>

            {/* Expanded Detail Panel */}
            {expandedId === issue.id && (
              <div className="px-6 pb-6 border-t border-white/10 pt-5 animate-in fade-in duration-200">
                <div className="mb-4">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Issue Description</p>
                  <p className="text-gray-200 text-sm leading-relaxed">{issue.description}</p>
                </div>

                {issue.response && (
                  <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <p className="text-[10px] text-green-400 uppercase tracking-widest font-bold mb-1">Your Previous Response</p>
                    <p className="text-sm text-gray-200">{issue.response}</p>
                  </div>
                )}

                {issue.status !== 'RESOLVED' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1 block">
                        {issue.status === 'ACKNOWLEDGED' ? 'Update your response' : 'Add a response (optional)'}
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Describe what action you are taking or have taken..."
                        value={responses[issue.id] || ''}
                        onChange={e => setResponses(prev => ({ ...prev, [issue.id]: e.target.value }))}
                        className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500 transition text-sm resize-none"
                      />
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {issue.status === 'OPEN' && (
                        <button
                          onClick={() => handleUpdate(issue.id, 'ACKNOWLEDGED')}
                          disabled={updating === issue.id}
                          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 font-bold rounded-xl transition text-sm disabled:opacity-50"
                        >
                          {updating === issue.id ? <Loader2 className="animate-spin" size={16} /> : <Clock size={16} />}
                          Acknowledge
                        </button>
                      )}
                      <button
                        onClick={() => handleUpdate(issue.id, 'RESOLVED')}
                        disabled={updating === issue.id}
                        className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition text-sm disabled:opacity-50 shadow-lg shadow-green-900/30"
                      >
                        {updating === issue.id ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                        Mark as Resolved
                      </button>
                    </div>
                  </div>
                )}

                {issue.status === 'RESOLVED' && (
                  <div className="flex items-center gap-2 text-green-400 text-sm font-bold">
                    <CheckCircle2 size={18} /> This issue has been resolved.
                  </div>
                )}
              </div>
            )}
          </div>
        )) : (
          <div className="py-20 text-center border border-dashed border-white/10 rounded-3xl bg-white/5">
            <CheckCircle2 size={48} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-1">Inbox Zero!</h3>
            <p className="text-gray-400">No issues have been assigned to you.</p>
          </div>
        )}
      </div>
    </div>
  );
}
