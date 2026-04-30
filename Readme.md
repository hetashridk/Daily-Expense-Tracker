# 📊 Daily Sales Tracker - English Version

**Language Version:** English 🇬🇧 (Easy to customize to other languages)

---

## 🎁 What You Have

A **complete, production-ready daily sales tracking system** with:

✅ **Interactive Web App** - Add items, see totals in real-time
✅ **Telegram Bot** - Send summaries to Telegram anytime (FREE)
✅ **Google Sheets Integration** - Auto-save(FREE)
✅ **100% English** - All interface text in English
✅ **Multi-Language Ready** - Easy to translate to any language

---

## 📂 Files You Need

### Get These Files

| File | Purpose | Use? |
|------|---------|------|
| `telegram_sales_bot_english.js` | Main Telegram bot (ENGLISH) | **YES - USE THIS** |
| `sheets_integration.js` | Google Sheets helper | Yes |
| `package.json` | Dependencies list | Yes |
| `.env.example` | Token template | Copy to `.env` |

---

## ⚡ Quick Start (10 Minutes)

### Step 1: Get Telegram Bot Token (5 min)

```
Telegram App → Search @BotFather → Send /newbot
→ Choose name (e.g., "MySalesBot")
→ Choose username (e.g., "my_sales_bot")
→ Copy TOKEN
```

### Step 2: Install Code (3 min)

**Windows/Mac/Linux (same steps):**
```bash
mkdir sales-bot
cd sales-bot
npm init -y
npm install node-telegram-bot-api dotenv
```

### Step 3: Setup & Run (2 min)

```bash
# Copy the English bot file
cp telegram_sales_bot_english.js telegram_sales_bot.js

# Create .env with your token
echo "TELEGRAM_BOT_TOKEN=your_token_here" > .env

# Run it!
node telegram_sales_bot.js
```

### Step 4: Test (1 min)

```
Open Telegram → Find @my_sales_bot
Send: /start
Try: Milk 100
Response: ✅ Added! Milk - ₹100. Total so far: ₹100
```

**Done! 🎉 Bot is running!**

---

## 🤖 Telegram Bot Commands

### Text Commands
```
/start                → Initialize bot, show menu
/today                → Show today's sales summary
/help                 → Show help message

Text Entry (type these):
Milk 100              → Add item "Milk" for ₹100
Speaker 7000          → Add item "Speaker" for ₹7000
Book 500              → Add item "Book" for ₹500
```

### Example Conversation

```
User:  /start
Bot:   Welcome! 👋 This is your daily sales tracker
       [Keyboard with buttons shown]

User:  Milk 100
Bot:   ✅ Added!
       Milk - ₹100
       Total so far: ₹100

User:  Speaker 7000
Bot:   ✅ Added!
       Speaker - ₹7000
       Total so far: ₹7100

User:  /today
Bot:   📊 Today's Sales:
       • Milk: ₹100
       • Speaker: ₹7000
       ━━━━━━━━━━━━━━━
       Total Revenue: ₹7100

User:  💾 Save to Sheet
Bot:   Saved to Google Sheets! ✅
```

---

## 🌍 Adding Other Languages

The bot code is **text-based**, so adding Spanish, French, Hindi, Arabic, etc. is easy!

### Steps to Translate

1. Open `telegram_sales_bot.js`
2. Find all text strings (look for quotes: `"text"` or `'text'`)
3. Replace with your language
4. Keep code logic the same
5. Test on Telegram

### Example: Add Spanish

**Find these lines (around line 33-37):**
```javascript
['📊 Today\'s Sales', '📝 Add Item'],
['💾 Save to Sheet', '📈 View Summary'],
['🗑️ Clear All']
```

**Change to Spanish:**
```javascript
['📊 Ventas de Hoy', '📝 Agregar Artículo'],
['💾 Guardar en Hoja', '📈 Ver Resumen'],
['🗑️ Borrar Todo']
```

**Find this line (around line 44):**
```javascript
'*Welcome! 👋*\n\n_This is your daily sales tracker_'
```

**Change to Spanish:**
```javascript
'*¡Bienvenido! 👋*\n\n_Este es tu rastreador de ventas_'
```

**Continue replacing all text strings... Code stays the same!**

---

## 📊 Web App Interface

Use the interactive app at the top of this chat:

1. **Enter item name:** "Milk", "Speaker", "Book", etc.
2. **Enter amount:** 100, 7000, 500, etc.
3. **Repeat** for more items

All in English! ✅

---

## 💾 Google Sheets Integration

### Setup Google Sheet

1. Go to: https://sheets.google.com
2. Create new sheet
3. Add columns: Date | Item | Amount | Time
4. Share: "Anyone with link can edit"
5. Copy Sheet ID from URL
6. Configure in bot

---

