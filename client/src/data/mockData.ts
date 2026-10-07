import { 
  Restaurant, 
  MenuItem, 
  Order, 
  Reservation, 
  CulinaryEvent, 
  Promotion, 
  DeliveryPartner, 
  DeliveryRequest, 
  AdminKYCApplication, 
  AuditLog, 
  Review,
  AppNotification
} from '../types';

// Unsplash high quality food & restaurant photography
const FOOD_IMAGES = [
  'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop', // Biryani
  'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop', // Curry
  'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop', // Tandoori
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop', // Fine dining
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop', // Restaurant interior
  'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop', // Kebab
  'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop', // Samosa / Chaat
  'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop', // Dosa / South Indian
  'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop', // Paneer Tikka
  'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop', // Thali
  'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop', // Ribs / Grill
  'https://images.unsplash.com/photo-1552611052-33e04de081de?w=600&auto=format&fit=crop', // Asian bowl
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop', // Gourmet spread
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop', // Salad
  'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop', // Sushi / Rolls
  'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop', // Desserts
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop', // Pizza
  'https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&auto=format&fit=crop'  // Seafood
];

const RESTAURANT_IMAGES = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&auto=format&fit=crop'
];

interface CityMetadata {
  name: string;
  state: string;
  lat: number;
  lng: number;
  localities: Array<{ name: string; pin: string; lat: number; lng: number }>;
  restaurantTemplates: Array<{
    name: string;
    mode: 'HYBRID' | 'DELIVERY_ONLY' | 'DINING_ONLY';
    cuisines: string[];
    description: string;
    speciality: string;
  }>;
}

