import { 
  GiftCardProduct, 
  GiftCard, 
  GiftCardPurchase, 
  GiftCardTransaction, 
  QRTransaction,
  GiftCardPurchaseForm 
} from '../types/index.js';

const API_BASE_URL = 'http://localhost:3004/api';

// Helper function for authenticated API calls
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  // userStore.ts와 동일한 토큰 키 사용
  const token = localStorage.getItem('ic-wallet-token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response;
}

export class GiftCardApiService {
  // Gift Card Products
  static async getProducts(filters?: {
    cardType?: string;
    brand?: string;
    category?: string;
    isAvailable?: boolean;
  }): Promise<GiftCardProduct[]> {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.cardType) queryParams.append('cardType', filters.cardType);
      if (filters?.brand) queryParams.append('brand', filters.brand);
      if (filters?.category) queryParams.append('category', filters.category);
      if (filters?.isAvailable !== undefined) queryParams.append('isAvailable', filters.isAvailable.toString());

      const url = `/gift/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetchWithAuth(url);
      return await response.json();
    } catch (error) {
      console.error('Error fetching gift card products:', error);
      throw error;
    }
  }

  static async getProductById(id: number): Promise<GiftCardProduct> {
    try {
      const response = await fetchWithAuth(`/gift/products/${id}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching gift card product:', error);
      throw error;
    }
  }

  static async createProduct(product: Omit<GiftCardProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<GiftCardProduct> {
    try {
      const response = await fetchWithAuth('/gift/products', {
        method: 'POST',
        body: JSON.stringify(product),
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating gift card product:', error);
      throw error;
    }
  }

  static async updateProduct(id: number, updates: Partial<GiftCardProduct>): Promise<GiftCardProduct> {
    try {
      const response = await fetchWithAuth(`/gift/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating gift card product:', error);
      throw error;
    }
  }

  // User Gift Cards
  static async getUserGiftCards(status?: string): Promise<GiftCard[]> {
    try {
      const url = `/gift/cards${status ? `?status=${status}` : ''}`;
      const response = await fetchWithAuth(url);
      return await response.json();
    } catch (error) {
      console.error('Error fetching user gift cards:', error);
      throw error;
    }
  }

  static async getGiftCardByNumber(cardNumber: string): Promise<GiftCard> {
    try {
      const response = await fetchWithAuth(`/gift/cards/${cardNumber}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching gift card:', error);
      throw error;
    }
  }

  // Gift Card Purchase
  static async purchaseGiftCard(purchaseData: {
    productId: number;
    quantity: number;
    paymentMethod: string;
  }): Promise<{ purchase: GiftCardPurchase; giftCards: GiftCard[] }> {
    try {
      const response = await fetchWithAuth('/gift/purchase', {
        method: 'POST',
        body: JSON.stringify(purchaseData),
      });
      return await response.json();
    } catch (error) {
      console.error('Error purchasing gift card:', error);
      throw error;
    }
  }

  static async getPurchaseHistory(): Promise<GiftCardPurchase[]> {
    try {
      const response = await fetchWithAuth('/gift/purchases');
      return await response.json();
    } catch (error) {
      console.error('Error fetching purchase history:', error);
      throw error;
    }
  }

  // Gift Card Usage
  static async useGiftCard(usageData: {
    cardNumber: string;
    pin: string;
    amount: number;
    merchantInfo?: string;
    description?: string;
  }): Promise<{ transaction: GiftCardTransaction; remainingBalance: number }> {
    try {
      const response = await fetchWithAuth('/gift/use', {
        method: 'POST',
        body: JSON.stringify(usageData),
      });
      return await response.json();
    } catch (error) {
      console.error('Error using gift card:', error);
      throw error;
    }
  }

  // QR Code Operations
  static async generateQRCode(qrData: {
    cardNumber: string;
    amount: number;
    merchantInfo?: string;
  }): Promise<QRTransaction> {
    try {
      const response = await fetchWithAuth('/gift/qr/generate', {
        method: 'POST',
        body: JSON.stringify(qrData),
      });
      return await response.json();
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }

  static async useQRCode(qrCode: string): Promise<{
    transaction: GiftCardTransaction;
    remainingBalance: number;
    qrTransaction: QRTransaction;
  }> {
    try {
      const response = await fetchWithAuth('/gift/qr/use', {
        method: 'POST',
        body: JSON.stringify({ qrCode }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error using QR code:', error);
      throw error;
    }
  }

  // Transactions
  static async getTransactions(): Promise<GiftCardTransaction[]> {
    try {
      const response = await fetchWithAuth('/gift/transactions');
      return await response.json();
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  static async getCardTransactions(cardNumber: string): Promise<GiftCardTransaction[]> {
    try {
      const response = await fetchWithAuth(`/gift/cards/${cardNumber}/transactions`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching card transactions:', error);
      throw error;
    }
  }

  // Helper methods for common operations
  static async getAvailableProducts(): Promise<GiftCardProduct[]> {
    return this.getProducts({ isAvailable: true });
  }

  static async getProductsByBrand(brand: string): Promise<GiftCardProduct[]> {
    return this.getProducts({ brand, isAvailable: true });
  }

  static async getProductsByCategory(category: string): Promise<GiftCardProduct[]> {
    return this.getProducts({ category, isAvailable: true });
  }

  static async getActiveGiftCards(): Promise<GiftCard[]> {
    return this.getUserGiftCards('active');
  }

  static async getUsedGiftCards(): Promise<GiftCard[]> {
    return this.getUserGiftCards('used');
  }

  static async getExpiredGiftCards(): Promise<GiftCard[]> {
    return this.getUserGiftCards('expired');
  }

  // Validation helpers
  static validateCardNumber(cardNumber: string): boolean {
    return /^IC\d{6}[A-Z0-9]{6}$/.test(cardNumber);
  }

  static validatePIN(pin: string): boolean {
    return /^\d{4}$/.test(pin);
  }

  static validateAmount(amount: number, maxAmount: number): boolean {
    return amount > 0 && amount <= maxAmount;
  }

  // Format helpers
  static formatCardNumber(cardNumber: string): string {
    return cardNumber.replace(/(.{2})(.{6})(.{6})/, '$1-$2-$3');
  }

  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  static formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  static formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Status helpers
  static getCardStatusColor(status: string): string {
    switch (status) {
      case 'active':
        return 'green';
      case 'used':
        return 'gray';
      case 'expired':
        return 'red';
      case 'suspended':
        return 'orange';
      default:
        return 'gray';
    }
  }

  static getTransactionStatusColor(status: string): string {
    switch (status) {
      case 'completed':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'failed':
        return 'red';
      case 'cancelled':
        return 'gray';
      default:
        return 'gray';
    }
  }

  // Error handling helpers
  static handleApiError(error: any): string {
    if (error.message) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'An unexpected error occurred';
  }

  static isNetworkError(error: any): boolean {
    return error.message?.includes('Network error') || 
           error.message?.includes('fetch') ||
           error.name === 'NetworkError';
  }

  static isAuthError(error: any): boolean {
    return error.message?.includes('401') || 
           error.message?.includes('Unauthorized') ||
           error.message?.includes('Authentication');
  }
}

export default GiftCardApiService;