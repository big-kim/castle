import { Request, Response, NextFunction } from 'express';
import { DatabaseManager, dbManager } from '../database';
import jwt from 'jsonwebtoken';
import { extractTokenFromHeader } from '../utils/jwt.js';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Check if user is authenticated via session
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }

    // Get user from session
    const user = req.user as any;
    if (!user || !user.id) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid user session' 
      });
    }

    // Verify user exists in database
    const dbUser = await dbManager.findUserById(user.id);
    
    if (!dbUser) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    // Attach user info to request
    req.user = {
      id: dbUser.id,
      email: dbUser.email
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Authentication error' 
    });
  }
};

// Rate limiting middleware for wallet operations
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const walletRateLimit = (maxRequests: number = 10, windowMs: number = 60000) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not authenticated' 
      });
    }

    const now = Date.now();
    const userKey = `${userId}:${req.route?.path || req.path}`;
    const userLimit = rateLimitMap.get(userKey);

    if (!userLimit || now > userLimit.resetTime) {
      // Reset or initialize rate limit
      rateLimitMap.set(userKey, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }

    if (userLimit.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((userLimit.resetTime - now) / 1000)
      });
    }

    userLimit.count++;
    next();
  };
};

// Input validation middleware
export const validateWalletInput = (req: Request, res: Response, next: NextFunction) => {
  const { body } = req;

  // Validate amount for send operations
  if (body.amount !== undefined) {
    const amount = parseFloat(body.amount);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount. Must be a positive number.'
      });
    }
    if (amount > 1000000) { // Max transaction limit
      return res.status(400).json({
        success: false,
        error: 'Amount exceeds maximum transaction limit.'
      });
    }
    body.amount = amount;
  }

  // Validate addresses
  if (body.toAddress) {
    const address = body.toAddress.trim();
    if (!address || address.length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Invalid recipient address.'
      });
    }
    body.toAddress = address;
  }

  // Validate memo length
  if (body.memo && body.memo.length > 200) {
    return res.status(400).json({
      success: false,
      error: 'Memo too long. Maximum 200 characters.'
    });
  }

  // Validate coin type for point operations
  if (body.coinType) {
    const validCoins = ['LTC', 'DOGE', 'BELLS', 'NEXA', 'RXD', 'CLORE', 'NEOXA', 'CHIA'];
    if (!validCoins.includes(body.coinType.toUpperCase())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid coin type.'
      });
    }
    body.coinType = body.coinType.toUpperCase();
  }

  next();
};

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Strict transport security (HTTPS only)
  if (req.secure) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  next();
};

// JWT Authentication middleware
export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({
        success: false,
        error: 'JWT secret not configured'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, jwtSecret) as any;
    
    // Verify user exists in database
    const dbUser = await dbManager.findUserById(decoded.userId);
    if (!dbUser) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Attach user info to request
    req.user = {
      id: dbUser.id.toString(),
      email: dbUser.email
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    console.error('JWT Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

export { AuthenticatedRequest };