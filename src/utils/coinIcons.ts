/**
 * 코인 심볼과 SVG 파일을 매칭하는 유틸리티 함수들
 */

// 사용 가능한 코인 아이콘 매핑
const COIN_ICON_MAP: Record<string, string> = {
  // IC 계열 코인
  ICC: 'ICC.svg',
  ICS: 'ICS.svg', 
  ICF: 'ICF.svg',
  ICG: 'ICG.svg',
  
  // AI 계열 코인
  AITC: 'AITC.svg',
  AITCP: 'AITCP.svg',
  
  // 메이저 코인
  BNB: 'bnb.svg',
  USDT: 'usdt.svg',
  
  // 8개 채굴 코인 (PRD 문서 기준)
  LTC: 'ltc.svg',
  DOGE: 'doge.svg',
  BELLS: 'bells.svg',
  PEP: 'pep.svg',
  JKC: 'jkc.svg',
  LKY: 'lky.svg',
  DINGO: 'dingo.svg',
  SHIC: 'shic.svg',
  
  // 기타 코인
  SHIB: 'shib.svg',
  LIC: 'lic.svg'
};

/**
 * 코인 심볼에 해당하는 SVG 아이콘 경로를 반환합니다.
 * @param symbol 코인 심볼 (예: 'BTC', 'ETH')
 * @returns SVG 파일 경로
 */
export const getCoinIcon = (symbol: string): string => {
  const normalizedSymbol = symbol.toUpperCase();
  const iconFile = COIN_ICON_MAP[normalizedSymbol];
  
  if (iconFile) {
    return `/images/${iconFile}`;
  }
  
  // 기본 fallback: 심볼명으로 직접 매칭 시도
  return `/images/${normalizedSymbol.toLowerCase()}.svg`;
};

/**
 * 코인 아이콘이 존재하는지 확인합니다.
 * @param symbol 코인 심볼
 * @returns 아이콘 존재 여부
 */
export const hasCoinIcon = (symbol: string): boolean => {
  const normalizedSymbol = symbol.toUpperCase();
  return normalizedSymbol in COIN_ICON_MAP;
};

/**
 * 사용 가능한 모든 코인 심볼 목록을 반환합니다.
 * @returns 코인 심볼 배열
 */
export const getAvailableCoinSymbols = (): string[] => {
  return Object.keys(COIN_ICON_MAP);
};

/**
 * 코인 심볼의 첫 글자를 반환합니다 (fallback용)
 * @param symbol 코인 심볼
 * @returns 첫 글자
 */
export const getCoinInitial = (symbol: string): string => {
  return symbol.charAt(0).toUpperCase();
};