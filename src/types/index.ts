// ============================================================================
// CORE TYPES
// ============================================================================

// Common Types
export type TokenSymbol = 
  | 'ICC' | 'ICS' | 'ICF' | 'ICG' 
  | 'AITC' | 'AITCP' 
  | 'USDT' | 'BTC' | 'ETH' | 'BNB' | 'ADA' | 'LTC' | 'DOGE' 
  | 'BELLS' | 'PEP' | 'JKC' | 'LKY' | 'DINGO' | 'SHIC';

export type MineableCoin = 'BTC' | 'ETH' | 'LTC' | 'BCH' | 'XRP' | 'ADA' | 'DOT' | 'LINK';

export type GiftCardType = 
  | 'starbucks' | 'cgv' | 'lotte' | 'shinsegae' | 'hyundai' 
  | 'emart' | 'gmarket' | 'olive_young' | 'kyobo';

export type NavigationTab = 'home' | 'p2p' | 'mining' | 'finance' | 'gift';

export type Language = 'ko' | 'en';
export type Currency = 'USDT';
export type RiskLevel = 'low' | 'medium' | 'high';
export type RecordStatus = 'active' | 'completed' | 'cancelled';

// ============================================================================
// USER & AUTHENTICATION
// ============================================================================

export interface UserSettings {
  appLockEnabled: boolean;
  notificationsEnabled: boolean;
  biometricEnabled: boolean;
  language: Language;
  currency: Currency;
}

export interface User {
  id: string;
  icastleId: string;
  email: string;
  name: string;
  profileImage?: string;
  walletAddress?: string;
  socialProvider?: string;
  settings: UserSettings;
  createdAt: string;
  updatedAt: string;
}

export interface LoginForm {
  icastleToken: string;
  deviceId: string;
}

// ============================================================================
// ASSET MANAGEMENT
// ============================================================================

export interface Asset {
  id: string;
  userId: string;
  tokenSymbol: TokenSymbol;
  balance: number;
  usdtValue: number;
  updatedAt: string;
}

export interface AssetSummary {
  totalValueUsdt: number;
  tokens: Asset[];
  giftCards: GiftCard[];
}

// ============================================================================
// P2P TRADING
// ============================================================================

export type P2PProductType = 'token' | 'nft' | 'coupon' | 'other';
export type TradeMethod = 'normal' | 'smart_contract';
export type SmartContractStatus = 'listed' | 'pending' | 'completed' | 'canceled' | 'timeout';
export type OrderType = 'buy' | 'sell';
export type OrderStatus = 'active' | 'completed' | 'cancelled';

export interface P2PProductDetails {
  name: string;
  description?: string;
  imageUrl?: string;
  nftContractAddress?: string;
  nftTokenId?: string;
  couponCode?: string;
  couponBarcode?: string;
  expiryDate?: string;
  brand?: string;
  category?: string;
  usageLocation?: string;
  denomination?: number;
  basePrice?: number;
  discountRate?: number;
  productCode?: string;
}

export interface P2POrder {
  id: string;
  userId: string;
  userName?: string;
  userRating?: number;
  productType: P2PProductType;
  tokenSymbol: TokenSymbol;
  paymentTokenSymbol: TokenSymbol;
  amount: number;
  price: number;
  pricePerToken: number;
  totalValue: number;
  paymentMethod: string;
  type: OrderType;
  status: OrderStatus;
  tradeMethod: TradeMethod;
  smartContractStatus?: SmartContractStatus;
  contractAddress?: string;
  transactionHash?: string;
  escrowTimeout?: string;
  productDetails?: P2PProductDetails;
  createdAt: string;
  updatedAt: string;
}

export interface P2PTransaction {
  id: string;
  orderId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  price: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
}

export interface P2POrderForm {
  type: OrderType;
  productType: P2PProductType;
  tokenSymbol: TokenSymbol;
  paymentTokenSymbol: TokenSymbol;
  amount: number;
  price: number;
  pricePerToken: string | number;
  paymentMethod: string;
  tradeMethod: TradeMethod;
  productDetails?: P2PProductDetails;
}

// ============================================================================
// MINING
// ============================================================================

export interface MiningActivity {
  id: string;
  userId: string;
  tokenSymbol: TokenSymbol;
  hashPowerAllocated: number;
  hashPowerUsed: number;
  dailyReward: number;
  pendingRewards: number;
  totalMined: number;
  isActive: boolean;
  startedAt: string | null;
  updatedAt: string;
}

