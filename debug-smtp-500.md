# SMTP Accounts 500 Error Debugging Guide

## 🚨 **Issue**: 500 Internal Server Error when fetching SMTP accounts

### **1. Backend Server Check**

**Check if your backend server is running:**
```bash
# Check if backend is running on port 5000
curl http://localhost:5000/api/health
# or
curl http://localhost:5000/api/auth/test
```

**Expected response:**
```json
{
  "success": true,
  "message": "Server is running"
}
```

### **2. SMTP Endpoint Test**

**Test the SMTP accounts endpoint directly:**
```bash
curl -X GET http://localhost:5000/api/smtp/accounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### **3. Backend Logs**

**Check your backend console/logs for errors:**
- Look for any error messages when the SMTP endpoint is called
- Check for database connection issues
- Look for authentication/authorization errors

### **4. Database Check**

**Verify SMTP accounts table exists:**
```sql
-- Check if smtp_accounts table exists
SHOW TABLES LIKE 'smtp_accounts';

-- Check table structure
DESCRIBE smtp_accounts;

-- Check if there are any accounts
SELECT COUNT(*) FROM smtp_accounts;
```

### **5. Authentication Check**

**Verify your authentication token:**
1. Open browser DevTools (F12)
2. Go to Application/Storage tab
3. Check localStorage for:
   - `token`
   - `access_token`
   - `auth_token`
4. Verify the token is valid and not expired

### **6. Frontend Debug Steps**

**Use the debug button:**
1. Go to http://localhost:5174/single-emails
2. Click the "🧪 Test SMTP" button (yellow button)
3. Check browser console for detailed error information

**Check network tab:**
1. Open DevTools (F12)
2. Go to Network tab
3. Click "🧪 Test SMTP" button
4. Look for the failed request to `/api/smtp/accounts`
5. Check the response details

### **7. Common Causes & Solutions**

#### **A. Backend Not Running**
```bash
# Start your backend server
cd ../backend  # or wherever your backend is
npm start
# or
node server.js
```

#### **B. Database Connection Issues**
- Check database credentials
- Verify database is running
- Check connection string

#### **C. Missing SMTP Table**
```sql
-- Create smtp_accounts table if missing
CREATE TABLE smtp_accounts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  smtp_server VARCHAR(255) NOT NULL,
  smtp_port INT NOT NULL,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  use_tls BOOLEAN DEFAULT TRUE,
  use_ssl BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### **D. Authentication Issues**
- Log out and log back in
- Clear browser localStorage
- Check if token is expired

#### **E. CORS Issues**
- Verify backend CORS configuration allows frontend origin
- Check if preflight requests are handled

### **8. Temporary Workaround**

If SMTP accounts can't be loaded, you can still compose emails by:

1. **Manual SMTP Configuration:**
   - Enter SMTP settings manually in the compose form
   - Use a known SMTP account configuration

2. **Create SMTP Account First:**
   - Go to SMTP Accounts page
   - Create a new SMTP account
   - Then try composing emails again

### **9. Backend Code Check**

**Verify your backend SMTP route exists:**
```javascript
// Should exist in your backend routes
app.get('/api/smtp/accounts', authenticateToken, async (req, res) => {
  try {
    // Your SMTP accounts logic here
    const accounts = await getSMTPAccounts(req.user.id);
    res.json({ success: true, accounts });
  } catch (error) {
    console.error('SMTP accounts error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch SMTP accounts',
      error: error.message 
    });
  }
});
```

### **10. Next Steps**

1. **Check backend logs first** - Most likely source of the issue
2. **Test the endpoint directly** with curl/Postman
3. **Verify database connection** and table structure
4. **Check authentication** and token validity
5. **Use the debug button** to get more detailed error info

### **11. Error Details to Share**

When reporting the issue, include:
- Backend console logs
- Network tab response details
- Database connection status
- Authentication token status
- Full error message from browser console

