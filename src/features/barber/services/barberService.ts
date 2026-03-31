import { Barber, Service } from "@/common/types";

export const barberService = {
  getBarberById: async (id: string): Promise<Barber> => {
    return {
      id: id,
      name: "Mock Barber",
      salonName: "Mock Salon",
      address: "123 Mock St",
      distance: 1.2,
      rating: 4.8,
      reviews: 154,
      mainImage: "",
      gallery: [],
    };
  },

  getServicesByBarberId: async (barberId: string): Promise<Service[]> => {
    return [
      {
        id: "mock-service-1",
        name: "Haircut",
        duration: 30,
        price: 25,
      },
    ];
  },
};