export interface MiningData {
  id: string;
  userId: string;
  tokenSymbol: TokenSymbol;
  hashPower: number;
  dailyReward: number;
  totalMined: number;
  isActive: boolean;
  startedAt: string | null;
  updatedAt: string;
}

export interface MiningReward {
  id: string;
  userId: string;
  tokenSymbol: TokenSymbol;
  amount: number;
  hashPowerUsed: number;
  rewardDate: string;
  createdAt: string;
}

export interface MiningRecord {
  id: string;
  userId: string;
  coinSymbol: MineableCoin;
  hashPower: number;
  dailyReward: number;
  miningDate: string;
  createdAt: string;
}

export interface MiningSummary {
  totalHashPower: number;
  usedHashPower: number;
  totalEarnings: number;
  dailyEarnings: number;
}

export interface MineableCoinInfo {
  symbol: MineableCoin;
  name: string;
  icon: string;
  currentPriceUsdt: number;
  dailyReward: number;
  hashPowerAllocated: number;
}

export interface MiningStatus {
  hashPower: number;
  dailyRewards: MiningRecord[];
  mineableCoins: MineableCoinInfo[];
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  coinSymbol: MineableCoin;
  amount: number;
  coinexAddress: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  processedAt?: string;
  transactionHash?: string;
}

export interface WithdrawalForm {
  coinSymbol: MineableCoin;
  amount: number;
  coinexAddress: string;
}

export interface WithdrawalHistory {
  id: string;
  amount: number;
  date: string;
  status: string;
  type: string;
  transactionType?: string;
  createdAt?: string;
  fee?: number;
}

// ============================================================================
// FINANCE (STAKING, LENDING, LOANS)
// ============================================================================

export interface BaseFinanceProduct {
  id: string;
  name: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  durationDays: number;
  available: boolean;
  riskLevel?: RiskLevel;
  availableSlots?: number;
}

export interface StakingProduct extends BaseFinanceProduct {
  type: 'usdt' | 'giftCard';
  apy: number;
  productType?: string;
  duration?: number;
  totalStaked?: number;
}

export interface LendProduct extends BaseFinanceProduct {
  apy: number;
  totalLent?: number;
  nftType: 'icGiftCard';
  collateralRatio: number;
}

export interface LoanProduct extends BaseFinanceProduct {
  interestRate: number;
  totalLoaned?: number;
  collateralRequired: boolean;
  collateralRatio?: number;
  loanToValueRatio: number;
}

export interface BaseFinanceRecord {
  id: string;
  userId: string;
  productId: string;
  amount: number;
  startDate: string;
  endDate: string;
  status: RecordStatus;
}

export interface StakingRecord extends BaseFinanceRecord {
  type: 'usdt' | 'giftCard';
  apy: number;
  rewardsEarned: number;
}

export interface LendRecord extends BaseFinanceRecord {
  nftTokenId: string;
  apy: number;
  rewardsEarned: number;
  collateralValue: number;
}

export interface LoanRecord extends BaseFinanceRecord {
  interestRate: number;
  status: RecordStatus | 'defaulted';
  totalInterest: number;
  paidInterest: number;
  remainingBalance: number;
  collateralNftId?: string;
  collateralValue?: number;
  nextPaymentDate: string;
  monthlyPayment: number;
}

export interface StakingForm {
  productId: string;
  amount: number;
}

// ============================================================================
// GIFT CARDS
// ============================================================================

export interface GiftCard {
  id: string;
  userId: string;
  cardType: GiftCardType;
  faceValue: number;
  currentBalance: number;
  nftTokenId?: string;
  createdAt: string;
  updatedAt: string;
  brand?: string;
  productName?: string;
  status?: 'active' | 'used' | 'expired';
  value?: number;
  cardNumber?: string;
  expiresAt?: string;
  pin?: string;
}

export interface GiftCardProduct {
  id: string;
  cardType: GiftCardType;
  name: string;
  description: string;
  faceValues: number[];
  discountRate: number;
  imageUrl: string;
  isAvailable: boolean;
  category: string;
  stock: number;
  price?: number;
  originalPrice?: number;
  rating?: number;
  reviews?: number;
  validityDays?: number;
  brand?: string;
}

