
import React, { useState, useMemo } from 'react';
import type { User, Device, StudentUser, TeacherUser } from '../../types';
import { UserRole, TeacherDepartment, DeviceStatus } from '../../types';

interface AssignDeviceWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentUser[];
  teachers: TeacherUser[];
  devices: Device[];
  onAssign: (data: { user: User; device: Device; appleId: string; borrowNotes: string, borrowedAccessories: string[] }) => void;
  t: (key: string) => string;
  onScanRequest: (callback: (result: string) => void) => void;
}

const AssignDeviceWizardModal: React.FC<AssignDeviceWizardModalProps> = (props) => {
  const { isOpen, onClose, students, teachers, devices, onAssign, t, onScanRequest } = props;

  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<UserRole | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  // Step 2 state
  const [department, setDepartment] = useState('');
  const [grade, setGrade] = useState('');
  const [classroom, setClassroom] = useState('');
  const [userSearch, setUserSearch] = useState('');
  
  // Step 3 state
  const [appleId, setAppleId] = useState('');
  const [borrowNotes, setBorrowNotes] = useState('');
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [deviceSearch, setDeviceSearch] = useState('');

  const resetState = () => {
    setStep(1); setUserType(null); setSelectedUser(null); setSelectedDevice(null);
    setDepartment(''); setGrade(''); setClassroom(''); setUserSearch('');
    setAppleId(''); setBorrowNotes(''); setSelectedAccessories([]); setDeviceSearch('');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };
  
  const handleSelectUserType = (type: UserRole) => {
    setUserType(type);
    setStep(2);
  };
  
  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setStep(3);
  };

  const handleDeviceSelect = (deviceId: string) => {
      const device = availableDevices.find(d => d.id === deviceId);
      if (device) {
        setSelectedDevice(device);
        setSelectedAccessories([]); // Reset accessories when device changes
      } else {
        setSelectedDevice(null);
      }
  }

  const handleAssign = () => {
    if (selectedUser && selectedDevice && appleId) {
      onAssign({ user: selectedUser, device: selectedDevice, appleId, borrowNotes, borrowedAccessories: selectedAccessories });
      handleClose();
    } else {
        alert("Please fill all required fields.");
    }
  };

  const handleScanClick = () => {
    onScanRequest((scannedId) => {
        const device = availableDevices.find(d => d.id === scannedId || d.serialNumber === scannedId);
        if (device) {
            setSelectedDevice(device);
            setDeviceSearch(''); 
        } else {
            alert('Scanned device is not available or does not match the required designation for the selected user.');
        }
    });
  };

  const filteredUsers = useMemo(() => {
    if (userType === UserRole.Teacher) {
      return teachers.filter(t => 
        (!department || t.department === department) &&
        (t.username.toLowerCase().includes(userSearch.toLowerCase()) || t.email.toLowerCase().includes(userSearch.toLowerCase()))
      );
    }
    if (userType === UserRole.Student) {
      return students.filter(s => 
        (!grade || s.grade === parseInt(grade)) &&
        (!classroom || s.classroom === classroom) &&
        (s.username.toLowerCase().includes(userSearch.toLowerCase()) || s.studentId.includes(userSearch))
      );
    }
    return [];
  }, [userType, teachers, students, department, grade, classroom, userSearch]);

  const availableDevices = useMemo(() => {
      if(!selectedUser) return [];
      let filtered = devices.filter(d => d.status === DeviceStatus.Available && (!d.designatedFor || (d.designatedFor as string) === t('notSpecified') || d.designatedFor === selectedUser.role));
      if (deviceSearch) {
          const lowerDeviceSearch = deviceSearch.toLowerCase();
          filtered = filtered.filter(d => d.name?.toLowerCase().includes(lowerDeviceSearch) || d.serialNumber?.toLowerCase().includes(lowerDeviceSearch));
      }
      return filtered;
  }, [devices, selectedUser, deviceSearch, t]);
  
  const availableAccessories = useMemo(() => {
    if(!selectedDevice?.accessories) return [];
    return Array.isArray(selectedDevice.accessories) ? selectedDevice.accessories : selectedDevice.accessories.split(',').map(s => s.trim());
  }, [selectedDevice]);


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg relative max-h-[90vh] flex flex-col">
        <button onClick={handleClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"><span className="material-icons-outlined">close</span></button>
        <h2 className="text-xl font-bold mb-4">{t('assignUser')} - ขั้นตอนที่ {step}/3</h2>
        
        <div className="overflow-y-auto flex-grow">
            {/* Step 1: Select User Type */}
            {step === 1 && (
                <div className="text-center space-y-4 pt-8">
                    <h3 className="text-lg font-medium">เลือกประเภทผู้ใช้</h3>
                    <div className="flex justify-center gap-4">
                        <button onClick={() => handleSelectUserType(UserRole.Teacher)} className="p-6 bg-blue-100 rounded-lg text-blue-800 hover:bg-blue-200 w-40 text-center"><span className="material-icons-outlined text-4xl mb-2">school</span><p>{t('teacher')}</p></button>
                        <button onClick={() => handleSelectUserType(UserRole.Student)} className="p-6 bg-green-100 rounded-lg text-green-800 hover:bg-green-200 w-40 text-center"><span className="material-icons-outlined text-4xl mb-2">face</span><p>{t('student')}</p></button>
                    </div>
                </div>
            )}

            {/* Step 2: Select User */}
            {step === 2 && (
                <div>
                    <h3 className="font-semibold mb-2">ค้นหาและเลือก{userType === UserRole.Teacher ? 'ครู' : 'นักเรียน'}</h3>
                    {userType === UserRole.Teacher && (
                        <select value={department} onChange={e => setDepartment(e.target.value)} className="w-full p-2 border rounded mb-2"><option value="">ทุกกลุ่มสาระ</option>{Object.values(TeacherDepartment).map(d => <option key={d} value={d}>{d}</option>)}</select>
                    )}
                    {userType === UserRole.Student && (
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            <select value={grade} onChange={e => setGrade(e.target.value)} className="w-full p-2 border rounded"><option value="">ทุกระดับชั้น</option>{[...Array(6).keys()].map(i => <option key={i+1} value={i+1}>ม.{i+1}</option>)}</select>
                            <select value={classroom} onChange={e => setClassroom(e.target.value)} className="w-full p-2 border rounded"><option value="">ทุกห้อง</option>{[...Array(12).keys()].map(i => <option key={i+1} value={i+1}>{i+1}</option>)}</select>
                        </div>
                    )}
                    <input type="text" placeholder="ค้นหาด้วยชื่อ, อีเมล, หรือรหัสนักเรียน..." value={userSearch} onChange={e => setUserSearch(e.target.value)} className="w-full p-2 border rounded"/>
                    <ul className="mt-2 max-h-60 overflow-y-auto border rounded">
                        {filteredUsers.map(u => <li key={u.id} onClick={() => handleUserSelect(u)} className="p-2 hover:bg-gray-100 cursor-pointer">{u.username}</li>)}
                    </ul>
                </div>
            )}

            {/* Step 3: Select Device & Details */}
            {step === 3 && selectedUser && (
                <div className="space-y-4">
                    <p className="font-semibold">ผู้ใช้ที่เลือก: <span className="font-normal">{selectedUser.username}</span></p>
                    <div>
                        <label className="block text-sm font-medium">ค้นหาและเลือกอุปกรณ์</label>
                        <div className="flex items-center gap-2 mt-1">
                            <input
                                type="text"
                                placeholder="ค้นหาด้วยชื่ออุปกรณ์ หรือ S/N..."
                                value={deviceSearch}
                                onChange={e => setDeviceSearch(e.target.value)}
                                className="w-full p-2 border rounded"
                            />
                            <button type="button" onClick={handleScanClick} className="p-2 border rounded-md hover:bg-gray-100 flex-shrink-0">
                                <span className="material-icons-outlined">qr_code_scanner</span>
                            </button>
                        </div>
                        <select onChange={e => handleDeviceSelect(e.target.value)} value={selectedDevice?.id || ''} className="mt-1 w-full p-2 border rounded" required>
                          <option value="">-- เลือกอุปกรณ์ --</option>
                          {availableDevices.map(d => <option key={d.id} value={d.id}>{d.name} ({d.serialNumber})</option>)}
                        </select>
                    </div>

                    {selectedDevice && (
                        <>
                            <div className="p-2 bg-gray-50 rounded-md text-sm">
                                <p><strong>Device:</strong> {selectedDevice.name}</p>
                                <p><strong>S/N:</strong> {selectedDevice.serialNumber}</p>
                            </div>
                            {availableAccessories.length > 0 && (
                                <div>
                                <label className="block text-sm font-medium text-gray-700">อุปกรณ์เสริม</label>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {availableAccessories.map(acc => (
                                        <button key={acc} type="button" onClick={() => setSelectedAccessories(prev => prev.includes(acc) ? prev.filter(a => a !== acc) : [...prev, acc])} className={`px-3 py-1 text-sm rounded-full border ${selectedAccessories.includes(acc) ? 'bg-spk-blue text-white border-spk-blue' : 'bg-white text-gray-700'}`}>{acc}</button>
                                    ))}
                                </div>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium">Apple ID</label>
                                <input type="email" value={appleId} onChange={e => setAppleId(e.target.value)} className="mt-1 w-full p-2 border rounded" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">หมายเหตุการยืม</label>
                                <textarea value={borrowNotes} onChange={e => setBorrowNotes(e.target.value)} className="mt-1 w-full p-2 border rounded" rows={2}></textarea>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>

        <div className="pt-4 mt-4 border-t flex justify-between items-center">
            <div>{step > 1 && <button onClick={() => setStep(s => s - 1)} className="bg-gray-200 px-4 py-2 rounded-lg">ย้อนกลับ</button>}</div>
            <div>{step === 3 && <button onClick={handleAssign} disabled={!selectedDevice || !appleId} className="bg-spk-blue text-white px-4 py-2 rounded-lg disabled:bg-gray-400">ยืนยันการกำหนดผู้ใช้</button>}</div>
        </div>
      </div>
    </div>
  );
};

export default AssignDeviceWizardModal;
