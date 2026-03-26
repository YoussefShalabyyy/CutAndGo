// Shared types used across multiple features

export type Barber = {
  id: string;
  name: string;
  salonName: string;
  distance: number;
  rating: number;
  reviews: number;
  address: string;
  mainImage: string;
  gallery: string[];
};

export type Appointment = {
  id: string;
  barberName: string;
  service: string;
  date: string;
  time: string;
  status: 'Confirmed' | 'Pending' | 'Completed';
  image: string;
};

export type Service = {
  id: string;
  name: string;
  duration: string;
  price: number;
};
