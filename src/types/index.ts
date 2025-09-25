// User and Authentication Types
export interface User {
  id: string;
  icastle_id: string;
  email: string;
  name: string;
  profile_image?: string;
  avatar?: string;
  wallet_address?: string;
  walletAddress?: string;
  socialProvider?: string;
  settings: UserSettings;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  app_lock_enabled: boolean;
  notifications_enabled: boolean;
  notifications: boolean;
  biometric_enabled: boolean;
  language: 'ko' | 'en';
  currency: 'USDT';
}

// Asset Types
export interface Asset {
  id: string;
  user_id: string;
  token_symbol: TokenSymbol;
  balance: number;
  usdt_value: number;
  updated_at: string;
}

export type TokenSymbol = 'ICC' | 'ICS' | 'ICF' | 'ICG' | 'AITC' | 'AITCP' | 'USDT' | 'BTC' | 'ETH' | 'BNB' | 'ADA' | 'LTC' | 'DOGE' | 'BELLS' | 'PEP' | 'JKC' | 'LKY' | 'DINGO' | 'SHIC';

// P2P Product Types
export type P2PProductType = 'token' | 'nft' | 'coupon' | 'other';

export interface P2PProductDetails {
  name: string;
  description?: string;
  image_url?: string;
  nft_contract_address?: string;
  nft_token_id?: string;
  coupon_code?: string;
  coupon_barcode?: string;
  expiry_date?: string;
  brand?: string;
  category?: string;
}

export interface AssetSummary {
  total_value_usdt: number;
  tokens: Asset[];
  gift_cards: GiftCard[];
}

// P2P Trading Types
export type TradeMethod = 'normal' | 'smart_contract';
export type SmartContractStatus = 'listed' | 'pending' | 'completed' | 'canceled' | 'timeout';

export interface P2POrder {
  id: string;
  user_id: string;
  user_name?: string;
  user_rating?: number;
  product_type: P2PProductType;
  token_symbol: TokenSymbol; // 판매하는 상품의 토큰 (상품이 토큰인 경우)
  payment_token_symbol: TokenSymbol; // 결제에 사용할 토큰
  amount: number;
  price: number;
  price_per_token: number;
  total_value: number;
  payment_method: string;
  type: 'buy' | 'sell';
  status: 'active' | 'completed' | 'cancelled';
  trade_method: TradeMethod;
  smart_contract_status?: SmartContractStatus;
  contract_address?: string;
  transaction_hash?: string;
  escrow_timeout?: string;
  product_details?: P2PProductDetails;
  created_at: string;
  updated_at: string;
}

export interface P2PTransaction {
  id: string;
  order_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  price: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  completed_at?: string;
}

// Mining Types
export interface MiningRecord {
  id: string;
  user_id: string;
  coin_symbol: MineableCoin;
  hash_power: number;
  daily_reward: number;
  mining_date: string;
  created_at: string;
}

export interface MiningActivity {
  id: string;
  user_id: string;
  token_symbol: TokenSymbol;
  hash_power_allocated: number;
  hash_power_used: number;
  daily_reward: number;
  pending_rewards: number;
  total_mined: number;
  is_active: boolean;
  started_at: string | null;
  updated_at: string;
}

export interface MiningData {
  id: string;
  user_id: string;
  token_symbol: TokenSymbol;
  hash_power: number;
  daily_reward: number;
  total_mined: number;
  is_active: boolean;
  started_at: string | null;
  updated_at: string;
}

export interface MiningReward {
  id: string;
  user_id: string;
  token_symbol: TokenSymbol;
  amount: number;
  hash_power_used: number;
  reward_date: string;
  created_at: string;
}

export interface MiningSummary {
  total_hash_power: number;
  used_hash_power: number;
  total_earnings: number;
  daily_earnings: number;
}

export type MineableCoin = 'BTC' | 'ETH' | 'LTC' | 'BCH' | 'XRP' | 'ADA' | 'DOT' | 'LINK';

export interface MiningStatus {
  hash_power: number;
  daily_rewards: MiningRecord[];
  mineable_coins: MineableCoinInfo[];
}

export interface MineableCoinInfo {
  symbol: MineableCoin;
  name: string;
  icon: string;
  current_price_usdt: number;
  daily_reward: number;
  hash_power_allocated: number;
}

// Withdrawal Types
export interface WithdrawalRequest {
  id: string;
  user_id: string;
  coin_symbol: MineableCoin;
  amount: number;
  coinex_address: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  processed_at?: string;
  transaction_hash?: string;
}

