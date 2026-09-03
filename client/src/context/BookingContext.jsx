import React, { createContext, useContext, useState } from 'react';

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  // Current active draft for Darshan booking
  const [draftBooking, setDraftBooking] = useState({
    templeId: 'somnath',
    templeName: 'Shree Somnath Jyotirlinga',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    timeSlot: '06:30 AM - 08:00 AM (Prabhat Aarti)',
    slotId: 's-01',
    pilgrimCount: 2,
    leadPilgrim: {
      name: 'Ramesh Patel',
      phone: '+91 98250 12345',
      email: 'ramesh.patel@example.com',
      idType: 'Aadhaar Card',
      idNumber: 'XXXX-XXXX-8842'
    },
    coPilgrims: [
      { name: 'Pooja Patel', age: 34, gender: 'Female' }
    ],
    specialQueue: false, // Senior / Divyangjan
    specialAssistanceType: 'None',
    prasadCart: [],
    vipPassFee: 0,
    prasadTotal: 0,
    totalAmount: 0
  });

  // Confirmed bookings list stored in localStorage
  const [confirmedBookings, setConfirmedBookings] = useState(() => {
    const saved = localStorage.getItem('divyatra_confirmed_passes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [
      {
        id: "BK-SOM-7821",
        bookingId: "BK-SOM-7821",
        templeId: "somnath",
        templeName: "Shree Somnath Jyotirlinga",
        date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        timeSlot: "06:30 AM - 08:00 AM (Prabhat Aarti)",
        pilgrimCount: 2,
        leadPilgrim: {
          name: "Ramesh Patel",
          phone: "+91 98250 12345",
          email: "ramesh.patel@example.com",
          idProof: "Aadhaar Card XXXX-8842"
        },
        specialQueue: false,
        prasadCount: 1,
        prasadName: "Shree Somnath Mahaprasad Box (Shiva Bhog)",
        amountPaid: 350,
        status: "CONFIRMED",
        paymentId: "pay_RZP_SOMNATH_9921",
        qrCodeData: "DIVYATRA:SOMNATH:BK-SOM-7821:RAMESH_PATEL:2PAX:VERIFIED",
        createdAt: new Date().toISOString()
      }
    ];
  });

  const [activePass, setActivePass] = useState(confirmedBookings[0] || null);

  const updateDraft = (updates) => {
    setDraftBooking((prev) => ({ ...prev, ...updates }));
  };

  const addPrasadToDraft = (prasadItem, quantity = 1) => {
    setDraftBooking((prev) => {
      const existingIndex = prev.prasadCart.findIndex((p) => p.id === prasadItem.id);
      let updatedCart = [...prev.prasadCart];
      if (existingIndex > -1) {
        updatedCart[existingIndex].quantity += quantity;
      } else {
        updatedCart.push({ ...prasadItem, quantity });
      }
      const prasadTotal = updatedCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const totalAmount = prev.vipPassFee + prasadTotal;
      return {
        ...prev,
        prasadCart: updatedCart,
        prasadTotal,
        totalAmount
      };
    });
  };

  const removePrasadFromDraft = (prasadId) => {
    setDraftBooking((prev) => {
      const updatedCart = prev.prasadCart.filter((p) => p.id !== prasadId);
      const prasadTotal = updatedCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const totalAmount = prev.vipPassFee + prasadTotal;
      return {
        ...prev,
        prasadCart: updatedCart,
        prasadTotal,
        totalAmount
      };
    });
  };

  const saveConfirmedBooking = (booking) => {
    const updated = [booking, ...confirmedBookings];
    setConfirmedBookings(updated);
    setActivePass(booking);
    localStorage.setItem('divyatra_confirmed_passes', JSON.stringify(updated));
  };

  return (
    <BookingContext.Provider
      value={{
        draftBooking,
        updateDraft,
        addPrasadToDraft,
        removePrasadFromDraft,
        confirmedBookings,
        activePass,
        setActivePass,
        saveConfirmedBooking
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);
