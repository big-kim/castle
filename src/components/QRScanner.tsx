import React, { useEffect, useRef, useState } from 'react';
import { X, Camera, AlertCircle, CheckCircle } from 'lucide-react';
import QrScanner from 'qr-scanner';
import { toast } from 'sonner';

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (address: string) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({
  isOpen,
  onClose,
  onScanSuccess
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // BNB 지갑 주소 유효성 검사 함수
  const isValidBNBAddress = (address: string): boolean => {
    // BNB 주소는 0x로 시작하고 40개의 16진수 문자가 따라옴 (총 42자)
    const bnbAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return bnbAddressRegex.test(address);
  };

  // QR 코드 스캔 결과 처리
  const handleScanResult = (result: QrScanner.ScanResult) => {
    const scannedText = result.data;
    
    if (isValidBNBAddress(scannedText)) {
      // 유효한 BNB 주소인 경우
      onScanSuccess(scannedText);
      toast.success('BNB 지갑 주소가 성공적으로 스캔되었습니다!');
      onClose();
    } else {
      // 유효하지 않은 주소인 경우
      setError('유효하지 않은 BNB 지갑 주소입니다. 올바른 BNB 주소를 스캔해주세요.');
      toast.error('유효하지 않은 BNB 지갑 주소입니다.');
    }
  };

  // 카메라 권한 요청 및 스캐너 초기화
  const initializeScanner = async () => {
    if (!videoRef.current) return;

    try {
      setError(null);
      setIsScanning(true);

      // 카메라 권한 확인
      const hasCamera = await QrScanner.hasCamera();
      if (!hasCamera) {
        throw new Error('카메라를 찾을 수 없습니다.');
      }

      // QR 스캐너 생성
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        handleScanResult,
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment', // 후면 카메라 우선
        }
      );

      // 스캐너 시작
      await qrScannerRef.current.start();
      setHasPermission(true);
      setIsScanning(true);
    } catch (err) {
      console.error('QR Scanner initialization error:', err);
      setHasPermission(false);
      setIsScanning(false);
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('카메라 접근 권한이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요.');
        } else if (err.name === 'NotFoundError') {
          setError('카메라를 찾을 수 없습니다. 카메라가 연결되어 있는지 확인해주세요.');
        } else {
          setError(err.message || '카메라를 초기화하는 중 오류가 발생했습니다.');
        }
      } else {
        setError('알 수 없는 오류가 발생했습니다.');
      }
    }
  };

  // 스캐너 정리
  const cleanupScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setIsScanning(false);
    setError(null);
    setHasPermission(null);
  };

  // 모달이 열릴 때 스캐너 초기화
  useEffect(() => {
    if (isOpen) {
      initializeScanner();
    } else {
      cleanupScanner();
    }

    return () => {
      cleanupScanner();
    };
  }, [isOpen]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      cleanupScanner();
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[10000] p-4">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">QR 코드 스캔</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 카메라 영역 */}
        <div className="relative">
          {/* 비디오 요소 */}
          <video
            ref={videoRef}
            className="w-full h-64 object-cover bg-gray-900"
            playsInline
            muted
          />

          {/* 스캔 가이드 오버레이 */}
          {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-white border-dashed rounded-lg bg-black bg-opacity-20">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-white text-center">
                    <Camera className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">QR 코드를 프레임 안에 맞춰주세요</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 로딩 상태 */}
          {!isScanning && !error && hasPermission === null && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <p className="text-sm">카메라를 초기화하는 중...</p>
              </div>
            </div>
          )}
        </div>

        {/* 상태 메시지 */}
        <div className="p-4">
          {error && (
            <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-800">
                <p className="font-medium mb-1">오류 발생</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {isScanning && (
            <div className="flex items-start space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-green-800">
                <p className="font-medium mb-1">스캔 준비 완료</p>
                <p>BNB 지갑 주소가 포함된 QR 코드를 스캔해주세요.</p>
              </div>
            </div>
          )}

          {/* 안내 메시지 */}
          <div className="text-sm text-gray-600 space-y-2">
            <p className="font-medium">사용 방법:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>QR 코드를 카메라 프레임 안에 맞춰주세요</li>
              <li>유효한 BNB 지갑 주소만 인식됩니다</li>
              <li>BNB 주소는 0x로 시작하는 42자리 형식입니다</li>
            </ul>
          </div>

          {/* 액션 버튼 */}
          <div className="flex space-x-3 mt-4">
            <button
              onClick={onClose}
              className="flex-1 p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
            {error && (
              <button
                onClick={initializeScanner}
                className="flex-1 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                다시 시도
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};