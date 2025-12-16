import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

// Helper function to find or create OAuth user
const findOrCreateOAuthUser = async (profile, providerField, done) => {
    try {
        // Use email from profile if available, otherwise create placeholder
        const email = profile.emails?.[0]?.value || `${providerField}_${profile.id}@placeholder.com`;

        // Check if user exists with provider ID (googleId or facebookId)
        let user = await User.findOne({ [providerField]: profile.id });

        if (!user) {
            // Check if user exists with email
            user = await User.findOne({ email: email });

            if (user) {
                // Link account to existing user
                user[providerField] = profile.id;
                user.avatar = profile.photos?.[0]?.value || user.avatar;
                await user.save();
            } else {
                // Create new user with random password
                const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
                const hashedPassword = await bcrypt.hash(randomPassword, 10);

                user = await User.create({
                    name: profile.displayName,
                    email: email,
                    [providerField]: profile.id,
                    avatar: profile.photos?.[0]?.value,
                    password: hashedPassword,
                });
            }
        }
        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
};

// Google OAuth Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:8000/api/v1/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            return findOrCreateOAuthUser(profile, "googleId", done);
        }
    )
);

// Facebook OAuth Strategy
passport.use(
    new FacebookStrategy(
        {
            clientID: process.env.FACEBOOK_APP_ID,
            clientSecret: process.env.FACEBOOK_APP_SECRET,
            callbackURL: "http://localhost:8000/api/v1/auth/facebook/callback",
            profileFields: ["id", "displayName", "emails", "photos"],
        },
        async (accessToken, refreshToken, profile, done) => {
            return findOrCreateOAuthUser(profile, "facebookId", done);
        }
    )
);

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;
