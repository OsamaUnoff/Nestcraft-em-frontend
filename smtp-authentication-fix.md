# SMTP Authentication Error Fix Guide

## 🚨 **Error**: SMTP authentication failed: (535, b'5.7.8 Error: authentication failed: (reason unavailable)')

### **What This Error Means:**
- **Error Code 535**: Authentication failed
- **Error 5.7.8**: Authentication mechanism not available or credentials rejected
- The SMTP server is rejecting your login credentials

---

## 🔧 **Step-by-Step Fix**

### **1. Check Your SMTP Account Settings**

Go to **SMTP Accounts** page and verify:

#### **For Gmail:**
```
SMTP Server: smtp.gmail.com
SMTP Port: 587
Use TLS: ✅ Yes
Use SSL: ❌ No
Username: yourname@gmail.com (full email address)
Password: [App Password - see step 2]
```

#### **For Outlook/Hotmail:**
```
SMTP Server: smtp-mail.outlook.com
SMTP Port: 587
Use TLS: ✅ Yes
Use SSL: ❌ No
Username: yourname@outlook.com
Password: [Your regular password or app password]
```

#### **For Yahoo:**
```
SMTP Server: smtp.mail.yahoo.com
SMTP Port: 587
Use TLS: ✅ Yes
Use SSL: ❌ No
Username: yourname@yahoo.com
Password: [App password required]
```

---

### **2. Gmail App Password Setup (Most Common Fix)**

If you're using Gmail, you **MUST** use an App Password:

#### **Step 1: Enable 2-Factor Authentication**
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click **Security**
3. Enable **2-Step Verification**

#### **Step 2: Generate App Password**
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click **Security**
3. Click **2-Step Verification**
4. Scroll down and click **App passwords**
5. Select **Mail** from the dropdown
6. Click **Generate**
7. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

#### **Step 3: Update SMTP Account**
1. Go to your **SMTP Accounts** page
2. Edit your Gmail account
3. Replace the password with the 16-character app password
4. Save the changes

---

### **3. Test Your SMTP Connection**

#### **Method 1: Use the Test Button**
1. Go to **Single Emails** page
2. Click **Compose Email**
3. Select your SMTP account from the dropdown
4. Click the **Test** button next to the dropdown
5. Check if the connection test passes

#### **Method 2: Manual Test**
```bash
# Test with curl (replace with your details)
curl -X POST http://localhost:5000/api/smtp/accounts/YOUR_ACCOUNT_ID/test \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

---

### **4. Common Issues & Solutions**

#### **Issue A: "Less secure app access" (Gmail)**
**Solution**: Use App Passwords (see step 2 above)

#### **Issue B: Wrong username format**
**Solution**: Use full email address as username
- ✅ Correct: `yourname@gmail.com`
- ❌ Wrong: `yourname` or `gmail.com`

#### **Issue C: Wrong port or security settings**
**Solution**: Use these exact settings:
- Port: 587
- TLS: Enabled
- SSL: Disabled

#### **Issue D: Account locked or suspended**
**Solution**: 
1. Check your email for security alerts
2. Unlock your account at [Google Account](https://myaccount.google.com/)
3. Wait 24 hours before trying again

#### **Issue E: Rate limiting**
**Solution**: 
1. Wait 1 hour before trying again
2. Reduce the number of emails sent per hour
3. Check your email provider's sending limits

---

### **5. Alternative Email Providers**

If Gmail continues to have issues, try these alternatives:

#### **Outlook/Hotmail**
- More lenient with app passwords
- Good for business use

#### **Yahoo Mail**
- Requires app password setup
- Similar to Gmail process

#### **Custom SMTP (Your own server)**
- Full control over settings
- No third-party restrictions

---

### **6. Debug Steps**

#### **Check Backend Logs**
Look for detailed error messages in your backend console:
```bash
# Check backend logs for SMTP errors
tail -f backend/logs/app.log | grep SMTP
```

#### **Test with Different Credentials**
1. Create a new Gmail account for testing
2. Set up app password for the new account
3. Test with the new account
4. If it works, the issue is with your original account

#### **Check Network/Firewall**
1. Ensure port 587 is not blocked
2. Check if your network allows SMTP traffic
3. Try from a different network

---

### **7. Quick Fix Checklist**

- [ ] Enable 2-Factor Authentication on Gmail
- [ ] Generate App Password (16 characters)
- [ ] Update SMTP account with app password
- [ ] Use full email address as username
- [ ] Set port to 587, TLS enabled, SSL disabled
- [ ] Test connection using the Test button
- [ ] Check backend logs for detailed errors

---

### **8. Still Having Issues?**

If the problem persists:

1. **Check Backend Logs**: Look for more detailed error messages
2. **Try Different Provider**: Test with Outlook or Yahoo
3. **Contact Support**: Share the exact error message and your SMTP settings
4. **Use Test Account**: Create a new email account for testing

---

### **9. Success Indicators**

When fixed, you should see:
- ✅ "SMTP connection test successful!" message
- ✅ Emails send without authentication errors
- ✅ No more 535 error codes in logs

---

## 🎯 **Next Steps**

1. **Follow the Gmail App Password setup** (most common fix)
2. **Test your connection** using the Test button
3. **Try sending a test email** to verify the fix
4. **Update your SMTP account** if credentials were wrong

The most common cause is using a regular Gmail password instead of an App Password. Follow step 2 above and you should be able to resolve this issue!

