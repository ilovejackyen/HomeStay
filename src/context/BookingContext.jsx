import React, { createContext, useState, useEffect } from 'react';

export const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load from Excel Database API
  const fetchDatabase = async () => {
    try {
      const resp = await fetch('http://localhost:3001/api/data');
      const data = await resp.json();
      
      setRooms(data.rooms || []);
      setCustomers(data.customers || []);
      
      // Parse dates internally for the frontend component requirements
      const parsedReservations = (data.orders || []).map(r => ({
        id: r.ID,
        guestName: data.customers.find(c => c.ID === r.CustomerID)?.Name || '',
        roomId: r.RoomID,
        checkIn: new Date(r.CheckIn).getTime(),
        checkOut: new Date(r.CheckOut).getTime(),
        guests: r.Guests,
        totalFee: r.TotalFee,
        paymentStatus: r.PaymentStatus,
        status: r.BookingStatus
      }));
      
      setReservations(parsedReservations.reverse());
    } catch (error) {
      console.error("Failed to load Excel DB from local API:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabase();
    // Setting up polling for live updates from Excel (every 5 seconds)
    const intervalId = setInterval(fetchDatabase, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const addReservationAsync = async (bookingPayload) => {
    try {
      const resp = await fetch('http://localhost:3001/api/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingPayload)
      });
      const result = await resp.json();
      if(result.success) {
        await fetchDatabase(); // refresh instantly
        return result.order.ID;
      }
    } catch(err) {
      console.error(err);
      throw err;
    }
  };

  const updateReservationProps = async (orderId, props) => {
    // map props to backend Excel headers
    const propUpdates = {};
    if (props.status !== undefined) propUpdates.BookingStatus = props.status;
    if (props.paymentStatus !== undefined) propUpdates.PaymentStatus = props.paymentStatus;
    
    try {
      const resp = await fetch('http://localhost:3001/api/update-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderId, propUpdates })
      });
      
      const result = await resp.json();
      if(result.success) {
        await fetchDatabase(); // refresh 
      }
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <BookingContext.Provider value={{ 
      rooms, 
      customers,
      reservations, 
      addReservationAsync, 
      updateReservationProps,
      loading
    }}>
      {children}
    </BookingContext.Provider>
  );
};