const CITIES_DATA: Record<string, CityMetadata> = {
  Dehradun: {
    name: 'Dehradun',
    state: 'Uttarakhand',
    lat: 30.3165,
    lng: 78.0322,
    localities: [
      { name: 'Rajpur Road', pin: '248001', lat: 30.3340, lng: 78.0580 },
      { name: 'Jakhan', pin: '248001', lat: 30.3620, lng: 78.0720 },
      { name: 'Ballupur', pin: '248001', lat: 30.3390, lng: 78.0120 },
      { name: 'Sahastradhara Road', pin: '248013', lat: 30.3480, lng: 78.0820 },
      { name: 'Clement Town', pin: '248002', lat: 30.2670, lng: 78.0060 }
    ],
    restaurantTemplates: [
      { name: 'Doon Bistro & Craft Kitchen', mode: 'HYBRID', cuisines: ['North Indian', 'Continental'], description: 'Artisanal Pahadi & North Indian roasts with valley views.', speciality: 'Kumaoni Pahadi Mutton Curry' },
      { name: 'Mussoorie View Grill & Terrace', mode: 'DINING_ONLY', cuisines: ['Mughlai', 'Tandoori'], description: 'Breathtaking terrace dining with charcoal grilled delicacies.', speciality: 'Galouti Kebab Platter' },
      { name: 'Garhwal Rasoi Heritage', mode: 'HYBRID', cuisines: ['Pahari & Garhwali', 'North Indian'], description: 'Authentic heirloom recipes using Himalayan organic millets and herbs.', speciality: 'Chainsoo & Mandua Ki Roti' },
      { name: 'Indo-Tibetan Kitchen', mode: 'DELIVERY_ONLY', cuisines: ['Tibetan & Momos', 'Asian'], description: 'Steamed Himalayan soup momos and hand-pulled thukpa bowls.', speciality: 'Truffle Tingmo & Jhol Momos' },
      { name: 'The Rajpur Bakery & Cafe', mode: 'HYBRID', cuisines: ['Bakery & Cafe', 'Continental'], description: 'Woodfired sourdough, artisanal croissants and pour-over coffee.', speciality: 'Almond Croissant & Pour Over' },
      { name: 'Kumaon Cloud Kitchen', mode: 'DELIVERY_ONLY', cuisines: ['North Indian', 'Biryani'], description: 'Slow-simmered brass pot dum biryanis and claypot gravies.', speciality: 'Dehradun Basmati Dum Biryani' },
      { name: 'Jakhan Smokehouse Grill', mode: 'HYBRID', cuisines: ['Continental', 'Barbecue'], description: 'Smoked meats, handcrafted sliders and woodfired oven flatbreads.', speciality: 'Applewood Smoked Lamb Chops' },
      { name: 'Paltan Bazaar Street Bites', mode: 'DELIVERY_ONLY', cuisines: ['Street Food', 'Fast Food'], description: 'Iconic street chaats, paneer chole bhature and crispy jalebis.', speciality: 'Amritsari Kulcha Platter' },
      { name: 'Himalayan Truffle & Pasta', mode: 'DINING_ONLY', cuisines: ['Italian', 'Continental'], description: 'Fresh handmade pasta tossed with wild Himalayan morels and truffles.', speciality: 'Morel Mushroom Fettuccine' },
      { name: 'Clement Town Pizzeria', mode: 'HYBRID', cuisines: ['Italian', 'Bakery & Cafe'], description: 'Authentic 48-hour fermented Neapolitan sourdough pizzas.', speciality: 'Burrata & San Marzano Pizza' },
      { name: 'Valley Greens Organic Cafe', mode: 'HYBRID', cuisines: ['Healthy Bowls', 'Continental'], description: 'Farm-to-fork superfood salads, cold-pressed elixirs and smoothie bowls.', speciality: 'Avocado Quinoa Salad' },
      { name: 'Dehradun Club Grill Room', mode: 'DINING_ONLY', cuisines: ['North Indian', 'Continental'], description: 'Colonial style fine dining, silver service and heritage roasts.', speciality: 'Roast Lamb with Mint Jus' },
      { name: 'Tibetan Star Momos', mode: 'DELIVERY_ONLY', cuisines: ['Tibetan & Momos', 'Indo-Chinese'], description: 'Crispy pan-fried kothey momos and fiery Schezwan gravies.', speciality: 'Pan Fried Kothey Momos' },
      { name: 'Rispana Riverside Kitchen', mode: 'HYBRID', cuisines: ['North Indian', 'Mughlai'], description: 'Lush riverside garden seating with royal Awadhi tandoori platters.', speciality: 'Murgh Malai Tikka' },
      { name: 'Pine Forest Brewer & Kitchen', mode: 'DINING_ONLY', cuisines: ['Continental', 'Tandoori'], description: 'Craft brews paired with rustic mountain tandoori appetizers.', speciality: 'Smoked Pine Paneer Skewers' },
      { name: 'Clock Tower Chaat & Sweets', mode: 'DELIVERY_ONLY', cuisines: ['Street Food', 'Desserts'], description: 'Dehradun famous rasmalai, kachoris and signature street snacks.', speciality: 'Raj Kachori Royale' },
      { name: 'Hathibarkala Tandoor Co.', mode: 'HYBRID', cuisines: ['North Indian', 'Tandoori'], description: 'Charcoal clay oven tandoori gravies and slow-cooked dals.', speciality: 'Dal Makhani Bukhara Style' },
      { name: 'Sahastradhara Spring Bowls', mode: 'DELIVERY_ONLY', cuisines: ['Healthy Bowls', 'Asian'], description: 'Fresh poke bowls, soba noodles and nourishing broths.', speciality: 'Teriyaki Tofu Brown Rice Bowl' },
      { name: 'Ballupur Kebab Junction', mode: 'DELIVERY_ONLY', cuisines: ['Mughlai', 'Biryani'], description: 'Old Delhi recipe kakori kebabs, rumali rotis and korma.', speciality: 'Mutton Kakori Kebab' },
      { name: 'The Forest View Rooftop', mode: 'DINING_ONLY', cuisines: ['North Indian', 'Continental'], description: 'Romantic candlelit terrace overlooking Sal forests and the hills.', speciality: 'Saffron Grilled River Sole' }
    ]
  },
  'Delhi NCR': {
    name: 'Delhi NCR',
    state: 'Delhi',
    lat: 28.6139,
    lng: 77.2090,
    localities: [
      { name: 'Connaught Place', pin: '110001', lat: 28.6315, lng: 77.2167 },
      { name: 'Hauz Khas', pin: '110016', lat: 28.5494, lng: 77.2001 },
      { name: 'Saket', pin: '110017', lat: 28.5244, lng: 77.2100 },
      { name: 'Vasant Kunj', pin: '110070', lat: 28.5293, lng: 77.1528 },
      { name: 'Cyber Hub Gurugram', pin: '122002', lat: 28.4986, lng: 77.0890 }
    ],
    restaurantTemplates: [
      { name: 'Bukhara Heritage & Tandoor', mode: 'HYBRID', cuisines: ['Awadhi', 'North Indian'], description: 'Legendary 24-hour slow simmered black lentils and succulent Sikandari roasts.', speciality: 'Dal Bukhara 24hr Slow Simmer' },
      { name: 'Hauz Khas Social Club', mode: 'HYBRID', cuisines: ['Pan-Asian', 'Modern Indian'], description: 'Eclectic rooftop fusion diner with lakeside views and artisanal tapas.', speciality: 'Gunpowder Chicken Wings' },
      { name: 'Chanakya Royal Awadhi Kitchen', mode: 'DINING_ONLY', cuisines: ['Awadhi', 'Mughlai'], description: 'Imperial Lucknowi dum pukht dining fit for royalty.', speciality: 'Dum Pukht Biryani' },
      { name: 'Old Delhi Karim Legacy', mode: 'DELIVERY_ONLY', cuisines: ['Mughlai', 'North Indian'], description: 'Historic Jama Masjid recipe mutton stew, seekh kebabs and sheermaal.', speciality: 'Mutton Nihari with Sheermaal' },
      { name: 'Olive Bar & Kitchen Saket', mode: 'DINING_ONLY', cuisines: ['Mediterranean', 'Italian'], description: 'Stucco white walls, banyan tree canopy and woodfired Italian pizzas.', speciality: 'Truffle Burrata Flatbread' },
      { name: 'Cyber Hub Smoke & Grill', mode: 'HYBRID', cuisines: ['Continental', 'Barbecue'], description: 'Prime aged steaks, smoked briskets and craft house cocktails.', speciality: 'Hickory Smoked Brisket' },
      { name: 'Daryaganj 1947 Butter Chicken', mode: 'HYBRID', cuisines: ['North Indian', 'Tandoori'], description: 'The original inventor of Butter Chicken & Dal Makhani.', speciality: 'Original 1947 Butter Chicken' },
      { name: 'Indian Accent Modern Tasting', mode: 'DINING_ONLY', cuisines: ['Modern Indian', 'Fine Dining'], description: 'Progressive Indian tasting menus elevating traditional street flavours.', speciality: 'Duck Khurchan Cornetto' },
      { name: 'Karol Bagh Sitaram Chole Bhature', mode: 'DELIVERY_ONLY', cuisines: ['North Indian', 'Street Food'], description: 'Delhi iconic paneer stuffed bhaturas with tangy spiced chole.', speciality: 'Paneer Stuffed Bhature' },
      { name: 'Pandara Road Gulati Grille', mode: 'HYBRID', cuisines: ['North Indian', 'Mughlai'], description: 'Midnight cravings hub renowned for butter tandoori chicken.', speciality: 'Murgh Malai Tikka' },
      { name: 'Cyber Hub Burma Burma', mode: 'DINING_ONLY', cuisines: ['Pan-Asian', 'Burmese'], description: 'Pure vegetarian Burmese tea room, khow suey and fermented tea leaf salads.', speciality: 'Signature Burmese Khow Suey' },
      { name: 'Vasant Kunj Town Hall', mode: 'HYBRID', cuisines: ['Japanese', 'Pan-Asian'], description: 'Contemporary sushi bar and robatayaki grill by Chef Augusto Cabrera.', speciality: 'Spicy Salmon Truffle Roll' },
      { name: 'Noida Sector 18 Biryani Blues', mode: 'DELIVERY_ONLY', cuisines: ['Biryani', 'Hyderabadi'], description: 'Kacche gosht ki dum biryani served with mirchi ka salan and dahi chutney.', speciality: 'Hyderabadi Mutton Dum Biryani' },
      { name: 'Gurugram One Horizon Bistro', mode: 'DINING_ONLY', cuisines: ['Continental', 'European'], description: 'Chic corporate power-lunch venue with farm-fresh organic ingredients.', speciality: 'Pan-Seared Sea Bass' },
      { name: 'Khan Market Big Chill Cafe', mode: 'HYBRID', cuisines: ['Italian', 'Bakery & Cafe'], description: 'Iconic retro Italian dining, rich pastas, and legendary mud pies.', speciality: 'Penne with Vodka & Mississippi Mud Pie' },
      { name: 'Lodhi Colony Art Bistro', mode: 'HYBRID', cuisines: ['Cafe & Continental', 'Healthy Bowls'], description: 'Al-fresco cafe tucked amidst India first open public art district.', speciality: 'Avocado Tartine with Feta' },
      { name: 'Majnu Ka Tilla Himalayan Cafe', mode: 'DELIVERY_ONLY', cuisines: ['Tibetan & Momos', 'Asian'], description: 'Laphing, tingmo and soulful bone-broth noodle soups.', speciality: 'Cold Spicy Laphing' },
      { name: 'Defence Colony Moets Tandoor', mode: 'HYBRID', cuisines: ['North Indian', 'Chinese'], description: 'Generations of culinary heritage serving rich tandoori platters.', speciality: 'Tandoori Bheja & Seekh Kebab' },
      { name: 'Connaught Place Saravana Heritage', mode: 'DELIVERY_ONLY', cuisines: ['South Indian', 'Pure Veg'], description: 'Ghee roast dosas, idli vadas and traditional South Indian filter coffee.', speciality: 'Ghee Podi Masala Dosa' },
      { name: 'Aerocity Plum By Bent Chair', mode: 'DINING_ONLY', cuisines: ['Pan-Asian', 'Modern Asian'], description: 'Surreal pan-Asian dining experience with bespoke eccentric decor.', speciality: 'Edamame Truffle Dim Sum' }
    ]
  },
  Mumbai: {
    name: 'Mumbai',
    state: 'Maharashtra',
    lat: 19.0760,
    lng: 72.8777,
    localities: [
      { name: 'Bandra West', pin: '400050', lat: 19.0596, lng: 72.8295 },
      { name: 'Colaba', pin: '400005', lat: 18.9067, lng: 72.8147 },
      { name: 'Juhu', pin: '400049', lat: 19.1075, lng: 72.8263 },
      { name: 'Lower Parel', pin: '400013', lat: 18.9953, lng: 72.8310 },
      { name: 'Powai', pin: '400076', lat: 19.1176, lng: 72.9060 }
    ],
    restaurantTemplates: [
      { name: 'Bandra Coastal Trattoria', mode: 'HYBRID', cuisines: ['Coastal Seafood', 'Italian'], description: 'Fresh catch from the Arabian sea infused with Mangalorean and Italian zest.', speciality: 'Mangalorean Ghee Roast Prawns' },
      { name: 'The Bombay Canteen Lower Parel', mode: 'DINING_ONLY', cuisines: ['Modern Indian', 'Regional Indian'], description: 'Celebrated love letter to Indian regional culinary heritage and seasonal produce.', speciality: 'Eggs Kejriwal & Canteen Haleem' },
      { name: 'Britannia & Co. Heritage Parsi', mode: 'HYBRID', cuisines: ['Parsi', 'Mughlai'], description: 'Iconic Ballard Estate cafe famous for fragrant Iranian Berry Pulao since 1923.', speciality: 'Mutton Berry Pulao & Caramel Custard' },
      { name: 'Gajalee Coastal Seafood Vile Parle', mode: 'HYBRID', cuisines: ['Coastal Seafood', 'Maharashtrian'], description: 'Finest tandoori crab, butter garlic prawns and sol kadhi.', speciality: 'Tandoori Jumbo Mud Crab' },
      { name: 'Bastian At The Top Bandra', mode: 'DINING_ONLY', cuisines: ['Seafood', 'Pan-Asian'], description: 'Sky-high celebrity dining with exquisite lobster mac & cheese and seafood boils.', speciality: 'Lobster Thermidor & Animal Prawns' },
      { name: 'Trishna Fort Seafood', mode: 'HYBRID', cuisines: ['Coastal Seafood', 'Mangalorean'], description: 'World-renowned destination for butter pepper garlic crab and koliwada fish.', speciality: 'Butter Pepper Garlic Crab' },
      { name: 'Pali Village Cafe Bandra', mode: 'DINING_ONLY', cuisines: ['European', 'Italian'], description: 'Distressed chic vintage cafe serving delicate risottos and aged wines.', speciality: 'Wild Truffle Saffron Risotto' },
      { name: 'Juhu Beach Chowpatty Pav Hub', mode: 'DELIVERY_ONLY', cuisines: ['Street Food', 'Maharashtrian'], description: 'Spicy butter pav bhaji, ragda pattice and crispy sev puri.', speciality: 'Amul Butter Special Pav Bhaji' },
      { name: 'Mahesh Lunch Home Fort', mode: 'HYBRID', cuisines: ['Coastal Seafood', 'South Indian'], description: 'Pioneer of authentic Mangalorean coastal fare with neer dosas.', speciality: 'Surmai Fish Curry with Neer Dosa' },
      { name: 'O Pedro Goa Bistro BKC', mode: 'DINING_ONLY', cuisines: ['Goan', 'Portuguese'], description: 'Vibrant Goan warmth, choriz pao, poee breads and house fermented cocktails.', speciality: 'Goan Choriz Chilli Fry with Poee' },
      { name: 'Sardar Refreshments Tardeo', mode: 'DELIVERY_ONLY', cuisines: ['Street Food', 'Fast Food'], description: 'A slab of butter over sizzling spiced bhaji with toasted ladi pav.', speciality: 'Extra Butter Pav Bhaji' },
      { name: 'Bademiya Colaba Kebab Co.', mode: 'DELIVERY_ONLY', cuisines: ['Mughlai', 'Tandoori'], description: 'Night owl tandoori haven behind Taj Mahal Palace since 1946.', speciality: 'Chicken Baida Roti' },
      { name: 'CinCin BKC Italian Trattoria', mode: 'HYBRID', cuisines: ['Italian', 'Wine Bar'], description: 'Hand-rolled pasta, cicchetti and Amalfi coast lemon vibes.', speciality: 'Handmade Pappardelle Lamb Ragu' },
      { name: 'Khar Social & Craft Taproom', mode: 'HYBRID', cuisines: ['Modern Indian', 'Continental'], description: 'Work-play space with quirky bar bites, poutine and thalis.', speciality: 'Dabba Meat Thali' },
      { name: 'Powai Lakeview Herbivore', mode: 'DINING_ONLY', cuisines: ['Pure Veg', 'North Indian'], description: 'Scenic lake-facing pure veg luxury buffet and royal tandoor.', speciality: 'Shahi Paneer Lazeez' },
      { name: 'Swati Snacks Tardeo', mode: 'DELIVERY_ONLY', cuisines: ['Gujarati', 'Street Food'], description: 'Clean, elevated Gujarati street treats: panki, fada ni khichdi and handvo.', speciality: 'Suva Panki & Baked Masala Khichdi' },
      { name: 'Bandra Bagel & Sourdough Co.', mode: 'DELIVERY_ONLY', cuisines: ['Bakery & Cafe', 'Breakfast'], description: 'Artisanal kettle-boiled bagels, smoked salmon and cream cheeses.', speciality: 'Smoked Salmon Dill Bagel' },
      { name: 'Aaswad Dadar Maharashtrian', mode: 'DELIVERY_ONLY', cuisines: ['Maharashtrian', 'Street Food'], description: 'Award-winning spicy Misal Pav and authentic Kothimbir Vadi.', speciality: 'World-Prized Kolhapuri Misal Pav' },
      { name: 'Colaba Cafe Mondegar', mode: 'HYBRID', cuisines: ['Continental', 'Bar Snacks'], description: 'Retro Mario Miranda murals, vintage jukebox and steak sandwiches.', speciality: 'Roast Beef Chilli & Garlic Bread' },
      { name: 'Yauatcha BKC Dim Sum Tea', mode: 'DINING_ONLY', cuisines: ['Pan-Asian', 'Dim Sum'], description: 'Michelin-starred pedigree Cantonese dim sum and bespoke patisserie.', speciality: 'Crispy Duck Roll & Truffle Edamame' }
    ]
  },
  Bengaluru: {
    name: 'Bengaluru',
    state: 'Karnataka',
    lat: 12.9716,
    lng: 77.5946,
    localities: [
      { name: 'Indiranagar', pin: '560038', lat: 12.9784, lng: 77.6408 },
      { name: 'Koramangala', pin: '560034', lat: 12.9352, lng: 77.6245 },
      { name: 'Whitefield', pin: '560066', lat: 12.9698, lng: 77.7499 },
      { name: 'Lavelle Road', pin: '560001', lat: 12.9724, lng: 77.5998 },
      { name: 'JP Nagar', pin: '560078', lat: 12.9063, lng: 77.5857 }
    ],
    restaurantTemplates: [
      { name: 'Indiranagar Craft Kitchen', mode: 'DELIVERY_ONLY', cuisines: ['South Indian', 'Healthy Bowls'], description: 'Fiery Andhra spices meet wholesome millet bowls and ghee roasts.', speciality: 'Andhra Gongura Mutton Bowl' },
      { name: 'Toit Brewpub & Kitchen Indiranagar', mode: 'HYBRID', cuisines: ['Continental', 'Craft Beer'], description: 'Bengaluru flagship microbrewery serving woodfired pizzas and pub grub.', speciality: 'Toit Tintin Craft Ale & Beef Lasagna' },
      { name: 'Vidyarthi Bhavan Gandhi Bazaar', mode: 'DELIVERY_ONLY', cuisines: ['South Indian', 'Pure Veg'], description: 'Historic crisp thick Benne Masala Dosa soaked in pure melted butter since 1943.', speciality: 'Golden Crispy Benne Masala Dosa' },
      { name: 'Nagarjuna Andhra Meals Residency Rd', mode: 'HYBRID', cuisines: ['Andhra', 'South Indian'], description: 'Unlimited banana leaf spicy Andhra thalis with hot gun powder and ghee.', speciality: 'Andhra Chilli Chicken & Meals' },
      { name: 'Karavalli Gateway Hotel', mode: 'DINING_ONLY', cuisines: ['Coastal Seafood', 'South Indian'], description: 'Quintessential coastal kitchen replicating Southwest household recipes.', speciality: 'Mangalorean Crab Milagu Fry' },
      { name: 'Truffles Ice & Spice St. Marks', mode: 'HYBRID', cuisines: ['American', 'Burgers'], description: 'The undisputed burger heaven for juicy stacked patties and thick shakes.', speciality: 'All-American Cheese Beast Burger' },
      { name: 'The Fatty Bao Indiranagar', mode: 'DINING_ONLY', cuisines: ['Pan-Asian', 'Japanese'], description: 'Playful Asian gastro-bar famed for pillowy steamed baos and ramen bowls.', speciality: 'Char Siu Pork Bao & Ramen' },
      { name: 'Windmills Craftworks Whitefield', mode: 'DINING_ONLY', cuisines: ['Continental', 'American'], description: 'Jazz library, stellar microbrewery and craft culinary masterpieces.', speciality: 'Stout Braised Pork Ribs' },
      { name: 'Meghana Biryani Koramangala', mode: 'DELIVERY_ONLY', cuisines: ['Biryani', 'Andhra'], description: 'Bengaluru most craved spicy boneless chicken dum biryani.', speciality: 'Special Chicken Boneless Biryani' },
      { name: 'CTR Shri Sagar Malleshwaram', mode: 'DELIVERY_ONLY', cuisines: ['South Indian', 'Breakfast'], description: 'Iconic Benne Dosa with coconut chutney and filter kaapi.', speciality: 'Benne Dosa with Ghee' },
      { name: 'Smoke House Deli Lavelle Road', mode: 'HYBRID', cuisines: ['European', 'Continental'], description: 'Illustrated whimsical walls and refined European comfort cooking.', speciality: 'Smoked Chicken & Truffle Mac' },
      { name: 'Koramangala Social Workspace', mode: 'HYBRID', cuisines: ['Modern Indian', 'Continental'], description: 'High-energy lounge with tech-friendly seating and craft cocktails.', speciality: 'Chilli Chicken Black Pepper Pao' },
      { name: 'Mavalli Tiffin Room (MTR) Lalbagh', mode: 'HYBRID', cuisines: ['South Indian', 'Pure Veg'], description: 'The inventor of Rava Dosa serving silver-thali traditional feasts.', speciality: 'Royal Rava Masala Dosa & Badam Halwa' },
      { name: 'Brik Oven Neapolitan Pizzeria', mode: 'DELIVERY_ONLY', cuisines: ['Italian', 'Pizza'], description: 'Handcrafted sourdough pizzas baked at 450C in custom wood ovens.', speciality: 'Bird in Hand Truffle Pizza' },
      { name: 'Farzi Cafe UB City', mode: 'DINING_ONLY', cuisines: ['Modern Indian', 'Molecular Gastronomy'], description: 'Illusionary modern Indian dining overlooking luxury rooftops.', speciality: 'Tempura Fried Prawns with Nimboo Mirchi' },
      { name: 'Whitefield Green Theory Organic', mode: 'HYBRID', cuisines: ['Healthy Bowls', 'Vegan'], description: 'Boho garden villa serving artisanal plant-based soul food.', speciality: 'Organic Beetroot Burger' },
      { name: 'Chulha Chauki Da Dhaba JP Nagar', mode: 'DELIVERY_ONLY', cuisines: ['North Indian', 'Dhaba'], description: 'Highway dhaba authenticity with open coal tandoor flatbreads.', speciality: 'Kulhad Chicken & Butter Roti' },
      { name: 'Hole In The Wall Cafe Koramangala', mode: 'HYBRID', cuisines: ['Breakfast', 'American'], description: 'Famous all-day American breakfast, waffles and farmer omelettes.', speciality: 'Loaded Farmer Breakfast Platter' },
      { name: 'The Only Place Museum Road', mode: 'DINING_ONLY', cuisines: ['Continental', 'Steaks'], description: 'Generations of steak excellence, apple pies and iced teas.', speciality: 'Chateaubriand Tenderloin Steak' },
      { name: 'Bengaluru Sourdough Co.', mode: 'DELIVERY_ONLY', cuisines: ['Bakery & Cafe', 'Artisanal'], description: 'Naturally fermented loaves, babkas and flaky almond Danishes.', speciality: 'Cinnamon Swirl Cruffin' }
    ]
  },
  Jaipur: {
    name: 'Jaipur',
    state: 'Rajasthan',
    lat: 26.9124,
    lng: 75.7873,
    localities: [
      { name: 'C-Scheme', pin: '302001', lat: 26.9124, lng: 75.7973 },
      { name: 'MI Road', pin: '302001', lat: 26.9196, lng: 75.8118 },
      { name: 'Raja Park', pin: '302004', lat: 26.8920, lng: 75.8270 },
      { name: 'Vaishali Nagar', pin: '302021', lat: 26.9056, lng: 75.7420 },
      { name: 'Malviya Nagar', pin: '302017', lat: 26.8530, lng: 75.8170 }
    ],
    restaurantTemplates: [
      { name: 'Handi Restaurant & Tandoor MI Road', mode: 'HYBRID', cuisines: ['Rajasthani', 'North Indian'], description: 'Award-winning charcoal tandoor and traditional Laal Maas simmered in Mathania chillies.', speciality: 'Authentic Mathania Laal Maas' },
      { name: '1135 AD Amer Fort Dining', mode: 'DINING_ONLY', cuisines: ['Rajasthani Royal', 'Mughlai'], description: 'Eat like Maharajas inside historical Amer Fort under gold-leaf ceilings and live Santoor.', speciality: 'Thaal-e-Jodhpur Imperial Platter' },
      { name: 'Rawat Mishthan Bhandar Station Rd', mode: 'DELIVERY_ONLY', cuisines: ['Rajasthani', 'Street Food'], description: 'World-famous flaky, spicy Pyaaz Kachoris and Mawa Kachoris.', speciality: 'Iconic Crispy Pyaaz Kachori' },
      { name: 'LMB (Laxmi Misthan Bhandar) Johari Bazar', mode: 'HYBRID', cuisines: ['Rajasthani', 'Pure Veg'], description: 'Royal pure ghee Rajasthani thalis and Ghewar since 1727 in the Walled City.', speciality: 'Royal Rajasthani Dal Baati Churma Thali' },
      { name: 'Peacock Rooftop Restaurant Hathroi', mode: 'HYBRID', cuisines: ['North Indian', 'Continental'], description: 'Charming rooftop adorned with peacock motifs, breezy cabanas and acoustic music.', speciality: 'Mughlai Paneer Pasanda' },
      { name: 'Spice Court Civil Lines', mode: 'DINING_ONLY', cuisines: ['Rajasthani', 'Mughlai'], description: 'Heritage courtyard dining famous for fiery Jungli Maas and Keema Baati.', speciality: 'Royal Junglee Maas' },
      { name: 'Baradari City Palace Dining', mode: 'DINING_ONLY', cuisines: ['Rajasthani', 'European'], description: 'Refined courtyards of the Maharaja of Jaipur City Palace with fusion culinary art.', speciality: 'Saffron Risotto with Rajasthani Herbs' },
      { name: 'Tapri Central C-Scheme', mode: 'HYBRID', cuisines: ['Cafe & Chai', 'Street Food'], description: 'Beloved rooftop overlooking Central Park with artisanal chai and desi snacks.', speciality: 'Kulhad Chai with Bun Maska' },
      { name: 'Chokhi Dhani Ethnic Kitchen', mode: 'DINING_ONLY', cuisines: ['Rajasthani', 'Traditional'], description: 'Authentic village hospitality with Bajre ki Roti, Gatte ki Sabzi and Gur.', speciality: 'Traditional Baati Churma' },
      { name: 'Niros Restaurant MI Road', mode: 'HYBRID', cuisines: ['North Indian', 'Continental'], description: 'Pioneering culinary institution since 1949 serving dignitaries and celebrities.', speciality: 'Reshmi Kebab & Chicken Manchurian' },
      { name: 'Raja Park Sethi Tikka Kabab', mode: 'DELIVERY_ONLY', cuisines: ['Tandoori', 'North Indian'], description: 'Jaipur street food hotspot for butter-drenched chicken tikkas and rumali rotis.', speciality: 'Butter Cream Chicken Tikka' },
      { name: 'Town Coffee C-Scheme', mode: 'HYBRID', cuisines: ['Bakery & Cafe', 'Continental'], description: 'Speciality roasters, artisanal toasts and relaxed greenhouse aesthetics.', speciality: 'Truffle Scrambled Eggs on Brioche' },
      { name: 'Vaishali Royal Cloud Kitchen', mode: 'DELIVERY_ONLY', cuisines: ['North Indian', 'Biryani'], description: 'Express delivery of royal dum biryanis and claypot curries.', speciality: 'Shahi Gosht Dum Biryani' },
      { name: 'Sanjay Omelette Janta Store', mode: 'DELIVERY_ONLY', cuisines: ['Fast Food', 'Street Food'], description: 'Over 150 varieties of quirky gourmet egg creations.', speciality: 'Egg Pizza Omelette' },
      { name: 'Shikar Bagh Bar & Grill', mode: 'DINING_ONLY', cuisines: ['Continental', 'Tandoori'], description: 'Hunting lodge aesthetic with outdoor fireplaces and woodfired grills.', speciality: 'Charcoal Grilled Lamb Chops' },
      { name: 'Jaipur Baking Co. Marriott', mode: 'DELIVERY_ONLY', cuisines: ['Bakery & Cafe', 'Desserts'], description: 'Five-star pastry arts, artisanal chocolates and sourdough bakes.', speciality: 'Dark Belgian Chocolate Gateau' },
      { name: 'Masala Ministry C-Scheme', mode: 'HYBRID', cuisines: ['Modern Indian', 'Pure Veg'], description: 'Fun, theatrical pure-veg dining using liquid nitrogen and progressive recipes.', speciality: 'Liquid Nitrogen Bhel & Paneer Butter Masala' },
      { name: 'Malviya Kebab Hub', mode: 'DELIVERY_ONLY', cuisines: ['Mughlai', 'Tandoori'], description: 'Late-night seekh kebabs, kathi rolls and roomali wraps.', speciality: 'Mutton Seekh Roll' },
      { name: 'Forresta Kitchen & Bar', mode: 'DINING_ONLY', cuisines: ['Continental', 'North Indian'], description: 'Enchanted forest-themed open-air garden dining with illuminated trees.', speciality: 'Woodfired Truffle Flatbread' },
      { name: 'Gulab Ji Chai Wale Sindhi Camp', mode: 'DELIVERY_ONLY', cuisines: ['Street Food', 'Tea & Snacks'], description: 'World-famous spiced masala chai paired with Maska Bun and Samosas.', speciality: 'Kesar Masala Chai & Maska Bun' }
    ]
  }
};

