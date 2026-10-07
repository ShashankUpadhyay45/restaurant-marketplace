export interface Locality {
  name: string;
  pincode: string;
  latitude: number;
  longitude: number;
}

export interface IndianCity {
  id: string;
  name: string;
  state: string;
  region: 'North' | 'West' | 'South' | 'East';
  country: 'India';
  latitude: number;
  longitude: number;
  slug: string;
  popularLocalities: Locality[];
  popularCuisines: string[];
  isActive: boolean;
}

export const INDIAN_CITIES: IndianCity[] = [
  // --- North India ---
  {
    id: 'city_dehradun',
    name: 'Dehradun',
    state: 'Uttarakhand',
    region: 'North',
    country: 'India',
    latitude: 30.3165,
    longitude: 78.0322,
    slug: 'dehradun',
    popularLocalities: [
      { name: 'Rajpur Road', pincode: '248001', latitude: 30.3340, longitude: 78.0580 },
      { name: 'Jakhan', pincode: '248001', latitude: 30.3620, longitude: 78.0720 },
      { name: 'Ballupur', pincode: '248001', latitude: 30.3390, longitude: 78.0120 },
      { name: 'Clement Town', pincode: '248002', latitude: 30.2670, longitude: 78.0060 },
      { name: 'Prem Nagar', pincode: '248007', latitude: 30.3370, longitude: 77.9620 },
      { name: 'Sahastradhara Road', pincode: '248013', latitude: 30.3480, longitude: 78.0820 },
      { name: 'Vasant Vihar', pincode: '248006', latitude: 30.3120, longitude: 78.0040 }
    ],
    popularCuisines: ['North Indian', 'Bakery & Cafe', 'Tibetan & Momos', 'Pahari & Garhwali', 'Indo-Chinese'],
    isActive: true
  },
  {
    id: 'city_delhi',
    name: 'Delhi NCR',
    state: 'Delhi',
    region: 'North',
    country: 'India',
    latitude: 28.6139,
    longitude: 77.2090,
    slug: 'delhi-ncr',
    popularLocalities: [
      { name: 'Connaught Place', pincode: '110001', latitude: 28.6315, longitude: 77.2167 },
      { name: 'Hauz Khas', pincode: '110016', latitude: 28.5494, longitude: 77.2001 },
      { name: 'Saket', pincode: '110017', latitude: 28.5244, longitude: 77.2100 },
      { name: 'Vasant Kunj', pincode: '110070', latitude: 28.5293, longitude: 77.1528 },
      { name: 'Lajpat Nagar', pincode: '110024', latitude: 28.5677, longitude: 77.2433 },
      { name: 'Karol Bagh', pincode: '110005', latitude: 28.6514, longitude: 77.1907 },
      { name: 'Dwarka', pincode: '110075', latitude: 28.5921, longitude: 77.0460 },
      { name: 'Rohini', pincode: '110085', latitude: 28.7166, longitude: 77.1147 }
    ],
    popularCuisines: ['North Indian', 'Mughlai', 'Biryani', 'Street Food', 'Continental', 'Italian'],
    isActive: true
  },
  {
    id: 'city_gurugram',
    name: 'Gurugram',
    state: 'Haryana',
    region: 'North',
    country: 'India',
    latitude: 28.4595,
    longitude: 77.0266,
    slug: 'gurugram',
    popularLocalities: [
      { name: 'DLF Cyber City', pincode: '122002', latitude: 28.4950, longitude: 77.0890 },
      { name: 'Sector 29', pincode: '122001', latitude: 28.4680, longitude: 77.0630 },
      { name: 'Golf Course Road', pincode: '122011', latitude: 28.4480, longitude: 77.1020 }
    ],
    popularCuisines: ['Brewery & Dining', 'Modern Indian', 'Asian', 'Japanese Sushi'],
    isActive: true
  },
  {
    id: 'city_noida',
    name: 'Noida',
    state: 'Uttar Pradesh',
    region: 'North',
    country: 'India',
    latitude: 28.5355,
    longitude: 77.3910,
    slug: 'noida',
    popularLocalities: [
      { name: 'Sector 18', pincode: '201301', latitude: 28.5700, longitude: 77.3220 },
      { name: 'Sector 62', pincode: '201309', latitude: 28.6250, longitude: 77.3680 }
    ],
    popularCuisines: ['North Indian', 'Fast Food', 'Biryani'],
    isActive: true
  },
  {
    id: 'city_chandigarh',
    name: 'Chandigarh',
    state: 'Chandigarh',
    region: 'North',
    country: 'India',
    latitude: 30.7333,
    longitude: 76.7794,
    slug: 'chandigarh',
    popularLocalities: [
      { name: 'Sector 17', pincode: '160017', latitude: 30.7400, longitude: 76.7800 },
      { name: 'Sector 35', pincode: '160035', latitude: 30.7250, longitude: 76.7640 }
    ],
    popularCuisines: ['Punjabi', 'Tandoori Grills', 'Bakery', 'Continental'],
    isActive: true
  },
  {
    id: 'city_jaipur',
    name: 'Jaipur',
    state: 'Rajasthan',
    region: 'North',
    country: 'India',
    latitude: 26.9124,
    longitude: 75.7873,
    slug: 'jaipur',
    popularLocalities: [
      { name: 'C-Scheme', pincode: '302001', latitude: 26.9100, longitude: 75.8000 },
      { name: 'Malviya Nagar', pincode: '302017', latitude: 26.8550, longitude: 75.8150 },
      { name: 'Mansarovar', pincode: '302020', latitude: 26.8620, longitude: 75.7680 }
    ],
    popularCuisines: ['Rajasthani Thali', 'Laal Maas', 'North Indian', 'Sweets & Mithai'],
    isActive: true
  },
  {
    id: 'city_lucknow',
    name: 'Lucknow',
    state: 'Uttar Pradesh',
    region: 'North',
    country: 'India',
    latitude: 26.8467,
    longitude: 80.9462,
    slug: 'lucknow',
    popularLocalities: [
      { name: 'Hazratganj', pincode: '226001', latitude: 26.8500, longitude: 80.9450 },
      { name: 'Gomti Nagar', pincode: '226010', latitude: 26.8600, longitude: 80.9900 },
      { name: 'Aliganj', pincode: '226024', latitude: 26.8900, longitude: 80.9400 }
    ],
    popularCuisines: ['Awadhi Biryani', 'Galouti Kebabs', 'Mughlai', 'Chaat'],
    isActive: true
  },

  // --- West India ---
  {
    id: 'city_mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    region: 'West',
    country: 'India',
    latitude: 19.0760,
    longitude: 72.8777,
    slug: 'mumbai',
    popularLocalities: [
      { name: 'Bandra West', pincode: '400050', latitude: 19.0596, longitude: 72.8295 },
      { name: 'Andheri West', pincode: '400053', latitude: 19.1363, longitude: 72.8277 },
      { name: 'Powai', pincode: '400076', latitude: 19.1197, longitude: 72.9051 },
      { name: 'Lower Parel', pincode: '400013', latitude: 18.9953, longitude: 72.8315 },
      { name: 'Colaba', pincode: '400005', latitude: 18.9067, longitude: 72.8147 },
      { name: 'Juhu', pincode: '400049', latitude: 19.1075, longitude: 72.8263 },
      { name: 'Goregaon West', pincode: '400062', latitude: 19.1663, longitude: 72.8436 },
      { name: 'Thane West', pincode: '400601', latitude: 19.2183, longitude: 72.9781 }
    ],
    popularCuisines: ['Coastal Seafood', 'Maharashtrian', 'Street Food', 'Italian Trattoria', 'Sushi & Japanese'],
    isActive: true
  },
  {
    id: 'city_pune',
    name: 'Pune',
    state: 'Maharashtra',
    region: 'West',
    country: 'India',
    latitude: 18.5204,
    longitude: 73.8567,
    slug: 'pune',
    popularLocalities: [
      { name: 'Koregaon Park', pincode: '411001', latitude: 18.5362, longitude: 73.8940 },
      { name: 'Baner', pincode: '411045', latitude: 18.5597, longitude: 73.7799 },
      { name: 'Kothrud', pincode: '411038', latitude: 18.5074, longitude: 73.8077 },
      { name: 'Viman Nagar', pincode: '411014', latitude: 18.5679, longitude: 73.9143 }
    ],
    popularCuisines: ['Maharashtrian Misal', 'Craft Brewery', 'North Indian', 'Bakery'],
    isActive: true
  },
  {
    id: 'city_ahmedabad',
    name: 'Ahmedabad',
    state: 'Gujarat',
    region: 'West',
    country: 'India',
    latitude: 23.0225,
    longitude: 72.5714,
    slug: 'ahmedabad',
    popularLocalities: [
      { name: 'SG Highway', pincode: '380054', latitude: 23.0500, longitude: 72.5100 },
      { name: 'Bodakdev', pincode: '380054', latitude: 23.0400, longitude: 72.5200 },
      { name: 'Satellite', pincode: '380015', latitude: 23.0200, longitude: 72.5300 }
    ],
    popularCuisines: ['Gujarati Thali', 'Vegetarian Gourmet', 'Fast Food', 'Street Food'],
    isActive: true
  },
  {
    id: 'city_goa',
    name: 'Goa (Panaji)',
    state: 'Goa',
    region: 'West',
    country: 'India',
    latitude: 15.4909,
    longitude: 73.8278,
    slug: 'goa',
    popularLocalities: [
      { name: 'Fontainhas (Latin Quarter)', pincode: '403001', latitude: 15.4950, longitude: 73.8320 },
      { name: 'Miramar', pincode: '403001', latitude: 15.4800, longitude: 73.8100 },
      { name: 'Candolim', pincode: '403515', latitude: 15.5160, longitude: 73.7650 }
    ],
    popularCuisines: ['Goan Fish Curry', 'Portuguese Continental', 'Seafood', 'Cafes'],
    isActive: true
  },

  // --- South India ---
  {
    id: 'city_bengaluru',
    name: 'Bengaluru',
    state: 'Karnataka',
    region: 'South',
    country: 'India',
    latitude: 12.9716,
    longitude: 77.5946,
    slug: 'bengaluru',
    popularLocalities: [
      { name: 'Koramangala', pincode: '560034', latitude: 12.9352, longitude: 77.6245 },
      { name: 'Indiranagar', pincode: '560038', latitude: 12.9784, longitude: 77.6408 },
      { name: 'HSR Layout', pincode: '560102', latitude: 12.9121, longitude: 77.6446 },
      { name: 'Whitefield', pincode: '560066', latitude: 12.9698, longitude: 77.7500 },
      { name: 'MG Road', pincode: '560001', latitude: 12.9756, longitude: 77.6066 },
      { name: 'Jayanagar', pincode: '560041', latitude: 12.9308, longitude: 77.5838 },
      { name: 'Electronic City', pincode: '560100', latitude: 12.8452, longitude: 77.6602 }
    ],
    popularCuisines: ['South Indian Filter Coffee & Dosas', 'Microbreweries', 'Asian & Ramen', 'Mangalorean Seafood', 'Continental'],
    isActive: true
  },
  {
    id: 'city_hyderabad',
    name: 'Hyderabad',
    state: 'Telangana',
    region: 'South',
    country: 'India',
    latitude: 17.3850,
    longitude: 78.4867,
    slug: 'hyderabad',
    popularLocalities: [
      { name: 'Banjara Hills', pincode: '500034', latitude: 17.4156, longitude: 78.4350 },
      { name: 'Jubilee Hills', pincode: '500033', latitude: 17.4319, longitude: 78.4073 },
      { name: 'Gachibowli', pincode: '500032', latitude: 17.4401, longitude: 78.3489 },
      { name: 'Hitec City', pincode: '500081', latitude: 17.4474, longitude: 78.3762 }
    ],
    popularCuisines: ['Hyderabadi Dum Biryani', 'Haleem', 'Andhra Spicy Meals', 'Kebabs'],
    isActive: true
  },
  {
    id: 'city_chennai',
    name: 'Chennai',
    state: 'Tamil Nadu',
    region: 'South',
    country: 'India',
    latitude: 13.0827,
    longitude: 80.2707,
    slug: 'chennai',
    popularLocalities: [
      { name: 'T. Nagar', pincode: '600017', latitude: 13.0418, longitude: 80.2341 },
      { name: 'Nungambakkam', pincode: '600034', latitude: 13.0569, longitude: 80.2425 },
      { name: 'Adyar', pincode: '600020', latitude: 13.0012, longitude: 80.2565 },
      { name: 'Velachery', pincode: '600042', latitude: 12.9815, longitude: 80.2180 }
    ],
    popularCuisines: ['Chettinad', 'Traditional Tamil Meals', 'Filter Coffee', 'Seafood'],
    isActive: true
  },
  {
    id: 'city_kochi',
    name: 'Kochi',
    state: 'Kerala',
    region: 'South',
    country: 'India',
    latitude: 9.9312,
    longitude: 76.2673,
    slug: 'kochi',
    popularLocalities: [
      { name: 'Marine Drive', pincode: '682031', latitude: 9.9800, longitude: 76.2750 },
      { name: 'Panampilly Nagar', pincode: '682036', latitude: 9.9600, longitude: 76.2950 },
      { name: 'Fort Kochi', pincode: '682001', latitude: 9.9650, longitude: 76.2400 }
    ],
    popularCuisines: ['Kerala Sadya', 'Malabar Parotta & Beef/Chicken', 'Seafood Pollichathu'],
    isActive: true
  },

  // --- East India ---
  {
    id: 'city_kolkata',
    name: 'Kolkata',
    state: 'West Bengal',
    region: 'East',
    country: 'India',
    latitude: 22.5726,
    longitude: 88.3639,
    slug: 'kolkata',
    popularLocalities: [
      { name: 'Park Street', pincode: '700016', latitude: 22.5510, longitude: 88.3520 },
      { name: 'Salt Lake City', pincode: '700091', latitude: 22.5800, longitude: 88.4200 },
      { name: 'Ballygunge', pincode: '700019', latitude: 22.5280, longitude: 88.3650 },
      { name: 'New Town', pincode: '700156', latitude: 22.5850, longitude: 88.4650 }
    ],
    popularCuisines: ['Kolkata Biryani with Aloo', 'Bengali Fish Curry', 'Kathi Rolls', 'Mishti Doi & Sweets'],
    isActive: true
  },
  {
    id: 'city_bhubaneswar',
    name: 'Bhubaneswar',
    state: 'Odisha',
    region: 'East',
    country: 'India',
    latitude: 20.2961,
    longitude: 85.8245,
    slug: 'bhubaneswar',
    popularLocalities: [
      { name: 'Saheed Nagar', pincode: '751007', latitude: 20.2900, longitude: 85.8450 },
      { name: 'Patia', pincode: '751024', latitude: 20.3550, longitude: 85.8180 }
    ],
    popularCuisines: ['Odia Seafood', 'Dalma', 'Chhena Poda', 'North Indian'],
    isActive: true
  }
];

