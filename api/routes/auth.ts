/**
 * User authentication API routes
 * Handle user registration, login, logout, OAuth, etc.
 */
import { Router, type Request, type Response } from 'express'
import passport from '../passport'
import { dbManager } from '../database'
import { generateToken } from '../utils/jwt'
import { authenticateToken } from '../middleware/auth'
import 'dotenv/config'

const router = Router()

/**
 * User Registration
 * POST /api/auth/register
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, turnstileToken } = req.body;

    // Validate required fields
    if (!email || !password || !name) {
      res.status(400).json({
        success: false,
        message: 'Email, password, and name are required'
      });
      return;
    }

    // Verify Turnstile token
    if (!turnstileToken) {
      res.status(400).json({
        success: false,
        message: 'Turnstile verification is required'
      });
      return;
    }

    // Check if user already exists
    const existingUser = await dbManager.findUserByEmail(email);
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
      return;
    }

    // Create new user
    const newUser = await dbManager.createUser({
      email,
      password,
      name,
      provider: 'local'
    });

    // Generate JWT token
    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          provider: newUser.provider,
          avatar: newUser.avatar
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
})

/**
 * User Login
 * POST /api/auth/login
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, turnstileToken } = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
      return;
    }

    // Verify Turnstile token
    if (!turnstileToken) {
      res.status(400).json({
        success: false,
        message: 'Turnstile verification is required'
      });
      return;
    }

    // Find user by email
    const user = await dbManager.findUserByEmail(email);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    // Verify password
    if (!user.password) {
      res.status(401).json({
        success: false,
        message: 'This account uses social login. Please use the appropriate social login method.'
      });
      return;
    }

    const isValidPassword = await dbManager.verifyPassword(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    // Generate JWT token
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          provider: user.provider,
          avatar: user.avatar
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
})

/**
 * User Logout
 * POST /api/auth/logout
 */
router.post('/logout', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    // In JWT-based auth, logout is typically handled client-side by removing the token
    // Here we can add token to a blacklist if needed, or just return success
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during logout'
    });
  }
})

/**
 * Get Current User
 * GET /api/auth/me
 */
router.get('/me', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await dbManager.findUserById(req.user!.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          provider: user.provider,
          avatar: user.avatar
        }
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
})

// OAuth Routes

/**
 * Kakao OAuth Login
 * GET /api/auth/kakao
 */
router.get('/kakao', (req: Request, res: Response, next) => {
  // Check if Kakao OAuth is configured
  if (!process.env.KAKAO_CLIENT_ID || !process.env.KAKAO_CLIENT_SECRET || 
      process.env.KAKAO_CLIENT_ID === 'your_kakao_client_id' || 
      process.env.KAKAO_CLIENT_SECRET === 'your_kakao_client_secret') {
    return res.status(501).json({
      success: false,
      error: 'Kakao OAuth is not configured on this server',
      message: 'Please configure KAKAO_CLIENT_ID and KAKAO_CLIENT_SECRET in your .env file with actual values from Kakao Developers Console'
    });
  }
  passport.authenticate('kakao')(req, res, next);
});

/**
 * Kakao OAuth Callback
 * GET /api/auth/kakao/callback
 */
router.get('/kakao/callback', 
  passport.authenticate('kakao', { session: false }),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user as any;
      if (!user) {
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_failed`);
        return;
      }

      const token = generateToken(user);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/success?token=${token}`);
    } catch (error) {
      console.error('Kakao OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_error`);
    }
  }
);

/**
 * Google OAuth Login
 * GET /api/auth/google
 */
router.get('/google', (req: Request, res: Response, next) => {
  try {
    console.log('Google OAuth route accessed');
    console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set');
    console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set');
    
    // Check if Google OAuth is configured
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET ||
        process.env.GOOGLE_CLIENT_ID === 'your_google_client_id' ||
        process.env.GOOGLE_CLIENT_SECRET === 'your_google_client_secret') {
      console.log('Google OAuth not configured properly');
      return res.status(501).json({
        success: false,
        error: 'Google OAuth is not configured on this server',
        message: 'Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file with actual values from Google Cloud Console'
      });
    }
    
    console.log('Initiating Google OAuth authentication');
    console.log('Available passport strategies:', Object.keys(passport._strategies || {}));
    
    if (!passport._strategies || !passport._strategies.google) {
      console.error('Google strategy not found in passport');
      return res.status(500).json({ success: false, error: 'Google OAuth strategy not configured' });
    }
    
    const authenticator = passport.authenticate('google', { scope: ['profile', 'email'] });
    console.log('Google authenticator created successfully');
    authenticator(req, res, next);
  } catch (error) {
    console.error('Google OAuth error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ success: false, error: 'Server internal error' });
  }
});

/**
 * Google OAuth Callback
 * GET /api/auth/google/callback
 */
router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user as any;
      if (!user) {
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_failed`);
        return;
      }

      const token = generateToken(user);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/success?token=${token}`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_error`);
    }
  }
);

/**
 * Apple OAuth Login
 * GET /api/auth/apple
 */
router.get('/apple', (req: Request, res: Response, next) => {
  // Check if Apple OAuth is configured
  if (!process.env.APPLE_CLIENT_ID || !process.env.APPLE_TEAM_ID || !process.env.APPLE_KEY_ID || !process.env.APPLE_PRIVATE_KEY) {
    return res.status(501).json({
      success: false,
      error: 'Apple OAuth is not configured on this server'
    });
  }
  passport.authenticate('apple')(req, res, next);
});

/**
 * Apple OAuth Callback
 * POST /api/auth/apple/callback
 */
router.post('/apple/callback',
  passport.authenticate('apple', { session: false }),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user as any;
      if (!user) {
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_failed`);
        return;
      }

      const token = generateToken(user);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/success?token=${token}`);
    } catch (error) {
      console.error('Apple OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_error`);
    }
  }
);

/**
 * Turnstile Verification
 * POST /api/auth/verify-turnstile
 */
router.post('/verify-turnstile', async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({
        success: false,
        error: 'Turnstile token is required'
      });
      return;
    }

    const secretKey = process.env.TURNSTILE_SECRET_KEY;
    if (!secretKey) {
      console.error('TURNSTILE_SECRET_KEY is not configured');
      res.status(500).json({
        success: false,
        error: 'Server configuration error'
      });
      return;
    }

    // Verify the token with Cloudflare Turnstile
    const formData = new FormData();
    formData.append('secret', secretKey);
    formData.append('response', token);
    
    // Get client IP (optional but recommended)
    const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] as string;
    if (clientIP) {
      formData.append('remoteip', clientIP);
    }

    const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData
    });

    const verifyResult = await verifyResponse.json();

    if (verifyResult.success) {
      res.json({
        success: true,
        message: 'Turnstile verification successful'
      });
    } else {
      console.error('Turnstile verification failed:', verifyResult);
      res.status(400).json({
        success: false,
        error: 'Turnstile verification failed',
        details: verifyResult['error-codes'] || []
      });
    }
  } catch (error) {
    console.error('Turnstile verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during verification'
    });
  }
})

export default router
