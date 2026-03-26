import { Barber } from '@/common/types';

export const MOCK_BARBERS: Barber[] = [
  {
    id: '1',
    name: 'Ahmed Youssef',
    salonName: 'The Gentleman Lounge',
    distance: 1.2,
    rating: 4.8,
    reviews: 120,
    address: 'Zamalek, Cairo',
    mainImage: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=400&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=400&auto=format&fit=crop',
    ],
  },
  {
    id: '2',
    name: 'Karim Hassan',
    salonName: 'Urban Cuts Studio',
    distance: 2.5,
    rating: 4.9,
    reviews: 340,
    address: 'Maadi, Cairo',
    mainImage: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=400&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=400&auto=format&fit=crop',
    ],
  },
  {
    id: '3',
    name: 'Mostafa Ali',
    salonName: 'Classic Barber Co.',
    distance: 3.1,
    rating: 4.6,
    reviews: 85,
    address: 'Heliopolis, Cairo',
    mainImage: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=800&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583592398553-625d97f8c055?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=400&auto=format&fit=crop',
    ],
  },
];
