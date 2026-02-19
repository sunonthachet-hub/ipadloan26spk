
import React, { useState, useMemo } from 'react';
import type { Device } from '../../types';
import DeviceCard from '../dashboard/DeviceCard';

interface VisitorPageProps {
  devices: Device[];
  t: (key: string) => string;
  onLoginClick: () => void;
  onExit: () => void;
}

const VisitorPage: React.FC<VisitorPageProps> = ({ devices, t, onLoginClick, onExit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredDevices = useMemo(() => {
    return devices.filter(device => 
      searchTerm ? 
        device.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        device.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) 
      : true
    );
  }, [devices, searchTerm]);

  return (
    <div className="min-h-screen bg-spk-gray">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3 cursor-pointer" onClick={onExit}>
              <img src="https://www.spk.ac.th/home/wp-content/uploads/2025/10/spk-logo-png-new-1.png" alt="SPK Logo" className="w-10 h-10" />
              <h1 className="text-xl font-bold text-spk-blue">iPad Check</h1>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={onLoginClick} className="bg-spk-blue text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-blue-800 transition-colors">
                {t('login')}
              </button>
              <button onClick={onExit} className="text-gray-500 hover:text-gray-800">
                <span className="material-icons-outlined">close</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">{t('allDevices')}</h2>
          
          {/* Search Bar */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder={t('searchDevice')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-spk-yellow text-lg"
            />
            <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
          </div>

          {/* Device Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDevices.map(device => (
              <DeviceCard
                key={device.id}
                device={device}
                user={null} // Visitor mode, no user
                t={t}
              />
            ))}
            {filteredDevices.length === 0 && <p className="text-gray-500 col-span-full text-center py-8">No devices found.</p>}
          </div>
        </div>
      </main>
    </div>
  );
};
export default VisitorPage;
