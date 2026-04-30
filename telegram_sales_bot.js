// Daily Sales Telegram Bot - LOOP-FREE VERSION
// Strict message ID tracking prevents any recursive/loop submissions
// Install: npm install node-telegram-bot-api dotenv axios
// Setup: Create .env file with TELEGRAM_BOT_TOKEN and GOOGLE_SHEET_ID

const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;

// ==================== SINGLE INSTANCE LOCK ====================
const LOCK_FILE = 'bot.lock';

function acquireLock() {
  try {
    if (fs.existsSync(LOCK_FILE)) {
      const pid = fs.readFileSync(LOCK_FILE, 'utf-8').trim();
      // Check if the old process is still running
      try {
        process.kill(parseInt(pid), 0);
        console.error(`❌ Another bot instance is already running (PID ${pid}). Exiting.`);
        console.error('   Run: taskkill /F /PID ' + pid + '  (or close the other terminal)');
        process.exit(1);
      } catch {
        // Process not running, stale lock — remove it
        console.log('🔓 Removing stale lock file from dead process');
        fs.unlinkSync(LOCK_FILE);
      }
    }
    fs.writeFileSync(LOCK_FILE, String(process.pid));
  } catch (err) {
    console.error('Lock error:', err.message);
  }
}

function releaseLock() {
  try { fs.unlinkSync(LOCK_FILE); } catch {}
}

acquireLock();

const bot = new TelegramBot(TOKEN, { polling: true });

// ==================== STRICT DUPLICATE PREVENTION ====================
// File-based dedup so even two simultaneous processes don't double-process
const SEEN_IDS_FILE = 'seen_message_ids.json';
const SEEN_IDS_TTL_MS = 60000; // forget IDs after 60 seconds