// Realistic menu item templates to synthesize 15-30 items per restaurant
function generateMenuItemsForRestaurant(restaurantId: string, cuisines: string[]): MenuItem[] {
  const categories = ['Starters & Tandoor', 'Mains & Curries', 'Biryani & Breads', 'Desserts & Drinks'];
  const items: MenuItem[] = [];

  const starterTemplates = [
    { name: 'Charcoal Paneer Tikka Angara', desc: 'Smoked cottage cheese marinated in hung curd, yellow mustard and degi mirch.', price: 320, veg: true, special: true },
    { name: 'Truffle Mushroom Galouti', desc: 'Melt-in-mouth wild mushroom patties spiced with potli masala on mini parathas.', price: 360, veg: true },
    { name: 'Murgh Malai Peshawari Tikka', desc: 'Tender chicken thighs steeped in cardamom cream, royal cumin and cheddar.', price: 420, veg: false, special: true },
    { name: 'Bhatti Ka Mutton Seekh Kebab', desc: 'Minced Himalayan kid lamb, ground ginger and charred over sweet tamarind wood.', price: 490, veg: false },
    { name: 'Crispy Lotus Stem Honey Chilli', desc: 'Wok-tossed lotus crisps with roasted sesame and crushed mountain chillies.', price: 290, veg: true },
    { name: 'Coastal Ghee Roast Prawns', desc: 'Black tiger prawns tossed in Kundapur fiery red chilli paste and clarified butter.', price: 540, veg: false, special: true },
    { name: 'Dahi Ke Kebab & Mint Relish', desc: 'Crisp golden patties of hung yoghurt, cracked peppercorns and coriander.', price: 280, veg: true },
    { name: 'Steamed Himalayan Truffle Dim Sum', desc: 'Translucent parcel stuffed with wild greens, water chestnuts and truffle oil.', price: 340, veg: true }
  ];

  const mainsTemplates = [
    { name: 'Dal Bukhara Slow Simmer 24hr', desc: 'Black urad lentils, vine-ripened tomatoes and dairy butter simmered on clay embers.', price: 380, veg: true, special: true },
    { name: 'Old Delhi Velvet Butter Chicken', desc: 'Tandoor-charred pulled chicken in a rich, buttery tomato gravy with dried fenugreek.', price: 460, veg: false, special: true },
    { name: 'Kumaoni Pahadi Mutton Curry', desc: 'Rustic mountain curry slow-cooked with charred onions and fresh ground coriander seeds.', price: 520, veg: false, special: true },
    { name: 'Paneer Lababdar & Charred Peppers', desc: 'Cottage cheese chunks cooked in spiced onion gravy topped with grated paneer.', price: 360, veg: true },
    { name: 'Rajasthani Royal Laal Maas', desc: 'Slow-cooked tender goat meat steeped in smoky Mathania red chillies and mustard oil.', price: 580, veg: false, special: true },
    { name: 'South Indian Chettinad Pepper Chicken', desc: 'Fiery roasted peppercorns, curry leaves, shallots and grated fresh coconut.', price: 440, veg: false },
    { name: 'Subz Handi Dum Lazeez', desc: 'Garden vegetables and baby corn simmered in a saffron cashew nut gravy.', price: 320, veg: true },
    { name: 'Malabar Fish Curry with Kokum', desc: 'Fresh reef fish simmered in mild coconut milk, dried kokum and mustard tempering.', price: 490, veg: false }
  ];

  const riceBreadTemplates = [
    { name: 'Awadhi Gosht Dum Biryani', desc: 'Aged basmati rice, tender mutton cuts, ittar and kewra sealed in a clay handi.', price: 480, veg: false, special: true },
    { name: 'Subz Jackfruit Dum Biryani', desc: 'Raw tender kathal, browned onions, saffron milk and whole aromatic spices.', price: 360, veg: true },
    { name: 'Garlic Butter Chur Chur Naan', desc: 'Layered tandoori flatbread crushed with melted butter and roasted garlic.', price: 110, veg: true },
    { name: 'Truffle Goat Cheese Kulcha', desc: 'Crisp leavened bread stuffed with aged goat cheese, wild herbs and truffle butter.', price: 180, veg: true, special: true },
    { name: 'Steamed Jeera Basmati Rice', desc: 'Aromatic long-grain rice tempered with royal cumin and ghee.', price: 180, veg: true },
    { name: 'Laccha Paratha Pudina', desc: 'Multi-layered crispy wheat bread sprinkled with dried mint leaves.', price: 90, veg: true }
  ];

  const dessertDrinkTemplates = [
    { name: 'Gulab Jamun Flambeed with Old Monk', desc: 'Warm cottage cheese dumplings infused with dark rum syrup and pistachio silver.', price: 220, veg: true, special: true },
    { name: 'Baked Saffron Rabdi & Malpua', desc: 'Traditional Rajasthani pancakes soaked in saffron milk and layered with thick rabdi.', price: 240, veg: true },
    { name: 'Himalayan Kesar Pista Kulfi', desc: 'Slow-churned dense milk cream ice with wild mountain saffron threads.', price: 160, veg: true },
    { name: 'Signature Mango Cardamom Lassi', desc: 'Creamy yoghurt churned with Ratnagiri Alphonso mango pulp.', price: 140, veg: true },
    { name: 'Cold Brew Rose & Hibiscus Elixir', desc: 'Infused botanical iced brew with organic rose petals and sparkling tonic.', price: 180, veg: true }
  ];

  let itemIdx = 1;
  const buildItems = (list: any[], cat: string) => {
    list.forEach(t => {
      items.push({
        _id: `${restaurantId}_item_${itemIdx}`,
        restaurantId,
        category: cat,
        name: t.name,
        description: t.desc,
        basePrice: t.price,
        imageUrl: FOOD_IMAGES[(itemIdx - 1) % FOOD_IMAGES.length],
        dietaryTags: t.veg ? (t.special ? ['VEG', 'CHEF_SPECIAL'] : ['VEG']) : (t.special ? ['NON_VEG', 'CHEF_SPECIAL'] : ['NON_VEG']),
        isAvailable: true,
        isSpecial: t.special || false,
        preparationTimeMinutes: 20 + (itemIdx % 15),
        rating: 4.5 + (itemIdx % 5) * 0.1,
        orderCount: 40 + (itemIdx * 12),
        variants: [
          { name: 'Regular Portion', priceDelta: 0 },
          { name: 'Family Sharing Bowl', priceDelta: Math.round(t.price * 0.7) }
        ],
        modifierGroups: [
          {
            name: 'Spice Level',
            minSelection: 0,
            maxSelection: 1,
            options: [
              { name: 'Mild & Fragrant', price: 0 },
              { name: 'Medium Desi Spiced', price: 0 },
              { name: 'Fiery Indian Heat', price: 0 }
            ]
          },
          {
            name: 'Special Accompaniment',
            minSelection: 0,
            maxSelection: 2,
            options: [
              { name: 'Add Extra Ghee Dip', price: 30 },
              { name: 'Burani Garlic Raita', price: 60 },
              { name: 'Fresh Laccha Onion Salad', price: 40 }
            ]
          }
        ]
      });
      itemIdx++;
    });
  };

  buildItems(starterTemplates, 'Starters & Tandoor');
  buildItems(mainsTemplates, 'Mains & Curries');
  buildItems(riceBreadTemplates, 'Biryani & Breads');
  buildItems(dessertDrinkTemplates, 'Desserts & Drinks');

  return items;
}

