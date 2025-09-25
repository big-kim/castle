import { ethers } from 'ethers';

// BSC Network Configuration
export const BSC_NETWORK = {
  chainId: '0x38', // 56 in hex
  chainName: 'Binance Smart Chain',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  rpcUrls: ['https://bsc-dataseed.binance.org/'],
  blockExplorerUrls: ['https://bscscan.com/'],
};

// Mock Smart Contract ABI (simplified)
export const ESCROW_CONTRACT_ABI = [
  'function listAsset(address token, uint256 amount) external returns (uint256 orderId)',
  'function initiateTrade(uint256 orderId, address buyer) external',
  'function depositAndExecute(uint256 orderId) external payable',
  'function reclaimAsset(uint256 orderId) external',
  'function getOrderStatus(uint256 orderId) external view returns (uint8)',
  'event AssetListed(uint256 indexed orderId, address indexed seller, address token, uint256 amount)',
  'event TradeInitiated(uint256 indexed orderId, address indexed buyer)',
  'event TradeCompleted(uint256 indexed orderId)',
  'event AssetReclaimed(uint256 indexed orderId)'
];

// Mock contract address (would be real deployed contract)
export const ESCROW_CONTRACT_ADDRESS = '0x1234567890123456789012345678901234567890';

// Web3 Provider Management
class Web3Manager {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private contract: ethers.Contract | null = null;

  async connectWallet(): Promise<string> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Initialize provider
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      
      // Get user address
      const address = await this.signer.getAddress();
      
      // Check if we're on BSC network
      const network = await this.provider.getNetwork();
      if (network.chainId !== 56n) {
        await this.switchToBSC();
      }
      
      // Initialize contract
      this.contract = new ethers.Contract(
        ESCROW_CONTRACT_ADDRESS,
        ESCROW_CONTRACT_ABI,
        this.signer
      );
      
      return address;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  async switchToBSC(): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BSC_NETWORK.chainId }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [BSC_NETWORK],
          });
        } catch (addError) {
          console.error('Failed to add BSC network:', addError);
          throw addError;
        }
      } else {
        console.error('Failed to switch to BSC network:', switchError);
        throw switchError;
      }
    }
  }

  async getBalance(address: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    
    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  async getTokenBalance(tokenAddress: string, userAddress: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    // ERC-20 ABI for balanceOf function
    const tokenABI = ['function balanceOf(address owner) view returns (uint256)'];
    const tokenContract = new ethers.Contract(tokenAddress, tokenABI, this.provider);
    
    const balance = await tokenContract.balanceOf(userAddress);
    return ethers.formatUnits(balance, 18); // Assuming 18 decimals
  }

  // Smart Contract Functions
  async listAsset(tokenAddress: string, amount: string): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    const amountWei = ethers.parseUnits(amount, 18);
    const tx = await this.contract.listAsset(tokenAddress, amountWei);
    await tx.wait();
    return tx.hash;
  }

  async initiateTrade(orderId: string, buyerAddress: string): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    const tx = await this.contract.initiateTrade(orderId, buyerAddress);
    await tx.wait();
    return tx.hash;
  }

  async depositAndExecute(orderId: string, paymentAmount: string): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    const amountWei = ethers.parseEther(paymentAmount);
    const tx = await this.contract.depositAndExecute(orderId, { value: amountWei });
    await tx.wait();
    return tx.hash;
  }

  async reclaimAsset(orderId: string): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    const tx = await this.contract.reclaimAsset(orderId);
    await tx.wait();
    return tx.hash;
  }

  async getOrderStatus(orderId: string): Promise<number> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    return await this.contract.getOrderStatus(orderId);
  }

  // Event Listeners
  onAssetListed(callback: (orderId: string, seller: string, token: string, amount: string) => void) {
    if (!this.contract) return;
    
    this.contract.on('AssetListed', (orderId, seller, token, amount) => {
      callback(orderId.toString(), seller, token, ethers.formatUnits(amount, 18));
    });
  }

  onTradeInitiated(callback: (orderId: string, buyer: string) => void) {
    if (!this.contract) return;
    
    this.contract.on('TradeInitiated', (orderId, buyer) => {
      callback(orderId.toString(), buyer);
    });
  }

  onTradeCompleted(callback: (orderId: string) => void) {
    if (!this.contract) return;
    
    this.contract.on('TradeCompleted', (orderId) => {
      callback(orderId.toString());
    });
  }

  onAssetReclaimed(callback: (orderId: string) => void) {
    if (!this.contract) return;
    
    this.contract.on('AssetReclaimed', (orderId) => {
      callback(orderId.toString());
    });
  }

  disconnect() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
  }
}

// Singleton instance
export const web3Manager = new Web3Manager();

// Utility functions
export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatTxHash = (hash: string): string => {
  if (!hash) return '';
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
};

export const getBSCScanUrl = (hash: string, type: 'tx' | 'address' = 'tx'): string => {
  return `https://bscscan.com/${type}/${hash}`;
};

// Type declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}