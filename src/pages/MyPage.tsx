import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  User, 
  Settings, 
  Shield, 
  CreditCard, 
  Bell, 
  HelpCircle, 
  LogOut, 
  ChevronRight, 
  Edit3, 
  Eye, 
  EyeOff, 
  Smartphone, 
  Mail, 
  Lock,
  Globe,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Check,
  Fingerprint,
  MapPin,
  Plus,
  Trash2,
  ExternalLink,
  FileText,
  MessageCircle,
  Info
} from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { cn } from '../utils/cn';

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  value?: string;
  onClick?: () => void;
  showChevron?: boolean;
  danger?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({ 
  icon, 
  title, 
  description, 
  value, 
  onClick, 
  showChevron = true, 
  danger = false 
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors text-left',
        danger && 'hover:bg-red-50'
      )}
    >
      <div className="flex items-center space-x-4">
        <div className={cn(
          'p-2 rounded-lg',
          danger ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
        )}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className={cn(
            'font-medium',
            danger ? 'text-red-600' : 'text-gray-900'
          )}>
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {value && (
          <span className="text-sm text-gray-500">{value}</span>
        )}
        {showChevron && (
          <ChevronRight className="w-5 h-5 text-gray-400" />
        )}
      </div>
    </button>
  );
};

const NotificationSection: React.FC = () => {
  const { user, updateSettings } = useUserStore();

  const handleNotificationToggle = (type: 'p2p' | 'deposits' | 'withdrawals', enabled: boolean) => {
    updateSettings({
      ...user?.settings,
      notifications: enabled
    });
  };

  return (
    <div className="bg-white rounded-xl p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Bell className="w-5 h-5 mr-2 text-green-600" />
        알림 설정
      </h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">P2P 거래 알림</h4>
              <p className="text-sm text-gray-500">P2P 거래 요청 및 완료 알림</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={user?.settings.notifications || false}
              onChange={(e) => handleNotificationToggle('p2p', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">입금 알림</h4>
              <p className="text-sm text-gray-500">지갑 입금 완료 알림</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={user?.settings.notifications || false}
              onChange={(e) => handleNotificationToggle('deposits', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">출금 알림</h4>
              <p className="text-sm text-gray-500">지갑 출금 완료 알림</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={user?.settings.notifications || false}
              onChange={(e) => handleNotificationToggle('withdrawals', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
          </label>
        </div>
      </div>
    </div>
  );
};

interface ToggleSettingProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

const ToggleSetting: React.FC<ToggleSettingProps> = ({ 
  icon, 
  title, 
  description, 
  enabled, 
  onChange 
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100">
      <div className="flex items-center space-x-4">
        <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>
      </div>
      
      <button
        onClick={() => onChange(!enabled)}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
          enabled ? 'bg-primary' : 'bg-gray-200'
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            enabled ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  );
};

const ProfileSection: React.FC = () => {
  const { user } = useUserStore();
  return (
    <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-white shadow-lg">
      <div className="flex items-center space-x-4">
        {/* Profile Avatar */}
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
          {user?.avatar ? (
            <img 
              src={user.avatar} 
              alt="Profile" 
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User className="w-8 h-8 text-white" />
          )}
        </div>
        
        {/* Profile Info */}
        <div className="flex-1">
          <h2 className="text-xl font-semibold">
            {user?.name || '게스트 사용자'}
          </h2>
          <p className="text-white/80 text-sm">
            {user?.email || 'guest@example.com'}
          </p>
          <p className="text-white/80 text-sm">
            가입일 {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}
          </p>
        </div>
        
        {/* Edit Button */}
        <button
          onClick={() => {}}
          className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
        >
          <Edit3 className="w-5 h-5" />
        </button>
      </div>
      
      {/* Verification Status */}
      <div className="mt-4 flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-sm">이메일 인증됨</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-sm">휴대폰 인증됨</span>
        </div>
      </div>
    </div>
  );
};

const SecuritySection: React.FC = () => {
  const { user, updateSettings } = useUserStore();
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');

  const handleAppLockToggle = (enabled: boolean) => {
    if (enabled && !user?.settings?.app_lock_enabled) {
      setShowPinSetup(true);
    } else if (!enabled) {
      updateSettings({
        ...user?.settings,
        app_lock_enabled: false, biometric_enabled: false
      });
    }
  };

  const handleBiometricToggle = async (enabled: boolean) => {
    if (enabled) {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        updateSettings({
          ...user?.settings,
          app_lock_enabled: true, biometric_enabled: true
        });
      } catch (error) {
        console.error('Biometric setup failed:', error);
      }
    } else {
      updateSettings({
        ...user?.settings,
        app_lock_enabled: false, biometric_enabled: false
      });
    }
  };

  const handlePinSubmit = () => {
    if (pin.length !== 6) {
      setPinError('PIN must be 6 digits.');
      return;
    }
    if (pin !== confirmPin) {
      setPinError('PINs do not match.');
      return;
    }
    
    updateSettings({
      ...user?.settings,
      app_lock_enabled: true
    });
    
    setShowPinSetup(false);
    setPin('');
    setConfirmPin('');
    setPinError('');
  };

  const handlePinCancel = () => {
    setShowPinSetup(false);
    setPin('');
    setConfirmPin('');
    setPinError('');
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">보안</h3>
      
      <SettingItem
        icon={<Lock className="w-5 h-5" />}
        title="비밀번호 변경"
        description="계정 비밀번호를 업데이트하세요"
        onClick={() => {}}
      />
      
      <SettingItem
        icon={<Shield className="w-5 h-5" />}
        title="2단계 인증"
        description="추가 보안 계층을 설정하세요"
        value="활성화됨"
        onClick={() => {}}
      />
      
      <SettingItem
        icon={<Smartphone className="w-5 h-5" />}
        title="신뢰할 수 있는 기기"
        description="신뢰할 수 있는 기기를 관리하세요"
        value="3개 기기"
        onClick={() => {}}
      />
      
      <ToggleSetting
        icon={<Lock className="w-5 h-5" />}
        title="앱 잠금"
        description={user?.settings?.app_lock_enabled
           ? '앱 잠금이 활성화되었습니다'
           : 'PIN 또는 생체 인증이 필요합니다'
         }
        enabled={user?.settings?.app_lock_enabled || false}
        onChange={handleAppLockToggle}
      />
      
      <ToggleSetting
        icon={<Fingerprint className="w-5 h-5" />}
        title="생체 인증"
        description="빠른 접근을 위해 지문 또는 Face ID를 사용하세요"
        enabled={user?.settings?.biometric_enabled || false}
        onChange={handleBiometricToggle}
      />
      
      {/* PIN Setup Modal */}
      {showPinSetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">PIN 설정</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PIN 입력 (6자리)
                </label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setPin(value);
                    setPinError('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
                  placeholder="••••••"
                  maxLength={6}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PIN 확인
                </label>
                <input
                  type="password"
                  value={confirmPin}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setConfirmPin(value);
                    setPinError('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
                  placeholder="••••••"
                  maxLength={6}
                />
              </div>
              
              {pinError && (
                <p className="text-sm text-red-600">
                  {pinError === 'PIN must be 6 digits.' ? 'PIN은 6자리여야 합니다.' : 'PIN이 일치하지 않습니다.'}
                </p>
              )}
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handlePinCancel}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                취소
              </button>
              <button
                onClick={handlePinSubmit}
                disabled={pin.length !== 6 || confirmPin.length !== 6}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                PIN 설정
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};





// Exchange Account Management Section
const ExchangeAccountSection: React.FC = () => {
  const [exchanges, setExchanges] = useState([
    { id: 1, name: 'CoinEx', apiKey: 'coinex_***', status: 'connected' },
  ]);
  const [showAddExchange, setShowAddExchange] = useState(false);
  const [newExchange, setNewExchange] = useState({ name: '', apiKey: '', secretKey: '' });

  const handleAddExchange = () => {
    if (newExchange.name && newExchange.apiKey) {
      setExchanges([...exchanges, {
        id: Date.now(),
        name: newExchange.name,
        apiKey: newExchange.apiKey.slice(0, 8) + '***',
        status: 'connected'
      }]);
      setNewExchange({ name: '', apiKey: '', secretKey: '' });
      setShowAddExchange(false);
    }
  };

  const handleRemoveExchange = (id: number) => {
    setExchanges(exchanges.filter(ex => ex.id !== id));
  };

  return (
    <div className="bg-white rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <CreditCard className="w-5 h-5 mr-2 text-purple-600" />
          거래소 계정 관리
        </h3>
        <button
          onClick={() => setShowAddExchange(true)}
          className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">추가</span>
        </button>
      </div>
      
      <div className="space-y-3">
        {exchanges.map((exchange) => (
          <div key={exchange.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{exchange.name}</h4>
                <p className="text-sm text-gray-500">API Key: {exchange.apiKey}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                연결됨
              </span>
              <button
                onClick={() => handleRemoveExchange(exchange.id)}
                className="p-1 text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        
        {exchanges.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>등록된 거래소 계정이 없습니다</p>
          </div>
        )}
      </div>
      
      {/* Add Exchange Modal */}
      {showAddExchange && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">거래소 계정 추가</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  거래소 선택
                </label>
                <select
                  value={newExchange.name}
                  onChange={(e) => setNewExchange({...newExchange, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">거래소를 선택하세요</option>
                  <option value="CoinEx">CoinEx</option>
                  <option value="Binance">Binance</option>
                  <option value="Upbit">Upbit</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <input
                  type="text"
                  value={newExchange.apiKey}
                  onChange={(e) => setNewExchange({...newExchange, apiKey: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="API Key를 입력하세요"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secret Key
                </label>
                <input
                  type="password"
                  value={newExchange.secretKey}
                  onChange={(e) => setNewExchange({...newExchange, secretKey: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Secret Key를 입력하세요"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddExchange(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                취소
              </button>
              <button
                onClick={handleAddExchange}
                disabled={!newExchange.name || !newExchange.apiKey}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Connected Devices Section
const ConnectedDevicesSection: React.FC = () => {
  const [devices, setDevices] = useState([
    { id: 1, name: 'iPhone 15 Pro', location: 'Seoul, Korea', lastActive: '방금 전', current: true },
    { id: 2, name: 'MacBook Pro', location: 'Seoul, Korea', lastActive: '2시간 전', current: false },
  ]);

  const handleRemoteLogout = (deviceId: number) => {
    setDevices(devices.filter(device => device.id !== deviceId));
  };

  return (
    <div className="bg-white rounded-xl p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Smartphone className="w-5 h-5 mr-2 text-indigo-600" />
          연결된 기기
        </h3>
      
      <div className="space-y-3">
        {devices.map((device) => (
          <div key={device.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-gray-900">{device.name}</h4>
                  {device.current && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      현재 기기
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{device.location} • {device.lastActive}</p>
              </div>
            </div>
            {!device.current && (
              <button
                onClick={() => handleRemoteLogout(device.id)}
                className="text-sm text-red-600 hover:text-red-700"
              >
                로그아웃
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Whitelist Address Section
const WhitelistAddressSection: React.FC = () => {
  const [addresses, setAddresses] = useState([
    { id: 1, name: 'My Binance Wallet', address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d4d4', network: 'Ethereum' },
  ]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ name: '', address: '', network: 'Ethereum' });

  const handleAddAddress = () => {
    if (newAddress.name && newAddress.address) {
      setAddresses([...addresses, {
        id: Date.now(),
        name: newAddress.name,
        address: newAddress.address,
        network: newAddress.network
      }]);
      setNewAddress({ name: '', address: '', network: 'Ethereum' });
      setShowAddAddress(false);
    }
  };

  const handleRemoveAddress = (id: number) => {
    setAddresses(addresses.filter(addr => addr.id !== id));
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="bg-white rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-orange-600" />
          화이트리스트 주소
        </h3>
        <button
          onClick={() => setShowAddAddress(true)}
          className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">추가</span>
        </button>
      </div>
      
      <div className="space-y-3">
        {addresses.map((address) => (
          <div key={address.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{address.name}</h4>
                <p className="text-sm text-gray-500 font-mono">{formatAddress(address.address)}</p>
                <p className="text-xs text-gray-400">{address.network}</p>
              </div>
            </div>
            <button
              onClick={() => handleRemoveAddress(address.id)}
              className="p-1 text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        
        {addresses.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>등록된 화이트리스트 주소가 없습니다</p>
          </div>
        )}
      </div>
      
      {/* Add Address Modal */}
      {showAddAddress && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">화이트리스트 주소 추가</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  주소 이름
                </label>
                <input
                  type="text"
                  value={newAddress.name}
                  onChange={(e) => setNewAddress({...newAddress, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="예: 내 바이낸스 지갑"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  지갑 주소
                </label>
                <input
                  type="text"
                  value={newAddress.address}
                  onChange={(e) => setNewAddress({...newAddress, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="0x..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  네트워크
                </label>
                <select
                  value={newAddress.network}
                  onChange={(e) => setNewAddress({...newAddress, network: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Ethereum">이더리움</option>
                  <option value="Bitcoin">비트코인</option>
                  <option value="Polygon">폴리곤</option>
                  <option value="BSC">바이낸스 스마트 체인</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddAddress(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                취소
              </button>
              <button
                onClick={handleAddAddress}
                disabled={!newAddress.name || !newAddress.address}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const MyPage: React.FC = () => {
  const { user, logout } = useUserStore();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [appVersion] = useState('1.0.0');

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Profile Section */}
      <ProfileSection />
      
      {/* Security Section */}
      <SecuritySection />
      
      {/* Notification Section */}
      <NotificationSection />
      
      {/* Exchange Account Management */}
      <ExchangeAccountSection />
      
      {/* Connected Devices */}
      <ConnectedDevicesSection />
      
      {/* Whitelist Addresses */}
      <WhitelistAddressSection />
      
      {/* Other Information Section */}
      <div className="bg-white rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Info className="w-5 h-5 mr-2 text-blue-600" />
          기타
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-blue-600" />
              <span className="text-gray-700">공지사항</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
            <div className="flex items-center space-x-3">
              <MessageCircle className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">고객센터 (1:1 문의)</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-purple-600" />
              <span className="text-gray-700">이용약관</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Info className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">버전 정보</span>
            </div>
            <span className="text-sm text-gray-500">v{appVersion}</span>
          </div>
        </div>
      </div>
      
      {/* Logout Button */}
      <div className="bg-white rounded-xl p-6">
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full flex items-center justify-center space-x-2 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">로그아웃</span>
        </button>
      </div>
      
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 mx-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">로그아웃</h3>
              <p className="text-gray-600">로그아웃 하시겠습니까?</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};