// Generate the 100 restaurants (20 per city across 5 cities)
export function generateInitialRestaurants(): { restaurants: Restaurant[]; menuItems: MenuItem[] } {
  const allRestaurants: Restaurant[] = [];
  const allMenuItems: MenuItem[] = [];

  const cityKeys = Object.keys(CITIES_DATA);

  cityKeys.forEach(cityName => {
    const city = CITIES_DATA[cityName];
    const citySlug = cityName.toLowerCase().replace(/\s+/g, '-');

    city.restaurantTemplates.forEach((template, index) => {
      const restId = `rest_${citySlug}_${(index + 1).toString().padStart(2, '0')}`;
      const locality = city.localities[index % city.localities.length];
      const heroImg = RESTAURANT_IMAGES[(index + cityKeys.indexOf(cityName)) % RESTAURANT_IMAGES.length];

      const restaurant: Restaurant = {
        _id: restId,
        name: template.name,
        slug: template.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        ownerId: `owner_${restId}`,
        operatingMode: template.mode,
        cuisineTypes: template.cuisines,
        description: template.description,
        heroImage: heroImg,
        logoImage: heroImg,
        address: {
          label: 'Primary Outlet',
          addressLine1: `${10 + index * 3}, Heritage Food Boulevard`,
          addressLine2: `Near ${locality.name} Circle`,
          locality: locality.name,
          city: city.name,
          state: city.state,
          postalCode: locality.pin,
          country: 'India',
          coordinates: {
            latitude: locality.lat + (Math.sin(index) * 0.008),
            longitude: locality.lng + (Math.cos(index) * 0.008)
          }
        },
        location: {
          type: 'Point',
          coordinates: [
            locality.lng + (Math.cos(index) * 0.008),
            locality.lat + (Math.sin(index) * 0.008)
          ]
        },
        maxDeliveryRadiusKm: 12,
        deliveryZones: [
          { maxDistanceKm: 4, deliveryFee: 35, minOrderAmount: 199 },
          { maxDistanceKm: 8, deliveryFee: 65, minOrderAmount: 299 },
          { maxDistanceKm: 12, deliveryFee: 95, minOrderAmount: 499 }
        ],
        businessHours: [
          { day: 0, open: '11:00', close: '23:30', isClosed: false },
          { day: 1, open: '11:00', close: '23:30', isClosed: false },
          { day: 2, open: '11:00', close: '23:30', isClosed: false },
          { day: 3, open: '11:00', close: '23:30', isClosed: false },
          { day: 4, open: '11:00', close: '23:30', isClosed: false },
          { day: 5, open: '11:00', close: '00:30', isClosed: false },
          { day: 6, open: '11:00', close: '00:30', isClosed: false }
        ],
        fssaiLicenseNumber: `1002${(index + 10).toString().padStart(3, '0')}${(city.lat * 1000).toFixed(0).slice(0, 7)}`,
        gstinNumber: `05AAACF${(index + 1000)}B1Z${index % 9}`,
        commissionRate: 10 + (index % 3), // 10% - 12% ethical commission
        averageRating: parseFloat((4.3 + (index % 7) * 0.1).toFixed(1)),
        totalReviews: 80 + index * 14,
        isActive: true,
        verificationStatus: 'APPROVED',
        featured: index < 3,
        specialOffers: [
          index % 2 === 0 ? '50% off up to ₹100 | Code WELCOME50' : 'Free Delivery on orders above ₹249',
          'Flat ₹200 off on Gourmet Family Feasts'
        ],
        tableCapacity: template.mode === 'DELIVERY_ONLY' ? 0 : 45 + (index * 4),
        priceRange: index % 3 === 0 ? '₹₹₹' : (index % 2 === 0 ? '₹₹' : '₹')
      };

      allRestaurants.push(restaurant);

      // Generate 27 menu items for this restaurant
      const items = generateMenuItemsForRestaurant(restId, template.cuisines);
      allMenuItems.push(...items);
    });
  });

  return { restaurants: allRestaurants, menuItems: allMenuItems };
}

