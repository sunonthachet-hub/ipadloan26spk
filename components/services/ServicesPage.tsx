
import React, { useMemo } from 'react';
import type { User, ServiceRequest } from '../../types';
import { UserRole } from '../../types';
import { gasHelper } from '../../services/gasService';

interface ServicesPageProps {
  user: User;
  requests: ServiceRequest[];
  setRequests: React.Dispatch<React.SetStateAction<ServiceRequest[]>>;
  t: (key: string) => string;
  addNotification: (message: string, type: 'info' | 'success' | 'error') => void;
  logActivity: (action: string, details: string) => Promise<void>;
  sanitizeForSheet: (payload: Record<string, unknown>) => Record<string, unknown>;
}

const ServicesPage: React.FC<ServicesPageProps> = ({ user, requests, setRequests, t, addNotification, logActivity, sanitizeForSheet }) => {
  const myRequests = useMemo(() => {
    return user.role === UserRole.Admin 
      ? requests 
      : requests.filter(r => r.reportedBy === user.username);
  }, [requests, user]);

  const handleStatusChange = async (requestId: string, newStatus: 'Pending' | 'In Progress' | 'Resolved') => {
    const requestToUpdate = requests.find(r => r.id === requestId);
    if (!requestToUpdate) return;

    const payload = { id: requestId, status: newStatus };
    const result = await gasHelper('update', 'Service', sanitizeForSheet(payload));
    if (result.success) {
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: newStatus } : r));
      addNotification(`Request for ${requestToUpdate.device.name} updated to ${newStatus}.`, 'success');
      await logActivity('SERVICE_STATUS_CHANGED', `Request ${requestId} for ${requestToUpdate.device.name} changed to ${newStatus}`);
    } else {
      addNotification(`Failed to update status: ${result.error}`, 'error');
    }
  };

  const statusColors: { [key: string]: string } = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    'Resolved': 'bg-green-100 text-green-800'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <header className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">{t('services')}</h1>
        <p className="text-gray-500">Track your device repair requests</p>
      </header>
      
      <div className="space-y-4">
        {myRequests.length > 0 ? myRequests.map(req => (
          <div key={req.id} className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{req.device.name}</h3>
                <p className="text-sm text-gray-500">{req.device.serialNumber}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[req.status]}`}>
                {req.status}
              </span>
            </div>
            <p className="mt-2 text-gray-700">{req.description}</p>
            {req.repairImageUrl && (
              <a href={req.repairImageUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block">
                <img src={req.repairImageUrl} alt="Repair" className="w-24 h-24 rounded-md object-cover"/>
              </a>
            )}
            <p className="text-xs text-gray-500 mt-2">Reported by {req.reportedBy} on {new Date(req.reportedAt).toLocaleDateString()}</p>

            {user.role === UserRole.Admin && (
              <div className="mt-4 pt-4 border-t flex items-center gap-2">
                <label className="text-sm font-medium">Change Status:</label>
                <select 
                  value={req.status} 
                  onChange={(e) => handleStatusChange(req.id, e.target.value as 'Pending' | 'In Progress' | 'Resolved')}
                  className="border rounded-md p-1 text-sm focus:ring-spk-yellow focus:border-spk-yellow"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            )}
          </div>
        )) : (
          <div className="text-center py-10">
            <span className="material-icons-outlined text-6xl text-gray-300">inbox</span>
            <p className="mt-4 text-gray-500">No service requests found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;
