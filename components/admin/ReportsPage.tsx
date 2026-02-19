
import React from 'react';
import type { HistoryEntry, Device } from '../../types';
import { DeviceStatus } from '../../types';

interface ReportsPageProps {
  borrowHistory: HistoryEntry[];
  devices: Device[];
  t: (key: string) => string;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ borrowHistory, devices, t }) => {
  const totalDevices = devices.length;
  const availableDevices = devices.filter(d => d.status === DeviceStatus.Available).length;
  const borrowedDevices = devices.filter(d => d.status === DeviceStatus.Borrowed).length;
  const maintenanceDevices = devices.filter(d => d.status === DeviceStatus.Maintenance).length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center no-print">
        <header className="text-left">
          <h1 className="text-2xl font-bold text-gray-800">{t('reports')}</h1>
          <p className="text-gray-500">Summary of device loaning system</p>
        </header>
        <button
          onClick={handlePrint}
          className="bg-spk-blue text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-800"
        >
          <span className="material-icons-outlined">print</span>
          Print
        </button>
      </div>
      
      <div className="printable-area bg-white p-6 rounded-lg shadow-md">
        <div className="text-center mb-8">
          <img src="https://www.spk.ac.th/home/wp-content/uploads/2025/10/spk-logo-png-new-1.png" alt="SPK Logo" className="w-20 h-20 mx-auto mb-2" />
          <h2 className="text-xl font-bold">Device Loan Report</h2>
          <p className="text-sm text-gray-500">Sarakham Pittayakhom School</p>
          <p className="text-xs text-gray-400">Generated on: {new Date().toLocaleString()}</p>
        </div>

        <h3 className="text-lg font-semibold mb-2">Device Status Summary</h3>
        <table className="min-w-full divide-y divide-gray-200 border mb-8">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Count</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr><td className="px-4 py-2 font-medium">Total Devices</td><td className="px-4 py-2">{totalDevices}</td></tr>
            <tr><td className="px-4 py-2 text-green-700 font-medium">{t('available')}</td><td className="px-4 py-2">{availableDevices}</td></tr>
            <tr><td className="px-4 py-2 text-blue-700 font-medium">{t('borrowed')}</td><td className="px-4 py-2">{borrowedDevices}</td></tr>
            <tr><td className="px-4 py-2 text-orange-700 font-medium">{t('maintenance')}</td><td className="px-4 py-2">{maintenanceDevices}</td></tr>
          </tbody>
        </table>
        
        <h3 className="text-lg font-semibold mb-2">Recent Borrowing History</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Borrower</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Borrow Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {borrowHistory.slice(0, 10).map(entry => {
                const device = devices.find(d => d.id === entry.deviceId);
                return (
                  <tr key={entry.historyId}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{device?.name || entry.deviceId}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{entry.borrowerName}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{new Date(entry.borrowDate).toLocaleDateString()}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${entry.status === 'Returned' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                           {entry.status}
                        </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;