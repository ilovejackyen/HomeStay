const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const dbFilePath = path.join(__dirname, 'HomeStay_Database.xlsx');

// Initialize Excel Database if it doesn't exist
const initExcelDB = () => {
  if (!fs.existsSync(dbFilePath)) {
    const workbook = xlsx.utils.book_new();

    // 1. Rooms Sheet (房型表)
    const roomsData = [
      { ID: 'R201', Name: '201 無憂海風雙人房', BaseRate: 2500 },
      { ID: 'R202', Name: '202 愛琴海浪漫四人房', BaseRate: 5500 },
      { ID: 'R203', Name: '203 蔚藍海景雙人房', BaseRate: 3000 },
    ];
    const wsRooms = xlsx.utils.json_to_sheet(roomsData);
    xlsx.utils.book_append_sheet(workbook, wsRooms, 'Rooms');

    // 2. Customers Sheet (客戶表)
    const customersData = []; // empty init
    const wsCustomers = xlsx.utils.json_to_sheet(customersData);
    xlsx.utils.sheet_add_aoa(wsCustomers, [['ID', 'Name', 'Contact', 'CreatedAt']], { origin: 'A1' });
    xlsx.utils.book_append_sheet(workbook, wsCustomers, 'Customers');

    // 3. Orders Sheet (訂單表)
    const ordersData = []; // empty init
    const wsOrders = xlsx.utils.json_to_sheet(ordersData);
    xlsx.utils.sheet_add_aoa(wsOrders, [['ID', 'CustomerID', 'RoomID', 'CheckIn', 'CheckOut', 'Guests', 'TotalFee', 'PaymentStatus', 'BookingStatus']], { origin: 'A1' });
    xlsx.utils.book_append_sheet(workbook, wsOrders, 'Orders');

    xlsx.writeFile(workbook, dbFilePath);
    console.log('[DB] Excel Database Initialized:', dbFilePath);
  }
};

initExcelDB();

// Helper to Read the Workbook
const getExcelData = () => {
  const workbook = xlsx.readFile(dbFilePath);
  const rooms = xlsx.utils.sheet_to_json(workbook.Sheets['Rooms']);
  const customers = xlsx.utils.sheet_to_json(workbook.Sheets['Customers']);
  const orders = xlsx.utils.sheet_to_json(workbook.Sheets['Orders']);
  return { workbook, rooms, customers, orders };
};

// GET all data
app.get('/api/data', (req, res) => {
  try {
    const data = getExcelData();
    res.json({
      rooms: data.rooms,
      customers: data.customers,
      orders: data.orders
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST to create a booking (automatically updates Customers and Orders)
app.post('/api/book', (req, res) => {
  try {
    const { guestName, contact, roomId, checkIn, checkOut, guests, totalFee } = req.body;
    let data = getExcelData();

    // 1. Process Customer (Find or Create)
    let customer = data.customers.find(c => c.Name === guestName);
    if (!customer) {
      customer = {
        ID: `C-${Date.now()}`,
        Name: guestName,
        Contact: contact || '',
        CreatedAt: new Date().toISOString()
      };
      data.customers.push(customer);
      const newWsCustomers = xlsx.utils.json_to_sheet(data.customers);
      data.workbook.Sheets['Customers'] = newWsCustomers;
    }

    // 2. Process Order
    const order = {
      ID: `ORD-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`,
      CustomerID: customer.ID,
      RoomID: roomId,
      CheckIn: checkIn,
      CheckOut: checkOut,
      Guests: guests,
      TotalFee: totalFee,
      PaymentStatus: 'unpaid',
      BookingStatus: 'pending'
    };
    data.orders.push(order);
    const newWsOrders = xlsx.utils.json_to_sheet(data.orders);
    data.workbook.Sheets['Orders'] = newWsOrders;

    // 3. Save back to Excel
    xlsx.writeFile(data.workbook, dbFilePath);

    res.json({ success: true, order, customer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// POST to update existing order status/payment
app.post('/api/update-order', (req, res) => {
  try {
    const { orderId, propUpdates } = req.body;
    let data = getExcelData();
    
    let orderIndex = data.orders.findIndex(o => String(o.ID) === String(orderId));
    if (orderIndex === -1) return res.status(404).json({ error: "Order not found" });

    // Apply updates
    data.orders[orderIndex] = { ...data.orders[orderIndex], ...propUpdates };

    // Overwrite sheet
    const newWsOrders = xlsx.utils.json_to_sheet(data.orders);
    data.workbook.Sheets['Orders'] = newWsOrders;
    xlsx.writeFile(data.workbook, dbFilePath);

    res.json({ success: true, updatedOrder: data.orders[orderIndex] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`[Server] API running at http://localhost:${PORT}`);
});
