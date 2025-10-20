# 🔧 NPM Installation Troubleshooting Guide

## ❌ Error You're Experiencing

```
npm error code ERR_SSL_CIPHER_OPERATION_FAILED
npm error 745F0000:error:1C800066:Provider routines:ossl_gcm_stream_update:cipher operation failed
```

This is a known issue with certain Node.js versions (especially v20+) and OpenSSL 3.x on Windows.

---

## 🎯 Solutions (Try in Order)

### **Solution 1: Update Node.js (RECOMMENDED)**

The most reliable fix is to update to the latest LTS version of Node.js:

1. **Download Latest Node.js LTS**
   - Visit: https://nodejs.org/
   - Download: LTS (Long Term Support) version
   - Install and restart your terminal

2. **Verify Installation**
   ```powershell
   node --version  # Should be v20.11+ or v22+
   npm --version   # Should be 10+
   ```

3. **Try Installation Again**
   ```powershell
   cd c:\Users\a2z\Desktop\leelaverse\backend
   npm install
   ```

---

### **Solution 2: Use Different Registry**

Try using a different npm registry (Cloudflare or Taobao mirror):

```powershell
cd c:\Users\a2z\Desktop\leelaverse\backend

# Clean everything first
Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue
npm cache clean --force

# Use Cloudflare registry (faster and more reliable)
npm config set registry https://registry.npmmirror.com
npm install

# Or try yarn instead
npm install -g yarn
yarn install
```

---

### **Solution 3: Use Node Version Manager (NVM)**

Install Node.js v18 LTS (more stable with OpenSSL):

1. **Install NVM for Windows**
   - Download: https://github.com/coreybutler/nvm-windows/releases
   - Install `nvm-setup.exe`

2. **Install Node.js v18**
   ```powershell
   nvm install 18.20.0
   nvm use 18.20.0
   node --version  # Should show v18.20.0
   ```

3. **Try Installation**
   ```powershell
   cd c:\Users\a2z\Desktop\leelaverse\backend
   npm cache clean --force
   npm install
   ```

---

### **Solution 4: Disable OpenSSL 3.x Legacy Provider**

Set Node.js to use legacy OpenSSL provider:

```powershell
cd c:\Users\a2z\Desktop\leelaverse\backend

# Set environment variable (temporary)
$env:NODE_OPTIONS="--openssl-legacy-provider"
npm install

# Or add to your profile (permanent)
[System.Environment]::SetEnvironmentVariable('NODE_OPTIONS', '--openssl-legacy-provider', 'User')
```

---

### **Solution 5: Use Offline Installation**

If online installation fails, use offline method:

1. **On a working machine or different network:**
   ```powershell
   npm pack @prisma/client
   npm pack prisma
   # This creates .tgz files
   ```

2. **Transfer files and install:**
   ```powershell
   npm install ./prisma-6.2.0.tgz
   npm install ./@prisma-client-6.2.0.tgz
   ```

---

### **Solution 6: Manual Dependency Installation**

Install packages one by one:

```powershell
cd c:\Users\a2z\Desktop\leelaverse\backend

# Install Prisma separately
npm config set strict-ssl false
npm install prisma@latest --save-dev --no-optional
npm install @prisma/client@latest --no-optional

# Then install rest
npm install
```

---

### **Solution 7: Use Different Network**

Sometimes corporate/ISP firewalls cause SSL issues:

1. **Try mobile hotspot** or different WiFi
2. **Use VPN** if available
3. **Check firewall settings**

---

### **Solution 8: Run PowerShell as Administrator**

Some file permission issues require admin rights:

1. Right-click PowerShell
2. Select "Run as Administrator"
3. Navigate to backend folder
4. Try installation again

---

## 🚀 Alternative: Skip npm install and use Manual Setup

If npm install keeps failing, you can proceed with Prisma setup manually:

### **Step 1: Download Prisma Binaries**

Visit https://github.com/prisma/prisma/releases and download:
- `prisma-cli-windows.exe`
- Place in `backend/node_modules/.bin/`

### **Step 2: Generate Prisma Client Manually**

```powershell
cd c:\Users\a2z\Desktop\leelaverse\backend

# Download Prisma CLI
npx --yes prisma@latest generate

# This downloads only Prisma without dependencies
```

### **Step 3: Install Core Dependencies Only**

```powershell
# Install just the essentials
npm install express cors dotenv jsonwebtoken bcryptjs --no-optional
npm install @prisma/client --no-optional
```

---

## 🔍 Diagnostic Commands

Run these to diagnose the issue:

```powershell
# Check Node.js version
node --version

# Check npm version
npm --version

# Check OpenSSL version
node -p "process.versions.openssl"

# Check npm config
npm config list

# Check for permission issues
icacls "C:\Users\a2z\Desktop\leelaverse\backend\node_modules"

# Test npm registry connection
npm ping

# Check Node.js TLS
node -e "console.log(require('tls').DEFAULT_MIN_VERSION)"
```

---

## 💡 Quick Fix for Your Situation

Since you're getting SSL cipher errors, try this sequence:

```powershell
# 1. Reset npm config
npm config delete strict-ssl
npm config delete registry
npm config set registry https://registry.npmjs.org/

# 2. Use Node.js 18 (if possible)
nvm use 18.20.0

# 3. Clean and reinstall
cd c:\Users\a2z\Desktop\leelaverse\backend
Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue
npm cache clean --force

# 4. Install with specific flags
npm install --legacy-peer-deps --no-audit --no-fund

# 5. If still failing, use yarn
npm install -g yarn
yarn install
```

---

## 📋 What You Need to Install

Your `package.json` requires:

### Production Dependencies:
- @prisma/client (Database ORM client)
- express, cors, helmet (Web server)
- bcryptjs, jsonwebtoken (Authentication)
- dotenv (Environment variables)
- Other supporting packages

### Dev Dependencies:
- prisma (Database CLI tool)
- nodemon (Dev server)

---

## 🎯 After Successful Installation

Once npm install succeeds, run:

```powershell
# 1. Generate Prisma Client
npx prisma generate

# 2. Run migration
npx prisma migrate dev --name init

# 3. Start server
npm run dev
```

---

## 🆘 Still Having Issues?

### Option A: Use Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]
```

### Option B: Use Online IDE
- Use GitHub Codespaces
- Use Replit
- Use Gitpod

### Option C: Fresh Windows Install
Sometimes Node.js installation gets corrupted:
1. Uninstall Node.js completely
2. Delete `C:\Users\a2z\AppData\Roaming\npm`
3. Delete `C:\Users\a2z\AppData\Roaming\npm-cache`
4. Reinstall Node.js LTS
5. Try again

---

## 📞 Contact Support

If none of these work:
1. Share your Node.js version: `node --version`
2. Share your OpenSSL version: `node -p "process.versions.openssl"`
3. Share your Windows version
4. Check npm debug logs in: `C:\Users\a2z\AppData\Local\npm-cache\_logs\`

---

**Most Common Fix:** Update to Node.js v20.11+ or v22+ (LTS)

**Quick Alternative:** Use `yarn` instead of `npm`
