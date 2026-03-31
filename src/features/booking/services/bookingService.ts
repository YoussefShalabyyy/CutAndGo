export const bookingService = {
  getAvailableSlots: async (
    barberId: string,
    date: string,
  ): Promise<string[]> => {
    const ALL_SLOTS = [
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "01:00 PM",
      "01:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
    ];

    return ALL_SLOTS;
  },

  createBooking: async (bookingData: {
    user_id: string;
    barber_id: string;
    service_id: string;
    date: string;
    time: string;
  }) => {
    return {
      id: "mock-booking-id",
      user_id: bookingData.user_id,
      barber_id: bookingData.barber_id,
      service_id: bookingData.service_id,
      date: bookingData.date,
      time: bookingData.time,
      status: "Confirmed",
    };
  },
};
