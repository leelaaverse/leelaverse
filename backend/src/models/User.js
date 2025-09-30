const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot be more than 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name cannot be more than 50 characters']
    },
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [30, 'Username cannot be more than 30 characters'],
        match: [
            /^[a-zA-Z0-9_]+$/,
            'Username can only contain letters, numbers, and underscores'
        ]
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please enter a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        validate: {
            validator: function (password) {
                // Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password);
            },
            message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        },
        select: false // Don't include password in queries by default
    },
    avatar: {
        type: String,
        default: null
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'moderator'],
        default: 'user'
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: {
        type: String,
        select: false
    },
    emailVerificationExpires: {
        type: Date,
        select: false
    },
    passwordResetToken: {
        type: String,
        select: false
    },
    passwordResetExpires: {
        type: Date,
        select: false
    },
    refreshTokens: [{
        token: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 2592000 // 30 days
        }
    }],
    lastLogin: {
        type: Date,
        default: null
    },
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date
    },
    // Profile information
    bio: {
        type: String,
        maxlength: [500, 'Bio cannot be more than 500 characters']
    },
    location: {
        type: String,
        maxlength: [100, 'Location cannot be more than 100 characters']
    },
    website: {
        type: String,
        maxlength: [200, 'Website URL cannot be more than 200 characters']
    },
    socialLinks: {
        twitter: String,
        instagram: String,
        linkedin: String,
        discord: String
    },
    // AI Creator stats
    totalCreations: {
        type: Number,
        default: 0
    },
    totalEarnings: {
        type: Number,
        default: 0
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // Account status
    isActive: {
        type: Boolean,
        default: true
    },
    isBanned: {
        type: Boolean,
        default: false
    },
    banReason: {
        type: String
    },
    banExpiresAt: {
        type: Date
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1, isBanned: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Virtual for follower count
userSchema.virtual('followerCount').get(function () {
    return this.followers ? this.followers.length : 0;
});

// Virtual for following count
userSchema.virtual('followingCount').get(function () {
    return this.following ? this.following.length : 0;
});

// Check if account is locked
userSchema.virtual('isLocked').get(function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
    // Only hash password if it's modified
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // Hash password with cost of 12
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) {
        throw new Error('Password not found for user');
    }
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate JWT token
userSchema.methods.generateAuthToken = function () {
    return jwt.sign(
        {
            id: this._id,
            email: this.email,
            role: this.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

// Method to generate refresh token
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        { id: this._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRE }
    );
};

// Method to handle failed login attempts
userSchema.methods.incLoginAttempts = function () {
    // If we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $unset: { lockUntil: 1 },
            $set: { loginAttempts: 1 }
        });
    }

    const updates = { $inc: { loginAttempts: 1 } };

    // Lock account after 5 failed attempts for 2 hours
    if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
    }

    return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function () {
    return this.updateOne({
        $unset: { loginAttempts: 1, lockUntil: 1 }
    });
};

// Method to add refresh token
userSchema.methods.addRefreshToken = function (refreshToken) {
    this.refreshTokens.push({ token: refreshToken });

    // Keep only the last 5 refresh tokens
    if (this.refreshTokens.length > 5) {
        this.refreshTokens = this.refreshTokens.slice(-5);
    }

    return this.save();
};

// Method to remove refresh token
userSchema.methods.removeRefreshToken = function (refreshToken) {
    this.refreshTokens = this.refreshTokens.filter(
        tokenObj => tokenObj.token !== refreshToken
    );
    return this.save();
};

// Method to remove all refresh tokens (logout all devices)
userSchema.methods.removeAllRefreshTokens = function () {
    this.refreshTokens = [];
    return this.save();
};

// JWT token generation methods
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            userId: this._id,
            email: this.email,
            username: this.username
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRE || '15m'
        }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            userId: this._id,
            tokenId: crypto.randomUUID()
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'
        }
    );
};

// Static method to find user by email and include password
userSchema.statics.findByCredentials = async function (email, password) {
    const user = await this.findOne({ email }).select('+password');

    if (!user) {
        throw new Error('Invalid login credentials');
    }

    if (user.isLocked) {
        throw new Error('Account temporarily locked due to too many failed login attempts');
    }

    if (!user.isActive) {
        throw new Error('Account is deactivated');
    }

    if (user.isBanned) {
        if (user.banExpiresAt && user.banExpiresAt > Date.now()) {
            throw new Error(`Account is banned until ${user.banExpiresAt.toDateString()}`);
        } else if (!user.banExpiresAt) {
            throw new Error('Account is permanently banned');
        }
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
        await user.incLoginAttempts();
        throw new Error('Invalid login credentials');
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
        await user.resetLoginAttempts();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    return user;
};

module.exports = mongoose.model('User', userSchema);