## 🚀 Keep Bot Running 24/7

### Option A: Manual Start
```bash
node telegram_sales_bot.js
```
- Simplest
- Run when needed
- Stop with Ctrl+C

### Option B: Always Running on PC

**Windows:**
```bash
npm install -g pm2
pm2 start telegram_sales_bot.js
pm2 startup
pm2 save
```

**Mac/Linux:**
```bash
sudo npm install -g pm2
pm2 start telegram_sales_bot.js
pm2 startup
pm2 save
```

### Option C: Cloud Server (Best - FREE)

Deploy to **Railway.app** or **Render.com**:
1. Sign up with GitHub (free)
2. Connect your code repository
3. Auto-deploy
4. Bot runs forever 24/7
5. No credit card needed

---

## 🐛 Troubleshooting

### Bot not responding?
- **Check:** Token is correct (copy-paste carefully, no spaces)
- **Check:** Internet connection
- **Action:** Restart bot: Ctrl+C then run again
- **Debug:** Look at console for error messages

### "Module not found" error?
- **Action:** Run `npm install` in the correct folder
- **Check:** `npm list` shows dependencies installed
- **File:** Verify package.json is in the folder

### Token invalid?
- **Action:** Get new token from @BotFather
- **Check:** No extra spaces in .env file
- **File:** Verify .env file has no quotes around token

### Google Sheets not updating?
- **Check:** Sheet is shared publicly
- **Check:** Sheet ID is correct
- **Check:** Bot is running at 9 PM
- **Debug:** Check console for errors

### Bot stops when I close terminal?
- **Solution:** Use PM2 (see Option B above)
- **Solution:** Deploy to cloud (see Option C above)
- **Action:** Don't close terminal while testing

---

## 📝 File Structure

After setup, your folder looks like:
```
sales-bot/
├── telegram_sales_bot.js          ← Main bot (use _english version)
├── sheets_integration.js          ← Google Sheets helper
├── package.json                   ← Dependencies
├── .env                           ← Your token (created by you)
├── .env.example                   ← Template (reference)
├── node_modules/                  ← Auto-created (don't touch)
├── sales_log.json                 ← Auto-created (backup)
└── daily_sales.json               ← Auto-created (today's sales)
```

---

## 🎯 Complete Setup Checklist

- [ ] Download telegram_sales_bot_english.js
- [ ] Get Telegram bot token from @BotFather
- [ ] Run `npm init -y`
- [ ] Run `npm install node-telegram-bot-api dotenv`
- [ ] Copy bot file: `cp telegram_sales_bot_english.js telegram_sales_bot.js`
- [ ] Create .env with token
- [ ] Run `node telegram_sales_bot.js`
- [ ] Test on Telegram: /start
- [ ] Try adding item: "Milk 100"
- [ ] Check response in English ✅

---

## 💡 Features

### Core Features
✅ Add items with amounts
✅ View running total
✅ Local data backup (sales_log.json)

### Telegram Integration
✅ Send summaries anytime
✅ 24/7 availability
✅ Message history
✅ Multiple users supported

### Google Sheets
✅ Manual save anytime
✅ Date & time tracking
✅ Item details stored
✅ Shareable with team

### Language Features
✅ 100% English interface
✅ Easy to translate to other languages
✅ Just edit text, no code changes
✅ Support unlimited languages

---

## 🌐 Language Translation Guide

**Supported languages (easy to add):**
- English ✅ (Current)
- Spanish 🇪🇸 (Follow examples)
- French 🇫🇷 (Follow examples)
- German 🇩🇪 (Follow examples)
- Hindi 🇮🇳 (Original version available)
- Chinese 🇨🇳 (Follow examples)
- Arabic 🇸🇦 (Follow examples)
- ... and more!

See `ENGLISH_VERSION_SUMMARY.md` for translation examples.

---

## 📞 Support

If you get stuck:

1. **Read the error message** - It tells you what's wrong
2. **Google the error** - Very likely someone solved it
3. **Check TROUBLESHOOTING** section above
4. **Verify token** - No extra spaces, correct format
5. **Check internet** - Bot needs internet to run
6. **Restart bot** - Sometimes fixes weird issues

---

## ✨ Next Steps

**Immediate:**
1. Download files
2. Get bot running

**Soon:**
1. Set up Google Sheets backup
2. Deploy to cloud (if you want 24/7)
3. Share with team

**Later:**
1. Translate to other language
2. Add features
3. Export data to Excel

---

## 🎉 You're Ready!

Your Daily Sales Tracker in **100% English** is ready to use!

All files are in your outputs folder. Download them and follow the setup guide.

Good luck! 📊🚀

---

**Version:** 1.0 English
**Status:** Production Ready ✅
**Languages:** English, easily customizable
**Cost:** FREE (Telegram + Google Sheets)
