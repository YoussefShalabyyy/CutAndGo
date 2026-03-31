import { Barber } from "@/common/types";

export const homeService = {
  getBarbers: async (): Promise<Barber[]> => {
    return [
      {
        id: "1",
        name: "Mock Barber",
        salonName: "Mock Salon",
        address: "123 Mock St",
        distance: 1.2,
        rating: 4.5,
        reviews: 120,
        mainImage: "",
        gallery: [],
      },
    ];
  },
};
