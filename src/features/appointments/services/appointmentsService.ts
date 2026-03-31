import { Appointment } from "@/common/types";

export const appointmentsService = {
  getUserBookings: async (userId: string): Promise<Appointment[]> => {
    return [
      {
        id: "1",
        barberName: "Mock Barber",
        service: "Haircut",
        date: "2023-12-01",
        time: "10:00 AM",
        status: "Confirmed",
        image: "",
      },
    ];
  },
};