export interface GiftCardPurchaseForm {
  cardType: GiftCardType;
  faceValue: number;
  quantity: number;
}

export interface QRTransaction {
  id: string;
  giftCardId: string;
  amount: number;
  qrCode: string;
  expiresAt: string;
  status: 'pending' | 'used' | 'expired';
  usedAt?: string;
  merchantInfo?: string;
}

export interface QRPaymentForm {
  giftCardId: string;
  amount: number;
}

// ============================================================================
// NAVIGATION
// ============================================================================

export interface NavigationItem {
  id: NavigationTab;
  label: string;
  icon: string;
  path: string;
}

// ============================================================================
// API RESPONSES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============================================================================
// STORE INTERFACES
// ============================================================================

export interface UserStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (email: string, password: string, turnstileToken: string) => Promise<void>;
  register: (email: string, password: string, name: string, turnstileToken: string) => Promise<void>;
  socialLogin: (provider: 'kakao' | 'google' | 'apple') => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
}

export interface AssetStore {
  assets: Asset[];
  summary: AssetSummary | null;
  isLoading: boolean;
  fetchAssets: () => Promise<void>;
  fetchSummary: () => Promise<void>;
  refreshAssets: () => Promise<void>;
}

export interface P2PStore {
  orders: P2POrder[];
  myOrders: P2POrder[];
  transactions: P2PTransaction[];
  isLoading: boolean;
  error: string | null;
  fetchOrders: (type?: OrderType) => Promise<void>;
  fetchMyOrders: () => Promise<void>;
  createOrder: (orderData: P2POrderForm) => Promise<P2POrder>;
  cancelOrder: (orderId: string) => Promise<void>;
  executeOrder: (orderId: string) => Promise<P2PTransaction>;
  // Smart Contract Functions
  listAsset: (orderId: string, tokenAddress: string, amount: number) => Promise<string>;
  initiateTrade: (orderId: string, buyerAddress: string) => Promise<string>;
  depositAndExecute: (orderId: string, paymentAmount: number) => Promise<string>;
  reclaimAsset: (orderId: string) => Promise<string>;
  clearError: () => void;
}

export interface MiningStore {
  activities: MiningActivity[];
  summary: MiningSummary | null;
  miningData: MiningData[];
  rewards: MiningReward[];
  totalHashPower: number;
  dailyRewardTotal: number;
  isLoading: boolean;
  isWithdrawing: boolean;
  fetchActivities: () => Promise<void>;
  fetchSummary: () => Promise<void>;
  fetchMiningData: () => Promise<void>;
  fetchRewards: () => Promise<void>;
  startMining: (coinId: string) => Promise<void>;
  stopMining: (coinId: string) => Promise<void>;
  claimReward: (coinId: string) => Promise<void>;
  withdraw: (tokenSymbol: string, amount: number, withdrawalAddress: string) => Promise<void>;
}

export interface FinanceStore {
  products: StakingProduct[];
  records: StakingRecord[];
  isLoading: boolean;
  fetchProducts: () => Promise<void>;
  fetchRecords: () => Promise<void>;
  createStaking: (form: StakingForm) => Promise<void>;
  cancelStaking: (recordId: string) => Promise<void>;
}

export interface GiftStore {
  products: GiftCardProduct[];
  userGiftCards: GiftCard[];
  isLoading: boolean;
  fetchProducts: () => Promise<void>;
  fetchUserGiftCards: () => Promise<void>;
  purchaseGiftCard: (form: GiftCardPurchaseForm) => Promise<GiftCard>;
  generateQRCode: (giftCardId: string) => Promise<string>;
  useGiftCard: (giftCardId: string, amount: number) => Promise<void>;
}

export interface WalletOverview {
  totalBalance: number;
  totalBalanceUsdt: number;
  tokens: Array<{
    symbol: TokenSymbol;
    balance: number;
    usdtValue: number;
    change24h: number;
  }>;
  recentTransactions: Array<{
    id: string;
    type: 'send' | 'receive' | 'mining' | 'staking';
    amount: number;
    tokenSymbol: TokenSymbol;
    timestamp: string;
    status: 'completed' | 'pending' | 'failed';
  }>;
}

export interface WalletStore {
  overview: WalletOverview | null;
  isLoading: boolean;
  fetchWalletOverview: () => Promise<void>;
}