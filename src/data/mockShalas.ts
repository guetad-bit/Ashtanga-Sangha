// src/data/mockShalas.ts

export interface Review {
  id: string;
  userName: string;
  userImg: string;
  userLocation: string;
  date: string;
  rating: number;
  text: string;
  practicedMonths?: number;
}

export interface Shala {
  id: string;
  name: string;
  city: string;
  country: string;
  region: 'india' | 'europe' | 'asia' | 'americas' | 'oceania';
  latitude: number;
  longitude: number;
  teacher: string;
  teacherImg: string;
  authorization: 'Certified' | 'Authorized Level 2' | 'Authorized Level 1' | 'Traditional' | 'KPJAYI';
  lineage: string;
  imageUrl: string;
  description: string;
  style: ('Mysore' | 'Led Primary' | 'Led Intermediate' | 'Pranayama' | 'Philosophy')[];
  schedule: { day: string; time: string; class: string }[];
  amenities: string[];
  website?: string;
  rating: number;
  reviewCount: number;
  reviews: Review[];
  checkins: number;
  practitioners: { img: string; name: string }[];
  moonDayPolicy: string;
  dropIn: boolean;
  dropInPrice?: string;
  monthlyPrice?: string;
}

export const shalas: Shala[] = [
  {
    id: 'kpjayi-mysore',
    name: 'KPJAYI — K. Pattabhi Jois Ashtanga Yoga Institute',
    city: 'Mysore',
    country: 'India',
    region: 'india',
    latitude: 12.3051,
    longitude: 76.6551,
    teacher: 'R. Sharath Jois',
    teacherImg: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=120&h=120&fit=crop&crop=face',
    authorization: 'KPJAYI',
    lineage: 'Sri K. Pattabhi Jois → R. Sharath Jois',
    imageUrl: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&q=80',
    description: 'The birthplace of Ashtanga Vinyasa Yoga as taught by Sri K. Pattabhi Jois. Located in the Gokulam neighborhood of Mysore, this is where practitioners from around the world come to study at the source. Registration is required months in advance.',
    style: ['Mysore', 'Led Primary', 'Led Intermediate', 'Pranayama', 'Philosophy'],
    schedule: [
      { day: 'Mon–Fri', time: '4:30 AM', class: 'Mysore (batches)' },
      { day: 'Friday', time: '4:30 AM', class: 'Led Primary' },
      { day: 'Saturday', time: 'Rest', class: 'Rest Day' },
    ],
    amenities: ['Changing rooms', 'Coconut stand nearby', 'Accommodation help'],
    website: 'https://kpjayi.org',
    rating: 4.9,
    reviewCount: 342,
    reviews: [
      {
        id: 'r1',
        userName: 'Tom Nielsen',
        userImg: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face',
        userLocation: 'Copenhagen, Denmark',
        date: '2024-12',
        rating: 5,
        text: 'Nothing compares to practicing at the source. The energy in the room at 4:30 AM with 60 practitioners is transformative.',
        practicedMonths: 3,
      },
      {
        id: 'r2',
        userName: 'Maya Chen',
        userImg: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face',
        userLocation: 'San Francisco, USA',
        date: '2024-09',
        rating: 5,
        text: 'My fifth trip. Each time I understand the practice more deeply. Sharath\'s adjustments are precise and transformative.',
        practicedMonths: 2,
      },
    ],
    checkins: 1247,
    practitioners: [
      { img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&crop=face', name: 'Tom N.' },
      { img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&crop=face', name: 'Maya C.' },
      { img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=60&h=60&fit=crop&crop=face', name: 'Alex P.' },
    ],
    moonDayPolicy: 'No practice on moon days (full & new)',
    dropIn: false,
    monthlyPrice: '₹35,000/month (~$420)',
  },
  {
    id: 'ashtanga-yoga-berlin',
    name: 'Ashtanga Yoga Berlin',
    city: 'Berlin',
    country: 'Germany',
    region: 'europe',
    latitude: 52.4934,
    longitude: 13.4234,
    teacher: 'Sara Müller',
    teacherImg: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&h=120&fit=crop&crop=face',
    authorization: 'Authorized Level 2',
    lineage: 'Sri K. Pattabhi Jois → R. Sharath Jois → Sara Müller',
    imageUrl: 'https://images.unsplash.com/photo-1600618528240-fb9fc964b853?w=800&q=80',
    description: 'A warm, dedicated Mysore room in Kreuzberg. Sara studied for years in Mysore and brings the traditional method to Berlin with care and precision. Small class sizes ensure personal attention.',
    style: ['Mysore', 'Led Primary'],
    schedule: [
      { day: 'Mon–Fri', time: '6:30 AM', class: 'Mysore' },
      { day: 'Friday', time: '6:30 AM', class: 'Led Primary' },
      { day: 'Saturday', time: '8:00 AM', class: 'Mysore (short)' },
    ],
    amenities: ['Heated room', 'Mat rental', 'Showers', 'Tea after practice'],
    rating: 4.8,
    reviewCount: 89,
    reviews: [
      {
        id: 'r3',
        userName: 'Alex Petrov',
        userImg: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop&crop=face',
        userLocation: 'London, UK',
        date: '2025-01',
        rating: 5,
        text: 'Visited while traveling through Berlin. Sara made me feel welcome immediately. Beautiful space, serious practice.',
        practicedMonths: 1,
      },
    ],
    checkins: 312,
    practitioners: [
      { img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=60&h=60&fit=crop&crop=face', name: 'Alex P.' },
      { img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop&crop=face', name: 'Priya S.' },
    ],
    moonDayPolicy: 'No practice on moon days',
    dropIn: true,
    dropInPrice: '€18',
    monthlyPrice: '€120/month',
  },
  {
    id: 'ashtanga-yoga-london',
    name: 'The Shala London',
    city: 'London',
    country: 'UK',
    region: 'europe',
    latitude: 51.4640,
    longitude: -0.0718,
    teacher: 'James Hardwick',
    teacherImg: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face',
    authorization: 'Authorized Level 2',
    lineage: 'Sri K. Pattabhi Jois → R. Sharath Jois → James Hardwick',
    imageUrl: 'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=800&q=80',
    description: 'A dedicated Ashtanga space in East Dulwich, South London. James has practiced in Mysore over 15 times and teaches with a focus on breath, bandha, and drishti. Welcoming community for all levels.',
    style: ['Mysore', 'Led Primary', 'Pranayama'],
    schedule: [
      { day: 'Mon–Thu', time: '6:00 AM', class: 'Mysore' },
      { day: 'Friday', time: '6:00 AM', class: 'Led Primary' },
      { day: 'Saturday', time: '7:30 AM', class: 'Mysore' },
    ],
    amenities: ['Changing rooms', 'Showers', 'Mat storage for regulars'],
    rating: 4.7,
    reviewCount: 124,
    reviews: [
      {
        id: 'r4',
        userName: 'Lucia Romano',
        userImg: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&h=120&fit=crop&crop=face',
        userLocation: 'Rome, Italy',
        date: '2024-11',
        rating: 4,
        text: 'Great community feel. James is patient and knowledgeable. The space is small but has wonderful energy.',
        practicedMonths: 1,
      },
    ],
    checkins: 478,
    practitioners: [
      { img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=60&h=60&fit=crop&crop=face', name: 'Lucia R.' },
    ],
    moonDayPolicy: 'No practice on moon days',
    dropIn: true,
    dropInPrice: '£16',
    monthlyPrice: '£110/month',
  },
  {
    id: 'purple-valley-goa',
    name: 'Purple Valley Yoga',
    city: 'Goa',
    country: 'India',
    region: 'india',
    latitude: 15.6065,
    longitude: 73.8114,
    teacher: 'Various Guest Teachers',
    teacherImg: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=120&h=120&fit=crop&crop=face',
    authorization: 'Certified',
    lineage: 'Various certified & authorized teachers',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    description: 'A premier Ashtanga retreat center in North Goa hosting certified teachers for 2-week intensives. Beautiful gardens, ocean nearby, and a purpose-built shala. A destination for dedicated practitioners worldwide.',
    style: ['Mysore', 'Led Primary', 'Led Intermediate', 'Philosophy'],
    schedule: [
      { day: 'Mon–Fri', time: '6:00 AM', class: 'Mysore' },
      { day: 'Mon–Fri', time: '10:00 AM', class: 'Workshop / Philosophy' },
      { day: 'Friday', time: '6:00 AM', class: 'Led Primary' },
    ],
    amenities: ['Accommodation', 'Meals included', 'Pool', 'Garden', 'Beach nearby'],
    website: 'https://purplevalley.com',
    rating: 4.8,
    reviewCount: 256,
    reviews: [
      {
        id: 'r5',
        userName: 'Yuki Tanaka',
        userImg: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=face',
        userLocation: 'Tokyo, Japan',
        date: '2025-02',
        rating: 5,
        text: 'Two magical weeks studying with an incredible teacher. The food alone is worth the trip. Everything is taken care of so you can focus on practice.',
        practicedMonths: 1,
      },
    ],
    checkins: 891,
    practitioners: [
      { img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face', name: 'Yuki T.' },
      { img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face', name: 'Omar H.' },
    ],
    moonDayPolicy: 'No practice on moon days',
    dropIn: false,
    monthlyPrice: '$1,200–1,800/2-week retreat',
  },
  {
    id: 'ashtanga-yoga-copenhagen',
    name: 'Copenhagen Ashtanga',
    city: 'Copenhagen',
    country: 'Denmark',
    region: 'europe',
    latitude: 55.6761,
    longitude: 12.5683,
    teacher: 'Tom Nielsen',
    teacherImg: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face',
    authorization: 'Authorized Level 1',
    lineage: 'Sri K. Pattabhi Jois → R. Sharath Jois → Tom Nielsen',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
    description: 'A minimalist Scandinavian shala with incredible natural light. Tom brings 10 years of dedicated practice and multiple Mysore trips to his teaching. Strong morning community.',
    style: ['Mysore', 'Led Primary'],
    schedule: [
      { day: 'Mon–Fri', time: '6:00 AM', class: 'Mysore' },
      { day: 'Friday', time: '6:00 AM', class: 'Led Primary' },
    ],
    amenities: ['Showers', 'Bike parking', 'Tea corner'],
    rating: 4.6,
    reviewCount: 67,
    reviews: [
      {
        id: 'r6',
        userName: 'Sara Müller',
        userImg: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&h=120&fit=crop&crop=face',
        userLocation: 'Berlin, Germany',
        date: '2024-08',
        rating: 5,
        text: 'Practiced here while visiting a friend. The natural light at 6 AM is stunning. Tom is a wonderful, attentive teacher.',
        practicedMonths: 1,
      },
    ],
    checkins: 198,
    practitioners: [
      { img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=60&h=60&fit=crop&crop=face', name: 'Sara M.' },
    ],
    moonDayPolicy: 'No practice on moon days',
    dropIn: true,
    dropInPrice: '150 DKK (~$22)',
    monthlyPrice: '900 DKK/month (~$130)',
  },
  {
    id: 'ashtanga-yoga-bali',
    name: 'The Practice Bali',
    city: 'Ubud',
    country: 'Indonesia',
    region: 'asia',
    latitude: -8.5069,
    longitude: 115.2625,
    teacher: 'Wayan Suteja',
    teacherImg: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=120&h=120&fit=crop&crop=face',
    authorization: 'Certified',
    lineage: 'Sri K. Pattabhi Jois → R. Sharath Jois → Wayan Suteja',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
    description: 'A beautiful bamboo shala surrounded by rice paddies in Ubud. Wayan is one of the few Indonesian certified Ashtanga teachers. The open-air practice space and tropical setting create a unique atmosphere.',
    style: ['Mysore', 'Led Primary', 'Pranayama'],
    schedule: [
      { day: 'Mon–Sat', time: '5:30 AM', class: 'Mysore' },
      { day: 'Friday', time: '5:30 AM', class: 'Led Primary' },
      { day: 'Saturday', time: '7:00 AM', class: 'Pranayama' },
    ],
    amenities: ['Open-air shala', 'Coconut water', 'Mat rental', 'Cafe nearby'],
    rating: 4.7,
    reviewCount: 178,
    reviews: [
      {
        id: 'r7',
        userName: 'Omar Hassan',
        userImg: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face',
        userLocation: 'Barcelona, Spain',
        date: '2025-01',
        rating: 5,
        text: 'The bamboo shala with the sound of roosters and rice paddy views — pure magic. Wayan is incredibly skilled.',
        practicedMonths: 2,
      },
    ],
    checkins: 534,
    practitioners: [
      { img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face', name: 'Omar H.' },
      { img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop&crop=face', name: 'Priya S.' },
    ],
    moonDayPolicy: 'Rest on moon days and Saturdays',
    dropIn: true,
    dropInPrice: '150K IDR (~$10)',
    monthlyPrice: '2.5M IDR/month (~$165)',
  },
  {
    id: 'ashtanga-tokyo',
    name: 'IYC Ashtanga Tokyo',
    city: 'Tokyo',
    country: 'Japan',
    region: 'asia',
    latitude: 35.6585,
    longitude: 139.7013,
    teacher: 'Ken Harakuma',
    teacherImg: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=120&h=120&fit=crop&crop=face',
    authorization: 'Authorized Level 2',
    lineage: 'Sri K. Pattabhi Jois → Ken Harakuma',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
    description: 'One of the original Ashtanga spaces in Japan, founded by Ken Harakuma — one of the first Japanese students of Pattabhi Jois. Multiple locations across Tokyo with a dedicated community.',
    style: ['Mysore', 'Led Primary', 'Led Intermediate'],
    schedule: [
      { day: 'Mon–Sat', time: '6:30 AM', class: 'Mysore' },
      { day: 'Wed', time: '6:30 AM', class: 'Led Primary' },
      { day: 'Saturday', time: '8:00 AM', class: 'Led Intermediate' },
    ],
    amenities: ['Changing rooms', 'Mat rental', 'Small shop'],
    rating: 4.5,
    reviewCount: 93,
    reviews: [
      {
        id: 'r8',
        userName: 'Priya Sharma',
        userImg: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=face',
        userLocation: 'Mumbai, India',
        date: '2024-10',
        rating: 4,
        text: 'Incredible discipline in the room. Ken-sensei has a unique teaching style — firm but kind. The Japanese precision is reflected in every aspect.',
        practicedMonths: 1,
      },
    ],
    checkins: 267,
    practitioners: [
      { img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face', name: 'Yuki T.' },
    ],
    moonDayPolicy: 'No practice on moon days',
    dropIn: true,
    dropInPrice: '¥3,000 (~$20)',
    monthlyPrice: '¥15,000/month (~$100)',
  },
  {
    id: 'ashtanga-yoga-barcelona',
    name: 'Ashtanga Yoga Barcelona',
    city: 'Barcelona',
    country: 'Spain',
    region: 'europe',
    latitude: 41.3874,
    longitude: 2.1686,
    teacher: 'Omar Hassan',
    teacherImg: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face',
    authorization: 'Authorized Level 1',
    lineage: 'Sri K. Pattabhi Jois → R. Sharath Jois → Omar Hassan',
    imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80',
    description: 'A sun-filled shala in the Gràcia neighborhood. Omar brings warmth and depth from his years of practice, creating a welcoming space for the growing Barcelona sangha.',
    style: ['Mysore', 'Led Primary'],
    schedule: [
      { day: 'Mon–Fri', time: '7:00 AM', class: 'Mysore' },
      { day: 'Friday', time: '7:00 AM', class: 'Led Primary' },
      { day: 'Saturday', time: '8:30 AM', class: 'Mysore' },
    ],
    amenities: ['Rooftop terrace', 'Showers', 'Tea after practice', 'Mat rental'],
    rating: 4.6,
    reviewCount: 71,
    reviews: [],
    checkins: 203,
    practitioners: [],
    moonDayPolicy: 'No practice on moon days',
    dropIn: true,
    dropInPrice: '€15',
    monthlyPrice: '€100/month',
  },
];