/**
 * Calculates great-circle distance between two geographic coordinates using Haversine formula
 * Returns distance in kilometers (km) rounded to 1 decimal place.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return parseFloat(distance.toFixed(1));
}

/**
 * Finds the closest Indian city to given latitude & longitude coordinates
 */
export function findClosestIndianCity(
  latitude: number,
  longitude: number
): { city: IndianCity; distanceKm: number } {
  let closestCity = INDIAN_CITIES[0];
  let minDistance = Infinity;

  for (const city of INDIAN_CITIES) {
    const dist = calculateHaversineDistanceKm(latitude, longitude, city.latitude, city.longitude);
    if (dist < minDistance) {
      minDistance = dist;
      closestCity = city;
    }
  }

  return { city: closestCity, distanceKm: minDistance };
}

/**
 * Searches cities, localities, and pincodes
 */
export function searchIndianLocations(query: string): Array<{
  type: 'CITY' | 'LOCALITY' | 'PINCODE';
  cityName: string;
  state: string;
  localityName?: string;
  pincode?: string;
  latitude: number;
  longitude: number;
  displayText: string;
}> {
  if (!query || query.trim().length === 0) return [];
  const q = query.toLowerCase().trim();
  const results: any[] = [];

  for (const city of INDIAN_CITIES) {
    // Match city name
    if (city.name.toLowerCase().includes(q) || city.slug.includes(q)) {
      results.push({
        type: 'CITY',
        cityName: city.name,
        state: city.state,
        latitude: city.latitude,
        longitude: city.longitude,
        displayText: `${city.name}, ${city.state}`
      });
    }

    // Match localities and pincodes
    for (const loc of city.popularLocalities) {
      if (loc.name.toLowerCase().includes(q)) {
        results.push({
          type: 'LOCALITY',
          cityName: city.name,
          state: city.state,
          localityName: loc.name,
          pincode: loc.pincode,
          latitude: loc.latitude,
          longitude: loc.longitude,
          displayText: `${loc.name}, ${city.name}`
        });
      } else if (loc.pincode.startsWith(q)) {
        results.push({
          type: 'PINCODE',
          cityName: city.name,
          state: city.state,
          localityName: loc.name,
          pincode: loc.pincode,
          latitude: loc.latitude,
          longitude: loc.longitude,
          displayText: `${loc.pincode} (${loc.name}, ${city.name})`
        });
      }
    }
  }

  return results.slice(0, 10);
}