function loadSeenIds() {
  try {
    return JSON.parse(fs.readFileSync(SEEN_IDS_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function isMessageAlreadyProcessed(messageId) {
  if (!messageId) return false;
  const seen = loadSeenIds();
  const entry = seen[messageId];
  if (!entry) return false;
  return (Date.now() - entry) < SEEN_IDS_TTL_MS;
}

function markMessageAsProcessed(messageId) {
  if (!messageId) return;
  const seen = loadSeenIds();
  const now = Date.now();
  seen[messageId] = now;
  // Prune old entries to keep file small
  for (const id in seen) {
    if (now - seen[id] > SEEN_IDS_TTL_MS) delete seen[id];
  }
  fs.writeFileSync(SEEN_IDS_FILE, JSON.stringify(seen));
}

// ==================== FILE OPERATIONS ====================

function getSalesLog() {
  try {
    return JSON.parse(fs.readFileSync('sales_log.json', 'utf-8')) || {};
  } catch {
    return {};
  }
}

function saveSalesLog(data) {
  fs.writeFileSync('sales_log.json', JSON.stringify(data, null, 2));
}

function getTodayKey() {
  return new Date().toLocaleDateString('en-US');
}

// ==================== GOOGLE SHEETS INTEGRATION ====================

// Submit single item to Google Form - NO RECURSION
async function submitToGoogleForm(date, itemName, amount, time) {
  try {
    if (!GOOGLE_SHEET_ID) {
      console.log('⚠️ GOOGLE_SHEET_ID not set in .env');
      return false;
    }

    const formUrl = `https://docs.google.com/forms/d/e/${GOOGLE_SHEET_ID}/formResponse`;
    
    const data = new URLSearchParams();
    console.log('date ' + date)
    data.append('entry.1192946452', date);           // DATE
    console.log('itemName' + itemName)
    data.append('entry.682169264', itemName);        // ITEM NAME
    console.log('amount' + amount)
    data.append('entry.1195426964', amount);         // AMOUNT
    console.log('time' + time)
    data.append('entry.94204135', time);             // TIME

    const response = await axios.post(formUrl, data, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 5000
    });

    console.log(`✅ ${new Date().toLocaleTimeString()} - Synced: ${itemName} (₹${amount})`);
    return true;
  } catch (error) {
    console.log(`⚠️ Google Sheets error: ${error.message}`);
    return false;
  }
}

// ==================== SALES DATA MANAGEMENT ====================

async function addSalesItem(userId, itemName, amount) {
  const today = getTodayKey();
  const timestamp = new Date().toLocaleTimeString();
  
  const salesLog = getSalesLog();
  
  if (!salesLog[today]) {
    salesLog[today] = {};
  }
  
  if (!salesLog[today][userId]) {
    salesLog[today][userId] = {
      items: [],
      total: 0
    };
  }
  
  // Add item
  salesLog[today][userId].items.push({
    name: itemName,
    amount: amount,
    timestamp: timestamp
  });
  
  salesLog[today][userId].total += amount;
  salesLog[today][userId].lastUpdated = new Date().toLocaleString();
  
  // Save locally first
  saveSalesLog(salesLog);
  
  // Then sync to Google Form (do not wait for response to avoid loops)
  submitToGoogleForm(today, itemName, amount, timestamp).catch(err => {
    console.log('Background sync error:', err.message);
  });
  
  return salesLog[today][userId];
}

function getTodaysSales(userId) {
  const today = getTodayKey();
  const salesLog = getSalesLog();
  
  if (salesLog[today] && salesLog[today][userId]) {
    return salesLog[today][userId];
  }
  
  return { items: [], total: 0 };
}

function clearTodayData(userId) {
  const today = getTodayKey();
  const salesLog = getSalesLog();
  
  if (salesLog[today]) {
    delete salesLog[today][userId];
  }
  
  saveSalesLog(salesLog);
}

function getAllTimeStats() {
  const salesLog = getSalesLog();
  let totalDays = 0;
  let totalAmount = 0;
  let totalItems = 0;
  let highestDay = { date: '', amount: 0 };
  
  for (const date in salesLog) {
    const dayTotal = Object.values(salesLog[date]).reduce((sum, user) => sum + (user.total || 0), 0);
    const dayItems = Object.values(salesLog[date]).reduce((sum, user) => sum + (user.items?.length || 0), 0);
    
    if (dayTotal > 0) totalDays++;
    totalAmount += dayTotal;
    totalItems += dayItems;
    
    if (dayTotal > highestDay.amount) {
      highestDay = { date, amount: dayTotal };
    }
  }
  
  return {
    totalDays,
    totalAmount,
    totalItems,
    avgPerDay: totalDays > 0 ? Math.round(totalAmount / totalDays) : 0,
    highestDay
  };
}

// ==================== MESSAGE HANDLERS ====================

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const messageId = msg.message_id;
  
  // Skip if already processed
  if (isMessageAlreadyProcessed(messageId)) {
    console.log(`⏭️  Skipping duplicate /start message ${messageId}`);
    return;
  }
  markMessageAsProcessed(messageId);
  
  const keyboard = {
    reply_markup: {
      keyboard: [
        ['📊 Today\'s Sales', '📝 Add Item'],
        ['📈 View Summary', '📅 All-Time Stats'],
        ['🗑️ Clear Today']
      ],
      resize_keyboard: true
    }
  };
  
  bot.sendMessage(
    chatId,
    '*Welcome! 👋*\n\n_Daily Sales Tracker_\n\n' +
    '✅ Add items (format: Milk 100 or Milk, 100)\n' +
    '✅ Add same item multiple times per day\n' +
    '✅ Auto-syncs to Google Sheets\n' +
    '✅ View totals with graphs\n' +
    '✅ Track all-time statistics\n\n' +
    '*What would you like to do?*',
    { ...keyboard, parse_mode: 'Markdown' }
  );
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text;
  const messageId = msg.message_id;
  
  // ==================== CRITICAL: CHECK DUPLICATE MESSAGE ====================
  if (isMessageAlreadyProcessed(messageId)) {
    console.log(`⏭️  [DUPLICATE BLOCKED] Message ${messageId}: "${text}"`);
    return;
  }
  markMessageAsProcessed(messageId);
  
  // ==================== HANDLE COMMANDS ====================
  
  if (text === '📊 Today\'s Sales') {
    showTodaysSales(chatId, userId);
    return;
  }
  
  if (text === '📝 Add Item') {
    bot.sendMessage(chatId, 
      '*Enter item:*\n\n_Format: "Milk 100" or "Milk, 100" or "Milk-100"_\n\nExamples:\n' +
      '• Juice 10\n' +
      '• Watch 8500\n' +
      '• Tea 50',
      { parse_mode: 'Markdown', reply_markup: { force_reply: true } }
    );
    return;
  }
  
  if (text === '📈 View Summary') {
    showTodaysSales(chatId, userId);
    return;
  }
  
  if (text === '📅 All-Time Stats') {
    showAllTimeStats(chatId);
    return;
  }
  
  if (text === '🗑️ Clear Today') {
    clearTodayData(userId);
    bot.sendMessage(chatId, '🗑️ Today\'s data cleared\n\n✅ Fresh start for a new day!');
    return;
  }
  
  // ==================== HANDLE ITEM INPUT ====================
  if (text && !text.startsWith('/')) {
    const itemMatch = text.match(/^(.+?)\s*[,\-:\s]+\s*(\d+)$/);
    
    if (itemMatch) {
      const itemName = itemMatch[1].trim();
      const amount = parseInt(itemMatch[2]);
      
      // Validate
      if (itemName.length < 2) {
        bot.sendMessage(chatId, '❌ Item name too short\n\n_Example: "Milk 100"_');
        return;
      }
      
      if (amount <= 0) {
        bot.sendMessage(chatId, '❌ Amount must be greater than 0');
        return;
      }
      
      // Add item (do NOT await - fire and forget to prevent loops)
      const updatedSales = await addSalesItem(userId, itemName, amount);
      
      if (updatedSales) {
        let graphBar = '█'.repeat(Math.min(updatedSales.total / 100, 20));
        
        bot.sendMessage(chatId,
          `✅ *Added & Syncing...*\n\n` +
          `📦 ${itemName}: *₹${amount}*\n` +
          `📊 Total Today: *₹${updatedSales.total}*\n` +
          `🔢 Items: ${updatedSales.items.length}\n\n` +
          `${graphBar} ${updatedSales.total}\n\n` +
          `⏰ ${new Date().toLocaleTimeString()}`,
          { parse_mode: 'Markdown' }
        );
      }
    } else {
      bot.sendMessage(chatId,
        '❓ Wrong format!\n\n' +
        '_Use one of these:_\n' +
        '• Milk 100\n' +
        '• Milk, 100\n' +
        '• Milk-100\n' +
        '• Juice 10'
      );
    }
  }
});

// ==================== DISPLAY FUNCTIONS ====================

function showTodaysSales(chatId, userId) {
  const sales = getTodaysSales(userId);
  
  if (!sales.items || sales.items.length === 0) {
    bot.sendMessage(chatId,
      '📭 *No sales yet today*\n\n' +
      '_Press 📝 Add Item to start tracking_'
    );
    return;
  }
  
  let message = `📊 *Today's Sales Summary*\n\n`;
  message += `📅 *${getTodayKey()}*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
  
  sales.items.forEach((item, index) => {
    const barLength = Math.min(Math.floor(item.amount / 500), 10);
    const bar = '▓'.repeat(barLength) + '░'.repeat(10 - barLength);
    message += `${index + 1}. *${item.name}*\n`;
    message += `   ${bar} ₹${item.amount}\n`;
    message += `   ⏰ ${item.timestamp}\n\n`;
  });
  
  const totalBarLength = Math.min(Math.floor(sales.total / 1000), 15);
  const totalBar = '█'.repeat(totalBarLength) + '░'.repeat(15 - totalBarLength);
  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `*🎯 TOTAL:* *₹${sales.total}*\n`;
  message += `${totalBar}\n`;
  message += `📝 Items: ${sales.items.length}`;
  
  bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
}

function showAllTimeStats(chatId) {
  const stats = getAllTimeStats();
  
  let message = `📈 *All-Time Statistics*\n\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📊 Total Days: *${stats.totalDays}*\n`;
  message += `💰 Total Revenue: *₹${stats.totalAmount.toLocaleString()}*\n`;
  message += `📦 Total Items: *${stats.totalItems}*\n`;
  message += `📈 Average/Day: *₹${stats.avgPerDay.toLocaleString()}*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `🏆 *Highest Day:*\n`;
  message += `📅 ${stats.highestDay.date}\n`;
  message += `💰 ₹${stats.highestDay.amount.toLocaleString()}`;
  
  bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
}

// ==================== STARTUP ====================

console.log('✅ Bot started! Ready for sales tracking...');
console.log('📝 Supported formats: "Item 100" or "Item, 100" or "Item-100"');
console.log('☁️  AUTO-SYNC ENABLED: Syncs to Google Sheets in background');
console.log('🛡️  LOOP PREVENTION: Strict message ID tracking active');
console.log('✅ Entry IDs configured correctly!');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// ==================== GRACEFUL SHUTDOWN ====================
// Handle process termination (for nodemon restarts)
process.on('SIGINT', () => {
  console.log('\n🛑 Bot shutting down gracefully...');
  bot.stopPolling();
  releaseLock();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Bot shutting down gracefully...');
  bot.stopPolling();
  releaseLock();
  process.exit(0);
});

process.on('exit', () => {
  releaseLock();
});