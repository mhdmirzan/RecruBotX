# MongoDB Atlas DNS Resolution Fix

## Problem
Your DNS server (192.168.1.1) cannot resolve MongoDB Atlas SRV records, causing connection failures.

## Solutions (Choose ONE)

### Option 1: Change DNS to Google Public DNS (RECOMMENDED)
**Requires: Administrator privileges**

1. Right-click Windows Start → **Network Connections** (or search "View network connections")
2. Right-click your active network adapter → **Properties**
3. Select **Internet Protocol Version 4 (TCP/IPv4)** → **Properties**
4. Select **Use the following DNS server addresses:**
   - Preferred DNS: `8.8.8.8`
   - Alternate DNS: `8.8.4.4`
5. Click **OK** → **Close**
6. Restart the backend server

### Option 2: Use Standard Connection String (NOT SRV)
**No admin rights needed**

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. **IMPORTANT:** Click **"Standard Connection String (not SRV)"** or the dropdown that says "Connection String Format"
5. Copy the connection string (looks like):
   ```
   mongodb://cluster0-shard-00-00.s4fp8og.mongodb.net:27017,cluster0-shard-00-01.s4fp8og.mongodb.net:27017,cluster0-shard-00-02.s4fp8og.mongodb.net:27017/recrubotx?ssl=true&replicaSet=atlas-xyz-shard-0&authSource=admin&retryWrites=true&w=majority
   ```
6. Replace `<username>` and `<password>` with: `recrubotx` and `recrubotx123`
7. Update `.env` file:
   ```
   MONGODB_URL=<your_standard_connection_string>
   ```
8. Restart the backend server

### Option 3: Use Local MongoDB (DEVELOPMENT ONLY)
**Install MongoDB Community locally**

1. Download from: https://www.mongodb.com/try/download/community
2. Install with default settings
3. Update `.env`:
   ```
   MONGODB_URL=mongodb://localhost:27017/recrubotx
   ```
4. Restart the backend

## Verification

After applying any fix, restart your backend:
```powershell
cd Backend
python -m uvicorn main:app --reload
```

Look for this message (instead of DNS error):
```
✓ Connected to MongoDB: recrubotx
```

Then test registration at: http://localhost:3000/candidate

## Current Error
```
✗ Failed to connect to MongoDB Atlas: The resolution lifetime expired after 11.634 seconds:
Server Do53:192.168.1.1@53 answered The DNS operation timed out
```

This means your router's DNS (192.168.1.1) cannot reach MongoDB Atlas SRV records.