// Initial Culinary Events
export const INITIAL_EVENTS: CulinaryEvent[] = [
  {
    _id: 'event_01',
    restaurantId: 'rest_dehradun_01',
    restaurantName: 'Doon Bistro & Craft Kitchen',
    title: 'Himalayan Foraging & Slow Food Masterclass',
    description: 'An intimate 5-course degustation menu celebrating rare wild morels, fiddlehead ferns and Kumaoni mountain herbs, hosted by Chef Vikram Malhotra.',
    bannerImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
    eventDate: '2026-10-15',
    timeSlot: '07:30 PM - 10:30 PM IST',
    ticketPrice: 1850,
    totalCapacity: 35,
    bookedCount: 22,
    cuisine: 'Pahari Heritage',
    tags: ['Masterclass', 'Degustation', 'Wine Pairing'],
    status: 'UPCOMING',
    highlights: ['5-course curated tasting', 'Artisanal Himalayan wine pairing', 'Live chef demonstration'],
    chefName: 'Chef Vikram Malhotra'
  },
  {
    _id: 'event_02',
    restaurantId: 'rest_delhi-ncr_01',
    restaurantName: 'Bukhara Heritage & Tandoor',
    title: 'Sufi & Tandoor Night Under The Stars',
    description: 'Immerse in soul-stirring live acoustic Sufi music accompanied by Bukhara timeless slow-simmered culinary secrets in Delhi historic heart.',
    bannerImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    eventDate: '2026-10-20',
    timeSlot: '08:00 PM - 11:30 PM IST',
    ticketPrice: 2400,
    totalCapacity: 50,
    bookedCount: 41,
    cuisine: 'Awadhi & Mughlai',
    tags: ['Live Sufi', 'Royal Tandoor', 'Candlelit'],
    status: 'UPCOMING',
    highlights: ['Live Nizami Sufi Troupe', 'Unlimited royal tandoor roasts', 'Special brass-pot Dal Bukhara batch'],
    chefName: 'Master Ustad Karim'
  },
  {
    _id: 'event_03',
    restaurantId: 'rest_mumbai_01',
    restaurantName: 'Bandra Coastal Trattoria',
    title: 'Arabian Sea Mud Crab & Coastal Fiesta',
    description: 'Celebration of Mumbai coastal fishing culture. Taste jumbo mangrove crabs cooked in Kundapur ghee roast, butter garlic and sol kadhi reduction.',
    bannerImage: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800',
    eventDate: '2026-10-25',
    timeSlot: '07:00 PM - 10:00 PM IST',
    ticketPrice: 2200,
    totalCapacity: 40,
    bookedCount: 30,
    cuisine: 'Coastal Seafood',
    tags: ['Seafood Boil', 'Mangalorean', 'Craft Beers'],
    status: 'UPCOMING',
    highlights: ['Fresh morning catch selection', 'Neer dosa live station', 'Coastal craft cocktail included'],
    chefName: 'Chef Jude D\'Souza'
  },
  {
    _id: 'event_04',
    restaurantId: 'rest_bengaluru_02',
    restaurantName: 'Toit Brewpub & Kitchen Indiranagar',
    title: 'Craft Beer Brewing & Neapolitan Pizza Workshop',
    description: 'Hands-on session with our master brewmasters and head pizzaiolos on sourdough fermentation and beer pairing notes.',
    bannerImage: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
    eventDate: '2026-11-05',
    timeSlot: '04:00 PM - 07:30 PM IST',
    ticketPrice: 1500,
    totalCapacity: 25,
    bookedCount: 18,
    cuisine: 'Brewery & Pizza',
    tags: ['Brewery Tour', 'Pizza Making', 'Interactive'],
    status: 'UPCOMING',
    highlights: ['Brewery floor guided tour', 'Make your own sourdough pie', 'Tasting flight of 6 craft ales'],
    chefName: 'Master Brewer Sumanth'
  },
  {
    _id: 'event_05',
    restaurantId: 'rest_jaipur_02',
    restaurantName: '1135 AD Amer Fort Dining',
    title: 'The Royal Maharajas Banquet at Amer Fort',
    description: 'Step into royal 17th-century splendour inside Amer Fort. Relish 12 ancient Rajput recipes cooked with Mathania chillies and edible gold foil.',
    bannerImage: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800',
    eventDate: '2026-11-12',
    timeSlot: '08:00 PM - 11:00 PM IST',
    ticketPrice: 3500,
    totalCapacity: 30,
    bookedCount: 19,
    cuisine: 'Royal Rajasthani',
    tags: ['Heritage Fort', 'Royal Thali', 'Live Santoor'],
    status: 'UPCOMING',
    highlights: ['Private heritage fort dining hall', 'Live Santoor & Sarangi performance', 'Silver thali banquet service'],
    chefName: 'Thakur Ranveer Singh'
  }
];

