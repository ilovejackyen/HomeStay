import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env from project root regardless of which directory node is launched from
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../.env') });

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Google Sheets Setup
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

const getDoc = async () => {
  if (!SPREADSHEET_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    throw new Error("Database credentials or ID are missing in environment variables.");
  }

  const jwt = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const doc = new GoogleSpreadsheet(SPREADSHEET_ID, jwt);
  await doc.loadInfo();
  return doc;
};

// Helper to ensure sheet exists and has correct headers
const ensureSheet = async (doc, title, headerValues) => {
  let sheet = doc.sheetsByTitle[title];
  if (!sheet) {
    sheet = await doc.addSheet({ headerValues, title });
  } else {
    // If sheet exists, check if headers need update
    await sheet.loadHeaderRow();
    const existingHeaders = sheet.headerValues;
    const missingHeaders = headerValues.filter(h => !existingHeaders.includes(h));
    
    if (missingHeaders.length > 0) {
      console.log(`[Server] Updating headers for ${title}: adding ${missingHeaders.join(', ')}`);
      await sheet.setHeaderRow([...existingHeaders, ...missingHeaders]);
    }
  }
  return sheet;
};

// Simple In-Memory Cache for /api/data
let dataCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 15000; // 15 seconds

// GET health/test status
app.get('/api/test', async (req, res) => {
  try {
    const doc = await getDoc();
    res.json({
      success: true,
      message: "Successfully connected to Database!",
      sheetTitle: doc.title,
      url: `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to connect to Database. Check credentials.",
      error: error.message,
      stack: error.stack
    });
  }
});

// GET all data
app.get('/api/data', async (req, res) => {
  const now = Date.now();
  
  if (dataCache && (now - lastFetchTime < CACHE_DURATION)) {
    console.log('[Server] Serving data from cache');
    return res.json(dataCache);
  }

  try {
    const doc = await getDoc();

    const roomsSheet = await ensureSheet(doc, 'Rooms', ['ID', 'Name', 'BaseRate']);
    const customersSheet = await ensureSheet(doc, 'Customers', ['ID', 'Name', 'Phone', 'LineID', 'Email', 'SpecialRequests', 'CreatedAt']);
    const ordersSheet = await ensureSheet(doc, 'Orders', ['ID', 'CustomerID', 'RoomID', 'CheckIn', 'CheckOut', 'Guests', 'TotalFee', 'PaymentStatus', 'BookingStatus', 'Phone', 'LineID', 'Email', 'SpecialRequests']);
    
    // Auto-seed rooms if empty
    const roomRows = await roomsSheet.getRows();
    if (roomRows.length === 0) {
      await roomsSheet.addRows([
        { ID: 'R201', Name: '201 無憂海風雙人房', BaseRate: 2500 },
        { ID: 'R202', Name: '202 愛琴海浪漫四人房', BaseRate: 5500 },
        { ID: 'R203', Name: '203 蔚藍海景雙人房', BaseRate: 3000 },
      ]);
    }

    const rowsR = await roomsSheet.getRows();
    const rooms = rowsR.map(row => row.toObject());

    const rowsC = await customersSheet.getRows();
    const customers = rowsC.map(row => row.toObject());

    const rowsO = await ordersSheet.getRows();
    const orders = rowsO.map(row => row.toObject());

<<<<<<< HEAD
    res.json({ rooms, customers, orders });
=======
    const responseData = { rooms, customers, orders };
    dataCache = responseData;
    lastFetchTime = now;
    
    res.json(responseData);
>>>>>>> development
  } catch (error) {
    console.error('[Error fetching data]', error.message);
    res.json({ rooms: [], customers: [], orders: [] });
  }
});

// POST to create a booking
app.post('/api/book', async (req, res) => {
  try {
    const { guestName, phone, lineId, email, specialRequests, roomId, checkIn, checkOut, guests, totalFee } = req.body;
    const doc = await getDoc();
    
    // Process Customer
    const customersSheet = await ensureSheet(doc, 'Customers', ['ID', 'Name', 'Phone', 'LineID', 'Email', 'SpecialRequests', 'CreatedAt']);
    
    const customerRows = await customersSheet.getRows();
    let existingCustomerRow = customerRows.find(r => r.get('Name')?.trim() === guestName?.trim());
    let customer;
    
    if (!existingCustomerRow) {
      customer = {
        ID: `C-${Date.now()}`,
        Name: guestName,
        Phone: phone || '',
        LineID: lineId || '',
        Email: email || '',
        SpecialRequests: specialRequests || '',
        CreatedAt: new Date().toISOString()
      };
      await customersSheet.addRow(customer);
    } else {
      // Update contact info for returning customer
      if (phone) existingCustomerRow.set('Phone', phone);
      if (lineId) existingCustomerRow.set('LineID', lineId);
      if (email) existingCustomerRow.set('Email', email);
      if (specialRequests) existingCustomerRow.set('SpecialRequests', specialRequests);
      await existingCustomerRow.save();
      customer = existingCustomerRow.toObject();
    }

    // Process Order
    const ordersSheet = await ensureSheet(doc, 'Orders', ['ID', 'CustomerID', 'RoomID', 'CheckIn', 'CheckOut', 'Guests', 'TotalFee', 'PaymentStatus', 'BookingStatus', 'Phone', 'LineID', 'Email', 'SpecialRequests']);
    
    const order = {
      ID: `ORD-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`,
      CustomerID: customer.ID || customer.id || '',
      RoomID: roomId,
      CheckIn: checkIn,
      CheckOut: checkOut,
      Guests: guests,
      TotalFee: totalFee,
      PaymentStatus: 'unpaid',
      BookingStatus: 'pending',
      Phone: phone || '',
      LineID: lineId || '',
      Email: email || '',
      SpecialRequests: specialRequests || ''
    };
    await ordersSheet.addRow(order);

    res.json({ success: true, order, customer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// POST to update existing order status/payment
app.post('/api/update-order', async (req, res) => {
  try {
    const { orderId, propUpdates } = req.body;
    const doc = await getDoc();
    const ordersSheet = doc.sheetsByTitle['Orders'];
    if (!ordersSheet) return res.status(404).json({ error: "Orders sheet not found" });

    const rows = await ordersSheet.getRows();
    const targetRow = rows.find(r => r.get('ID') === String(orderId));
    
    if (!targetRow) return res.status(404).json({ error: "Order not found" });

    if (propUpdates.PaymentStatus !== undefined) targetRow.set('PaymentStatus', propUpdates.PaymentStatus);
    if (propUpdates.BookingStatus !== undefined) targetRow.set('BookingStatus', propUpdates.BookingStatus);
    
    await targetRow.save();

    res.json({ success: true, updatedOrder: targetRow.toObject() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST to verify admin password
app.post('/api/verify-admin', async (req, res) => {
  try {
    const { password } = req.body;
    const doc = await getDoc();
    
    // Auto-initialize Settings sheet if missing
    let settingsSheet = doc.sheetsByTitle['Settings'];
    if (!settingsSheet) {
      settingsSheet = await doc.addSheet({ headerValues: ['Key', 'Value'], title: 'Settings' });
      await settingsSheet.addRow({ Key: 'AdminPassword', Value: 'admin123' });
    }
    
    const rows = await settingsSheet.getRows();
    const pwRow = rows.find(r => r.get('Key') === 'AdminPassword');
    const correctPassword = pwRow ? pwRow.get('Value') : 'admin123';
    
    if (password === correctPassword) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, error: 'Incorrect password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default app;

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`[Server] API running at http://localhost:${PORT}`);
    console.log(`[Server] Waiting for database configuration in .env`);
  });
}
