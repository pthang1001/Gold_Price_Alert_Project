# 📧 Email Configuration Guide - Gold Price Alert

## Current Status
✅ **Email system is fully configured and working!**

### Development Mode (Current)
- OTP codes are **logged to console** for easy testing
- No email actually sent, but registration works perfectly
- Great for development/testing

### Production Mode (Ready to Deploy)
- Using **Resend** email service (professional, free tier, scalable)
- Can send 100+ emails/day free tier
- Perfect for OTP + price alerts

---

## 🚀 Setup Resend (5 minutes)

### Step 1: Create Resend Account
1. Go to https://resend.com
2. Sign up with your email
3. Verify email

### Step 2: Get API Key
1. Go to https://resend.com/api-keys
2. Click "Create API Key"
3. Name it: `gold-price-alert-dev`
4. Copy the key (starts with `re_`)

### Step 3: Update .env File
Edit `backend/services/auth/.env`:

```env
# Email Configuration - Resend
RESEND_API_KEY=re_YOUR_KEY_HERE
EMAIL_FROM=noreply@yourdomain.com
```

Replace:
- `re_YOUR_KEY_HERE` → your actual Resend API key
- `noreply@yourdomain.com` → any email (format: `anything@yourdomain.com`)

### Step 4: Restart Auth Service
```bash
docker-compose restart auth-service
```

---

## 💡 Why Resend?

| Feature | Resend | SendGrid | Gmail |
|---------|--------|----------|-------|
| Free Tier | 100/day | 100/day | Limited + risky |
| Setup Time | 2 min | 5 min | 10+ min |
| Reliability | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Price | Pay-as-you-go | $19/mo | Free but limited |
| Features | Simple, modern | Complex | Basic |

---

## 📊 Current Email Flow

```
User Registration
    ↓
Auth Service generates OTP
    ↓
If RESEND_API_KEY configured:
  ├→ Send via Resend API ✅
  └→ Log: "✅ OTP email sent via Resend to user@domain.com"
    
If RESEND_API_KEY not configured (Dev Mode):
  ├→ Fall back to console logging
  └→ Log: "📧 OTP EMAIL (Console Logging - Dev Mode)"
        "OTP Code: 479470"
```

---

## 🧪 Testing

### Development Mode (Current)
```bash
# Check OTP in logs
docker logs gold-price-auth-service | grep "OTP Code:"

# Output:
# ║ OTP Code: 479470                              ║
```

### With Real Resend API Key
```bash
# Just register normally, OTP will be sent to email inbox
# Check logs for confirmation:
docker logs gold-price-auth-service | grep "OTP email sent via Resend"
```

---

## 🔐 Security Notes

- **Never commit API keys** to git
- API key is already in `.gitignore`
- Use environment variables for production
- Resend handles security, encryption, compliance

---

## 📱 Using Resend for Other Emails

Once configured, you can use Resend for:
- ✅ OTP verification (current)
- ✅ Price alert notifications
- ✅ Password reset
- ✅ Subscription alerts
- ✅ Daily digest emails
- ✅ Admin notifications

Just import the email config and call:
```javascript
const { sendOTPEmail } = require('../config/email');
await sendOTPEmail('user@domain.com', 'message body');
```

---

## 🐛 Troubleshooting

**"API key is invalid"**
- Check if API key is correct
- Make sure it starts with `re_`
- Check for extra spaces in .env

**"Email not received"**
- Check spam folder
- Verify sender email is valid
- Check Resend dashboard for bounce reasons

**"Service connection failed"**
- Verify internet connection
- Check if Resend API is up: https://status.resend.com
- Restart docker container

---

## 📝 Next Steps

1. ✅ Create Resend account
2. ✅ Get API key
3. ✅ Update .env file
4. ✅ Restart container
5. ✅ Test registration - should receive OTP email!

---

*For more info: https://resend.com/docs*