// Staking Types
export interface StakingRecord {
  id: string;
  user_id: string;
  type: 'usdt' | 'gift_card';
  amount: number;
  apy: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'cancelled';
  rewards_earned: number;
}

export interface StakingProduct {
  id: string;
  type: 'usdt' | 'gift_card';
  name: string;
  description: string;
  apy: number;
  min_amount: number;
  max_amount: number;
  duration_days: number;
  available: boolean;
  risk_level?: 'low' | 'medium' | 'high';
  available_slots?: number;
  product_type?: string;
  duration?: number;
  total_staked?: number;
}

// LEND Types
export interface LendProduct {
  id: string;
  name: string;
  description: string;
  apy: number;
  min_amount: number;
  max_amount: number;
  duration_days: number;
  available: boolean;
  risk_level?: 'low' | 'medium' | 'high';
  available_slots?: number;
  total_lent?: number;
  nft_type: 'ic_gift_card';
  collateral_ratio: number;
}

export interface LendRecord {
  id: string;
  user_id: string;
  product_id: string;
  nft_token_id: string;
  amount: number;
  apy: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'cancelled';
  rewards_earned: number;
  collateral_value: number;
}

// LOAN Types
export interface LoanProduct {
  id: string;
  name: string;
  description: string;
  interest_rate: number;
  min_amount: number;
  max_amount: number;
  duration_days: number;
  available: boolean;
  risk_level?: 'low' | 'medium' | 'high';
  available_slots?: number;
  total_loaned?: number;
  collateral_required: boolean;
  collateral_ratio?: number;
  loan_to_value_ratio: number;
}

export interface LoanRecord {
  id: string;
  user_id: string;
  product_id: string;
  amount: number;
  interest_rate: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'defaulted' | 'cancelled';
  total_interest: number;
  paid_interest: number;
  remaining_balance: number;
  collateral_nft_id?: string;
  collateral_value?: number;
  next_payment_date: string;
  monthly_payment: number;
}

// Gift Card Types
export interface GiftCard {
  id: string;
  user_id: string;
  card_type: GiftCardType;
  face_value: number;
  current_balance: number;
  nft_token_id?: string;
  created_at: string;
  updated_at: string;
  brand?: string;
  product_name?: string;
  status?: 'active' | 'used' | 'expired';
  value?: number;
  card_number?: string;
  expires_at?: string;
  pin?: string;
}

export type GiftCardType = 'starbucks' | 'cgv' | 'lotte' | 'shinsegae' | 'hyundai' | 'emart' | 'gmarket' | 'olive_young' | 'kyobo';

export interface GiftCardProduct {
  id: string;
  card_type: GiftCardType;
  name: string;
  description: string;
  face_values: number[];
  discount_rate: number;
  image_url: string;
  is_available: boolean;
  category: string;
  stock: number;
  price?: number;
  original_price?: number;
  rating?: number;
  reviews?: number;
  validity_days?: number;
  brand?: string;
}

export interface WithdrawalHistory {
  id: string;
  amount: number;
  date: string;
  status: string;
  type: string;
  transaction_type?: string;
  created_at?: string;
  fee?: number;
}

export interface QRTransaction {
  id: string;
  gift_card_id: string;
  amount: number;
  qr_code: string;
  expires_at: string;
  status: 'pending' | 'used' | 'expired';
  used_at?: string;
  merchant_info?: string;
}

// Navigation Types
export type NavigationTab = 'home' | 'p2p' | 'mining' | 'finance' | 'gift';

export interface NavigationItem {
  id: NavigationTab;
  label: string;
  icon: string;
  path: string;
}

// API Response Types
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
  has_more: boolean;
}

// Form Types
export interface LoginForm {
  icastle_token: string;
  device_id: string;
}

export interface P2POrderForm {
  type: 'sell' | 'buy';
  product_type: P2PProductType;
  token_symbol: TokenSymbol;
  payment_token_symbol: TokenSymbol;
  amount: number;
  price: number;
  price_per_token: string | number;
  payment_method: string;
  trade_method: TradeMethod;
  product_details?: P2PProductDetails;
}

export interface WithdrawalForm {
  coin_symbol: MineableCoin;
  amount: number;
  coinex_address: string;
}

export interface StakingForm {
  product_id: string;
  amount: number;
}

export interface GiftCardPurchaseForm {
  card_type: GiftCardType;
  face_value: number;
  quantity: number;
}

export interface QRPaymentForm {
  gift_card_id: string;
  amount: number;
}

// Store State Types
export interface UserStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  socialLogin: (provider: 'kakao' | 'google' | 'apple') => Promise<void>;
  logout: () => void;
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
  fetchOrders: (type?: 'sell' | 'buy') => Promise<void>;
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