// Initial Promotions
export const INITIAL_PROMOTIONS: Promotion[] = [
  {
    _id: 'promo_01',
    code: 'WELCOME50',
    title: 'First Bite Welcome Deal',
    description: 'Get 50% discount up to ₹100 on your artisanal food order.',
    discountType: 'PERCENTAGE',
    discountValue: 50,
    maxDiscount: 100,
    minOrderAmount: 199,
    validUntil: '2026-12-31',
    isActive: true,
    usageCount: 1420,
    scope: 'ALL_RESTAURANTS'
  },
  {
    _id: 'promo_02',
    code: 'FREEDELIVERY',
    title: 'Zero Delivery Fee Feast',
    description: '100% off delivery charges on all orders above ₹249.',
    discountType: 'FLAT',
    discountValue: 65,
    minOrderAmount: 249,
    validUntil: '2026-12-31',
    isActive: true,
    usageCount: 3840,
    scope: 'ALL_RESTAURANTS'
  },
  {
    _id: 'promo_03',
    code: 'GOURMET10',
    title: 'Artisanal Club 10% Off',
    description: 'Enjoy 10% flat off on premium chef-recommended dishes.',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    maxDiscount: 250,
    minOrderAmount: 499,
    validUntil: '2026-12-31',
    isActive: true,
    usageCount: 910,
    scope: 'ALL_RESTAURANTS'
  },
  {
    _id: 'promo_04',
    code: 'FESTIVE200',
    title: 'Grand Banquet Celebration',
    description: 'Flat ₹200 off on festive family dining orders above ₹999.',
    discountType: 'FLAT',
    discountValue: 200,
    minOrderAmount: 999,
    validUntil: '2026-12-31',
    isActive: true,
    usageCount: 420,
    scope: 'ALL_RESTAURANTS'
  }
];

