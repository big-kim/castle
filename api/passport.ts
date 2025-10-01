import passport from 'passport';
import { Strategy as KakaoStrategy } from 'passport-kakao';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as AppleStrategy } from 'passport-apple';
import { dbManager, User } from './database.js';

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await dbManager.findUserById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Kakao Strategy
if (process.env.KAKAO_CLIENT_ID && process.env.KAKAO_CLIENT_SECRET) {
  passport.use(new KakaoStrategy({
    clientID: process.env.KAKAO_CLIENT_ID,
    clientSecret: process.env.KAKAO_CLIENT_SECRET,
    callbackURL: process.env.KAKAO_REDIRECT_URI || '/auth/kakao/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await dbManager.findUserByProvider('kakao', profile.id);
      
      if (user) {
        return done(null, user);
      }

      // Check if user exists with same email
      const email = profile._json?.kakao_account?.email;
      if (email) {
        user = await dbManager.findUserByEmail(email);
        if (user) {
          // Link accounts
          await dbManager.updateUser(user.id, {
            provider: 'kakao',
            providerId: profile.id,
            avatar: profile._json?.kakao_account?.profile?.profile_image_url
          });
          return done(null, user);
        }
      }

      // Create new user
      const newUser = await dbManager.createUser({
        email: email || `kakao_${profile.id}@kakao.local`,
        name: profile.displayName || profile._json?.kakao_account?.profile?.nickname || 'Kakao User',
        provider: 'kakao',
        providerId: profile.id,
        avatar: profile._json?.kakao_account?.profile?.profile_image_url
      });

      done(null, newUser);
    } catch (error) {
      done(error, null);
    }
  }));
}

// Google Strategy
console.log('Checking Google OAuth environment variables:');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set');

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  console.log('Registering Google OAuth strategy');
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_REDIRECT_URI || '/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await dbManager.findUserByProvider('google', profile.id);
      
      if (user) {
        return done(null, user);
      }

      // Check if user exists with same email
      const email = profile.emails?.[0]?.value;
      if (email) {
        user = await dbManager.findUserByEmail(email);
        if (user) {
          // Link accounts
          await dbManager.updateUser(user.id, {
            provider: 'google',
            providerId: profile.id,
            avatar: profile.photos?.[0]?.value
          });
          return done(null, user);
        }
      }

      // Create new user
      const newUser = await dbManager.createUser({
        email: email || `google_${profile.id}@google.local`,
        name: profile.displayName || 'Google User',
        provider: 'google',
        providerId: profile.id,
        avatar: profile.photos?.[0]?.value
      });

      done(null, newUser);
    } catch (error) {
      done(error, null);
    }
  }));
}

// Apple Strategy
if (process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID && process.env.APPLE_KEY_ID && process.env.APPLE_PRIVATE_KEY) {
  passport.use(new AppleStrategy({
    clientID: process.env.APPLE_CLIENT_ID,
    teamID: process.env.APPLE_TEAM_ID,
    keyID: process.env.APPLE_KEY_ID,
    privateKey: process.env.APPLE_PRIVATE_KEY,
    callbackURL: process.env.APPLE_REDIRECT_URI || '/auth/apple/callback'
  }, async (accessToken, refreshToken, idToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await dbManager.findUserByProvider('apple', profile.id);
      
      if (user) {
        return done(null, user);
      }

      // Check if user exists with same email
      const email = profile.email;
      if (email) {
        user = await dbManager.findUserByEmail(email);
        if (user) {
          // Link accounts
          await dbManager.updateUser(user.id, {
            provider: 'apple',
            providerId: profile.id
          });
          return done(null, user);
        }
      }

      // Create new user
      const newUser = await dbManager.createUser({
        email: email || `apple_${profile.id}@apple.local`,
        name: profile.name?.firstName && profile.name?.lastName 
          ? `${profile.name.firstName} ${profile.name.lastName}`
          : 'Apple User',
        provider: 'apple',
        providerId: profile.id
      });

      done(null, newUser);
    } catch (error) {
      done(error, null);
    }
  }));
}

export default passport;