// Initial Delivery Partner Fleet
export const INITIAL_RIDERS: DeliveryPartner[] = [
  {
    _id: 'rider_01',
    name: 'Rajesh Kumar',
    phone: '+919822334455',
    email: 'rider@gourmetfleet.com',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    vehicleType: 'BIKE',
    vehicleNumber: 'UK 07 AF 4821',
    drivingLicenseNumber: 'DL-0720210084920',
    aadhaarVerified: true,
    rating: 4.9,
    totalTrips: 482,
    isOnline: true,
    currentLocation: { lat: 30.3340, lng: 78.0580 },
    status: 'AVAILABLE',
    earningsToday: 780,
    earningsThisWeek: 4850,
    earningsThisMonth: 21400
  },
  {
    _id: 'rider_02',
    name: 'Amit Verma',
    phone: '+919877112233',
    email: 'amit.verma@fleet.com',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    vehicleType: 'EV',
    vehicleNumber: 'DL 03 EV 9124',
    drivingLicenseNumber: 'DL-0320200049281',
    aadhaarVerified: true,
    rating: 4.8,
    totalTrips: 340,
    isOnline: true,
    currentLocation: { lat: 28.6315, lng: 77.2167 },
    status: 'AVAILABLE',
    earningsToday: 620,
    earningsThisWeek: 3900,
    earningsThisMonth: 18200
  },
  {
    _id: 'rider_03',
    name: 'Siddharth Jadhav',
    phone: '+919833445566',
    email: 'siddharth.j@fleet.com',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    vehicleType: 'SCOOTER',
    vehicleNumber: 'MH 02 CK 3829',
    drivingLicenseNumber: 'MH-0220190019283',
    aadhaarVerified: true,
    rating: 4.95,
    totalTrips: 620,
    isOnline: true,
    currentLocation: { lat: 19.0596, lng: 72.8295 },
    status: 'AVAILABLE',
    earningsToday: 950,
    earningsThisWeek: 5600,
    earningsThisMonth: 24900
  }
];

// Initial Delivery Requests for Riders
export const INITIAL_DELIVERY_REQUESTS: DeliveryRequest[] = [
  {
    _id: 'req_01',
    orderId: 'order_live_01',
    orderNumber: 'GF-94821',
    restaurantId: 'rest_dehradun_01',
    restaurantName: 'Doon Bistro & Craft Kitchen',
    restaurantAddress: {
      addressLine1: '10, Heritage Food Boulevard',
      locality: 'Rajpur Road',
      city: 'Dehradun',
      postalCode: '248001'
    },
    customerName: 'Aarav Sharma',
    customerPhone: '+919876543210',
    deliveryAddress: {
      addressLine1: 'Flat 402, Pine Crest Apartments',
      locality: 'Rajpur Road',
      city: 'Dehradun',
      postalCode: '248001'
    },
    restaurantDistanceKm: 1.2,
    customerDistanceKm: 2.1,
    totalDistanceKm: 3.3,
    estimatedPayout: 75,
    estimatedTimeMinutes: 22,
    searchRadiusKm: 2,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 180000).toISOString(),
    itemsCount: 3
  },
  {
    _id: 'req_02',
    orderId: 'order_live_02',
    orderNumber: 'GF-94822',
    restaurantId: 'rest_dehradun_03',
    restaurantName: 'Garhwal Rasoi Heritage',
    restaurantAddress: {
      addressLine1: '24, Jakhan Chowk',
      locality: 'Jakhan',
      city: 'Dehradun',
      postalCode: '248001'
    },
    customerName: 'Priya Mehra',
    customerPhone: '+919811223399',
    deliveryAddress: {
      addressLine1: 'House 14, Canal Road',
      locality: 'Ballupur',
      city: 'Dehradun',
      postalCode: '248001'
    },
    restaurantDistanceKm: 2.4,
    customerDistanceKm: 3.8,
    totalDistanceKm: 6.2,
    estimatedPayout: 110,
    estimatedTimeMinutes: 32,
    searchRadiusKm: 3.5,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 240000).toISOString(),
    itemsCount: 4
  }
];

// Initial Seed Orders
export const INITIAL_ORDERS: Order[] = [
  {
    _id: 'order_live_01',
    orderNumber: 'GF-94821',
    restaurantId: 'rest_dehradun_01',
    restaurantName: 'Doon Bistro & Craft Kitchen',
    customerId: 'user_cust_01',
    customerName: 'Aarav Sharma',
    customerPhone: '+919876543210',
    orderType: 'DELIVERY',
    orderStatus: 'PREPARING',
    paymentStatus: 'PAID',
    paymentMethod: 'UPI',
    deliveryOtp: '4829',
    items: [
      {
        menuItemId: 'rest_dehradun_01_item_9',
        name: 'Dal Bukhara Slow Simmer 24hr',
        quantity: 1,
        unitPrice: 380,
        totalPrice: 380
      },
      {
        menuItemId: 'rest_dehradun_01_item_11',
        name: 'Kumaoni Pahadi Mutton Curry',
        quantity: 1,
        unitPrice: 520,
        totalPrice: 520
      },
      {
        menuItemId: 'rest_dehradun_01_item_19',
        name: 'Garlic Butter Chur Chur Naan',
        quantity: 2,
        unitPrice: 110,
        totalPrice: 220
      }
    ],
    subtotal: 1120,
    deliveryFee: 47,
    packagingFee: 20,
    platformFee: 10,
    gstAmount: 66,
    tip: 30,
    discountAmount: 100,
    totalAmount: 1193,
    deliveryAddress: {
      addressLine1: 'Flat 402, Pine Crest Apartments',
      addressLine2: 'Near Silver City Mall',
      locality: 'Rajpur Road',
      city: 'Dehradun',
      postalCode: '248001'
    },
    whatsappOptIn: true,
    estimatedDeliveryTime: '35 mins',
    assignedRider: {
      id: 'rider_01',
      name: 'Rajesh Kumar',
      phone: '+919822334455',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      vehicleType: 'BIKE',
      vehicleNumber: 'UK 07 AF 4821',
      rating: 4.9,
      totalTrips: 482,
      etaMinutes: 18,
      currentLocation: { lat: 30.3340, lng: 78.0580 }
    },
    timeline: [
      { status: 'PLACED', timestamp: '2026-09-29T04:30:00Z', title: 'Order Placed', description: 'Order verified and sent to restaurant' },
      { status: 'CONFIRMED', timestamp: '2026-09-29T04:31:00Z', title: 'Confirmed by Kitchen', description: 'Doon Bistro accepted your order' },
      { status: 'PREPARING', timestamp: '2026-09-29T04:33:00Z', title: 'Cooking in Progress', description: 'Chefs are slow-cooking your dishes' }
    ],
    createdAt: new Date(Date.now() - 900000).toISOString()
  },
  {
    _id: 'order_prev_02',
    orderNumber: 'GF-93108',
    restaurantId: 'rest_dehradun_01',
    restaurantName: 'Doon Bistro & Craft Kitchen',
    customerId: 'user_cust_01',
    customerName: 'Aarav Sharma',
    customerPhone: '+919876543210',
    orderType: 'DELIVERY',
    orderStatus: 'DELIVERED',
    paymentStatus: 'PAID',
    paymentMethod: 'UPI',
    items: [
      {
        menuItemId: 'rest_dehradun_01_item_1',
        name: 'Charcoal Paneer Tikka Angara',
        quantity: 1,
        unitPrice: 320,
        totalPrice: 320
      },
      {
        menuItemId: 'rest_dehradun_01_item_17',
        name: 'Awadhi Gosht Dum Biryani',
        quantity: 1,
        unitPrice: 480,
        totalPrice: 480
      }
    ],
    subtotal: 800,
    deliveryFee: 35,
    packagingFee: 20,
    platformFee: 10,
    gstAmount: 48,
    tip: 20,
    discountAmount: 50,
    totalAmount: 883,
    deliveryAddress: {
      addressLine1: 'Flat 402, Pine Crest Apartments',
      locality: 'Rajpur Road',
      city: 'Dehradun',
      postalCode: '248001'
    },
    whatsappOptIn: true,
    assignedRider: {
      id: 'rider_01',
      name: 'Rajesh Kumar',
      phone: '+919822334455',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      vehicleType: 'BIKE',
      vehicleNumber: 'UK 07 AF 4821',
      rating: 4.9,
      totalTrips: 482
    },
    timeline: [
      { status: 'PLACED', timestamp: '2026-09-28T19:00:00Z', title: 'Placed', description: 'Order placed' },
      { status: 'CONFIRMED', timestamp: '2026-09-28T19:02:00Z', title: 'Confirmed', description: 'Kitchen confirmed' },
      { status: 'PREPARING', timestamp: '2026-09-28T19:05:00Z', title: 'Preparing', description: 'In the kitchen' },
      { status: 'READY_FOR_PICKUP', timestamp: '2026-09-28T19:25:00Z', title: 'Ready', description: 'Packed & ready' },
      { status: 'OUT_FOR_DELIVERY', timestamp: '2026-09-28T19:30:00Z', title: 'Out for delivery', description: 'Rider on the way' },
      { status: 'DELIVERED', timestamp: '2026-09-28T19:50:00Z', title: 'Delivered', description: 'Order handed over safely' }
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

// Initial Reservations
export const INITIAL_RESERVATIONS: Reservation[] = [
  {
    _id: 'res_01',
    restaurantId: 'rest_dehradun_01',
    restaurantName: 'Doon Bistro & Craft Kitchen',
    customerId: 'user_cust_01',
    customerName: 'Aarav Sharma',
    customerPhone: '+919876543210',
    tableId: 'tbl_01',
    tableNumber: 'Table T-04 (Valley View Terrace)',
    guestCount: 4,
    reservationDate: '2026-10-02',
    timeSlot: '08:30 PM',
    durationMinutes: 120,
    status: 'CONFIRMED',
    depositAmount: 500,
    qrCodeToken: 'GF-RES-QR-94821-DOON',
    whatsappOptIn: true,
    specialRequests: 'Window/terrace seating for anniversary dinner celebration.',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];

// Initial Admin KYC Applications
export const INITIAL_APPLICATIONS: AdminKYCApplication[] = [
  {
    _id: 'app_01',
    restaurantName: 'Saffron Courtyard & Grill',
    ownerName: 'Sunil Bhatia',
    ownerEmail: 'sunil@saffroncourtyard.in',
    ownerPhone: '+919822114477',
    city: 'Dehradun',
    address: '88, Mussoorie Diversion Road, Malsi, Dehradun 248003',
    fssaiLicenseNumber: '10022013000849',
    gstinNumber: '05AABCS8842P1Z4',
    operatingMode: 'HYBRID',
    status: 'PENDING',
    submittedAt: '2026-09-28T11:20:00Z',
    documents: {
      fssaiCertificate: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400',
      gstinCertificate: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=400',
      kitchenHygieneProof: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400'
    }
  },
  {
    _id: 'app_02',
    restaurantName: 'Doon Cloud Patisserie',
    ownerName: 'Ananya Rawat',
    ownerEmail: 'ananya@dooncloud.com',
    ownerPhone: '+919833881122',
    city: 'Dehradun',
    address: '14, EC Road, Dehradun 248001',
    fssaiLicenseNumber: '10022013000951',
    gstinNumber: '05AACDR9182M1Z8',
    operatingMode: 'DELIVERY_ONLY',
    status: 'CHANGES_REQUESTED',
    adminNotes: 'Please re-upload kitchen hygiene certificate with valid water testing laboratory report.',
    submittedAt: '2026-09-27T15:45:00Z',
    documents: {
      fssaiCertificate: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400',
      gstinCertificate: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=400',
      kitchenHygieneProof: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400'
    }
  }
];

// Initial Audit Logs
export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    _id: 'log_01',
    action: 'MERCHANT_VERIFICATION_APPROVED',
    performedBy: 'admin@gourmetfleet.com',
    userRole: 'admin',
    targetId: 'rest_dehradun_01',
    targetType: 'Restaurant',
    details: 'Verified FSSAI license 10022013000849 and approved 10% commission rate.',
    timestamp: '2026-09-28T09:15:00Z',
    status: 'SUCCESS'
  },
  {
    _id: 'log_02',
    action: 'ORDER_RIDER_ASSIGNED',
    performedBy: 'SYSTEM_AUTODISPATCH',
    userRole: 'admin',
    targetId: 'order_live_01',
    targetType: 'Order',
    details: 'Assigned rider Rajesh Kumar within 1.2 km radius.',
    timestamp: '2026-09-29T04:32:00Z',
    status: 'SUCCESS'
  },
  {
    _id: 'log_03',
    action: 'COMMISSION_RATE_UPDATED',
    performedBy: 'admin@gourmetfleet.com',
    userRole: 'admin',
    targetId: 'rest_delhi-ncr_01',
    targetType: 'Restaurant',
    details: 'Adjusted partner commission from 12% to 10% on high GMV tier.',
    timestamp: '2026-09-27T14:10:00Z',
    status: 'WARNING'
  }
];

// Initial Reviews
export const INITIAL_REVIEWS: Review[] = [
  {
    _id: 'rev_01',
    restaurantId: 'rest_dehradun_01',
    userId: { _id: 'user_cust_02', fullName: 'Meera Sen', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100' },
    foodRating: 5,
    deliveryRating: 5,
    packagingRating: 5,
    rating: 5,
    comment: 'The Kumaoni Pahadi Mutton was utterly sensational! Rich flavours, claypot aroma, and arrived scorching hot with zero spills in spill-proof packaging.',
    isVerifiedDiner: true,
    ownerResponse: 'Thank you Meera! Our chef sources the herbs directly from mountain farms. Looking forward to serving you again!',
    createdAt: '2026-09-26T20:15:00Z'
  },
  {
    _id: 'rev_02',
    restaurantId: 'rest_dehradun_01',
    userId: { _id: 'user_cust_03', fullName: 'Rohan Mehra', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100' },
    foodRating: 4.5,
    deliveryRating: 4.8,
    packagingRating: 4.5,
    rating: 4.6,
    comment: 'Dal Bukhara here genuinely rivals ITC Bukhara. Slow-cooked creamy perfection, pairs divinely with the Garlic Chur Chur Naan.',
    isVerifiedDiner: true,
    createdAt: '2026-09-27T21:40:00Z'
  }
];

// Storage Keys
const MOCK_STORAGE_KEY = 'gourmetfleet_mock_database_v2';

interface MockDatabaseState {
  restaurants: Restaurant[];
  menuItems: MenuItem[];
  orders: Order[];
  reservations: Reservation[];
  events: CulinaryEvent[];
  promotions: Promotion[];
  riders: DeliveryPartner[];
  deliveryRequests: DeliveryRequest[];
  applications: AdminKYCApplication[];
  auditLogs: AuditLog[];
  reviews: Review[];
  favorites: { restaurantIds: string[]; dishIds: string[] };
}

// Singleton state with LocalStorage caching
let mockDb: MockDatabaseState | null = null;

export function getMockDatabase(): MockDatabaseState {
  if (mockDb) return mockDb;

  try {
    const raw = localStorage.getItem(MOCK_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.restaurants && parsed.restaurants.length >= 100) {
        mockDb = parsed;
        return mockDb!;
      }
    }
  } catch (err) {
    console.warn('Failed to parse cached mock database', err);
  }

  // Initialize fresh 100-restaurant dataset
  const { restaurants, menuItems } = generateInitialRestaurants();

  mockDb = {
    restaurants,
    menuItems,
    orders: INITIAL_ORDERS,
    reservations: INITIAL_RESERVATIONS,
    events: INITIAL_EVENTS,
    promotions: INITIAL_PROMOTIONS,
    riders: INITIAL_RIDERS,
    deliveryRequests: INITIAL_DELIVERY_REQUESTS,
    applications: INITIAL_APPLICATIONS,
    auditLogs: INITIAL_AUDIT_LOGS,
    reviews: INITIAL_REVIEWS,
    favorites: {
      restaurantIds: ['rest_dehradun_01', 'rest_delhi-ncr_01'],
      dishIds: ['rest_dehradun_01_item_9', 'rest_dehradun_01_item_11']
    }
  };

  saveMockDatabase(mockDb);
  return mockDb;
}

export function saveMockDatabase(data: MockDatabaseState): void {
  mockDb = data;
  try {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('LocalStorage save error (likely size quota, keeping in memory)', err);
  }
}

export function resetMockDatabase(): MockDatabaseState {
  localStorage.removeItem(MOCK_STORAGE_KEY);
  mockDb = null;
  return getMockDatabase();
}
