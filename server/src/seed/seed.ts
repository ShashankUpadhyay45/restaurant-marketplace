import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Restaurant } from '../models/Restaurant.js';
import { MenuItem } from '../models/MenuItem.js';
import { Table } from '../models/Table.js';
import { Order } from '../models/Order.js';
import { Reservation } from '../models/Reservation.js';
import { Review } from '../models/Review.js';
import { LoyaltyLedger } from '../models/LoyaltyLedger.js';

dotenv.config();

export async function runSeed(shouldDisconnect = true): Promise<void> {
  let uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gourmetfleet';
  let memoryServer: any = null;

  if (mongoose.connection.readyState === 0) {
    console.log(`[Seed Script] Attempting connection to ${uri}...`);
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 });
      console.log(`[Seed Script] Successfully connected to live MongoDB at ${uri}`);
    } catch (connErr) {
      console.warn('\n======================================================================');
      console.warn('⚠️  NOTICE: Local MongoDB is not running on 127.0.0.1:27017');
      console.warn('🚀 Automatically launching Embedded In-Memory MongoDB for seeding...');
      console.warn('======================================================================\n');

      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      uri = memoryServer.getUri();
      await mongoose.connect(uri);
      console.log(`[Seed Script] Connected to In-Memory MongoDB at ${uri}`);
    }
  }

  console.log('[Seed Script] Clearing previous collections...');
  await Promise.all([
    User.deleteMany({}),
    Restaurant.deleteMany({}),
    MenuItem.deleteMany({}),
    Table.deleteMany({}),
    Order.deleteMany({}),
    Reservation.deleteMany({}),
    Review.deleteMany({}),
    LoyaltyLedger.deleteMany({})
  ]);

  console.log('[Seed Script] Creating test users with Indian profiles...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Password123!', salt);

  // 1. Superadmin
  await User.create({
    email: 'admin@gourmetfleet.com',
    passwordHash,
    fullName: 'Alexander Vance (Superadmin)',
    phone: '+919810012345',
    role: 'admin',
    verificationStatus: 'VERIFIED',
    loyaltyPointsBalance: 5000,
    membershipTier: 'GOLD'
  });

  // 2. Restaurant Owners
  const ownerDoonBistro = await User.create({
    email: 'vikram@doonbistro.com',
    passwordHash,
    fullName: 'Chef Vikramaditya Rawat',
    phone: '+919837011223',
    role: 'restaurant_owner',
    verificationStatus: 'VERIFIED',
    loyaltyPointsBalance: 1200,
    membershipTier: 'GOLD'
  });

  const ownerMussoorieGrill = await User.create({
    email: 'rajesh@mussooriegrill.com',
    passwordHash,
    fullName: 'Chef Rajesh Negi',
    phone: '+919837144556',
    role: 'restaurant_owner',
    verificationStatus: 'VERIFIED',
    loyaltyPointsBalance: 850,
    membershipTier: 'SILVER'
  });

  const ownerBukhara = await User.create({
    email: 'harpal@bukharadarbar.com',
    passwordHash,
    fullName: 'Ustad Harpal Singh Bedi',
    phone: '+919811033445',
    role: 'restaurant_owner',
    verificationStatus: 'VERIFIED',
    loyaltyPointsBalance: 1500,
    membershipTier: 'GOLD'
  });

  const ownerHauzKhas = await User.create({
    email: 'aisha@hauzkhascafe.com',
    passwordHash,
    fullName: 'Chef Aisha Sen',
    phone: '+919811255667',
    role: 'restaurant_owner',
    verificationStatus: 'VERIFIED',
    loyaltyPointsBalance: 600,
    membershipTier: 'SILVER'
  });

  const ownerIndiranagar = await User.create({
    email: 'rohan@indiranagarkitchen.com',
    passwordHash,
    fullName: 'Rohan Somanna (Cloud Kitchen Lead)',
    phone: '+919880177889',
    role: 'restaurant_owner',
    verificationStatus: 'VERIFIED',
    loyaltyPointsBalance: 450,
    membershipTier: 'BRONZE'
  });

  const ownerBandraTrattoria = await User.create({
    email: 'antonio@bandraseaside.com',
    passwordHash,
    fullName: 'Chef Antonio Fernandes',
    phone: '+919820066778',
    role: 'restaurant_owner',
    verificationStatus: 'VERIFIED',
    loyaltyPointsBalance: 1100,
    membershipTier: 'GOLD'
  });

  // 3. Customers
  const customer1 = await User.create({
    email: 'customer@gourmetfleet.com',
    passwordHash,
    fullName: 'Aarav Sharma',
    phone: '+919876543210',
    role: 'customer',
    verificationStatus: 'VERIFIED',
    loyaltyPointsBalance: 1450,
    membershipTier: 'SILVER',
    savedAddresses: [
      {
        label: 'Home (Rajpur Road)',
        addressLine1: 'Apartment 4B, Silver Oak Residency',
        locality: 'Rajpur Road',
        city: 'Dehradun',
        state: 'Uttarakhand',
        postalCode: '248001',
        country: 'India',
        street: 'Apartment 4B, Silver Oak Residency, Rajpur Road',
        location: { lat: 30.3340, lng: 78.0580 }
      },
      {
        label: 'Work (Jakhan)',
        addressLine1: 'Tower 2, IT Corridor, Pacific Hills',
        locality: 'Jakhan',
        city: 'Dehradun',
        state: 'Uttarakhand',
        postalCode: '248001',
        country: 'India',
        street: 'Tower 2, IT Corridor, Pacific Hills, Jakhan',
        location: { lat: 30.3620, lng: 78.0720 }
      }
    ]
  });

  const customer2 = await User.create({
    email: 'ananya@gourmetfleet.com',
    passwordHash,
    fullName: 'Ananya Iyer',
    phone: '+919845012345',
    role: 'customer',
    verificationStatus: 'VERIFIED',
    loyaltyPointsBalance: 820,
    membershipTier: 'BRONZE',
    savedAddresses: [
      {
        label: 'Home (Indiranagar)',
        addressLine1: 'Villa 12, 12th Main Road',
        locality: 'Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560038',
        country: 'India',
        street: 'Villa 12, 12th Main Road, Indiranagar',
        location: { lat: 12.9784, lng: 77.6408 }
      }
    ]
  });

  console.log('[Seed Script] Creating authentic Indian multi-city restaurants...');

  // 1. Dehradun - The Great Doon Bistro & Artisanal Bakery (HYBRID)
  const doonBistro = await Restaurant.create({
    name: 'The Great Doon Bistro & Artisanal Bakery',
    slug: 'the-great-doon-bistro',
    ownerId: ownerDoonBistro._id,
    operatingMode: 'HYBRID',
    cuisineTypes: ['Bakery & Cafe', 'Continental', 'North Indian', 'Pahari & Garhwali'],
    description: 'Dehradun’s acclaimed heritage bistro blending slow-fermented sourdoughs, mountain orchard honey pastries, Kashmiri gucchi risotto, and specialty pour-overs.',
    heroImage: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80',
    logoImage: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=200&q=80',
    address: {
      addressLine1: '32 Rajpur Road, Near Silver City',
      locality: 'Rajpur Road',
      city: 'Dehradun',
      state: 'Uttarakhand',
      postalCode: '248001',
      country: 'India',
      street: '32 Rajpur Road, Near Silver City',
      coordinates: { latitude: 30.3340, longitude: 78.0580 }
    },
    location: {
      type: 'Point',
      coordinates: [78.0580, 30.3340]
    },
    maxDeliveryRadiusKm: 12,
    deliveryZones: [
      { maxDistanceKm: 3, deliveryFee: 35, minOrderAmount: 199 },
      { maxDistanceKm: 8, deliveryFee: 65, minOrderAmount: 349 },
      { maxDistanceKm: 12, deliveryFee: 95, minOrderAmount: 499 }
    ],
    businessHours: [0, 1, 2, 3, 4, 5, 6].map(day => ({
      day,
      open: '08:30',
      close: '23:00',
      isClosed: false
    })),
    fssaiLicenseNumber: 'FSSAI-12623999000188',
    gstinNumber: '05AABCG9876K1Z3',
    commissionRate: 9.5,
    averageRating: 4.9,
    totalReviews: 184,
    isActive: true,
    verificationStatus: 'APPROVED'
  });
  ownerDoonBistro.restaurantId = doonBistro._id as any;
  await ownerDoonBistro.save();

  // 2. Dehradun - Mussoorie Foothills Grill & Kebabs (HYBRID)
  const mussoorieGrill = await Restaurant.create({
    name: 'Mussoorie Foothills Grill & Kebabs',
    slug: 'mussoorie-foothills-grill',
    ownerId: ownerMussoorieGrill._id,
    operatingMode: 'HYBRID',
    cuisineTypes: ['North Indian', 'Mughlai', 'Barbecue', 'Tibetan & Momos'],
    description: 'Charcoal-fired sigdi grills, melt-in-mouth Galouti kebabs, slow-simmered dal makhani, and Himalayan steamed momos with spicy bhang ki chutney.',
    heroImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    logoImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80',
    address: {
      addressLine1: 'Pacific Hills Arcade, Jakhan',
      locality: 'Jakhan',
      city: 'Dehradun',
      state: 'Uttarakhand',
      postalCode: '248001',
      country: 'India',
      street: 'Pacific Hills Arcade, Jakhan',
      coordinates: { latitude: 30.3620, longitude: 78.0720 }
    },
    location: {
      type: 'Point',
      coordinates: [78.0720, 30.3620]
    },
    maxDeliveryRadiusKm: 15,
    deliveryZones: [
      { maxDistanceKm: 4, deliveryFee: 35, minOrderAmount: 250 },
      { maxDistanceKm: 10, deliveryFee: 70, minOrderAmount: 400 },
      { maxDistanceKm: 15, deliveryFee: 110, minOrderAmount: 600 }
    ],
    businessHours: [0, 1, 2, 3, 4, 5, 6].map(day => ({
      day,
      open: '12:00',
      close: '23:30',
      isClosed: false
    })),
    fssaiLicenseNumber: 'FSSAI-12624001000342',
    gstinNumber: '05AABCM1122D1Z8',
    commissionRate: 10.0,
    averageRating: 4.8,
    totalReviews: 215,
    isActive: true,
    verificationStatus: 'APPROVED'
  });
  ownerMussoorieGrill.restaurantId = mussoorieGrill._id as any;
  await ownerMussoorieGrill.save();

  // 3. Delhi NCR - Bukhara Heritage Darbar (DINING_ONLY)
  const bukhara = await Restaurant.create({
    name: 'Bukhara Heritage Darbar',
    slug: 'bukhara-heritage-darbar',
    ownerId: ownerBukhara._id,
    operatingMode: 'DINING_ONLY',
    cuisineTypes: ['North Indian', 'Mughlai', 'Awadhi', 'Biryani'],
    description: 'Iconic North-West Frontier gastronomy featuring legendary 24-hour Dal Bukhara, clay tandoor Sikandari Raan, and hand-embroidered royal dining booths.',
    heroImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    logoImage: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=200&q=80',
    address: {
      addressLine1: 'Block B, Inner Circle, Connaught Place',
      locality: 'Connaught Place',
      city: 'Delhi NCR',
      state: 'Delhi',
      postalCode: '110001',
      country: 'India',
      street: 'Block B, Inner Circle, Connaught Place',
      coordinates: { latitude: 28.6315, longitude: 77.2167 }
    },
    location: {
      type: 'Point',
      coordinates: [77.2167, 28.6315]
    },
    maxDeliveryRadiusKm: 8,
    deliveryZones: [
      { maxDistanceKm: 8, deliveryFee: 50, minOrderAmount: 800 }
    ],
    businessHours: [0, 1, 2, 3, 4, 5, 6].map(day => ({
      day,
      open: '19:00',
      close: '23:45',
      isClosed: false
    })),
    fssaiLicenseNumber: 'FSSAI-10014011001889',
    gstinNumber: '07AAACB1987F1Z5',
    commissionRate: 8.5,
    averageRating: 4.95,
    totalReviews: 480,
    isActive: true,
    verificationStatus: 'APPROVED'
  });
  ownerBukhara.restaurantId = bukhara._id as any;
  await ownerBukhara.save();

  // 4. Delhi NCR - Hauz Khas Social & Craft Kitchen (HYBRID)
  const hauzKhas = await Restaurant.create({
    name: 'Hauz Khas Social & Craft Kitchen',
    slug: 'hauz-khas-social-kitchen',
    ownerId: ownerHauzKhas._id,
    operatingMode: 'HYBRID',
    cuisineTypes: ['Continental', 'Italian', 'Indo-Chinese', 'Street Food'],
    description: 'Vibrant lakeside space serving artisanal wood-fired pizzas, quirky desi-continental combos, craft mocktails, and decadent dessert platters.',
    heroImage: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1200&q=80',
    logoImage: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=200&q=80',
    address: {
      addressLine1: '9A & 12, Hauz Khas Village',
      locality: 'Hauz Khas',
      city: 'Delhi NCR',
      state: 'Delhi',
      postalCode: '110016',
      country: 'India',
      street: '9A & 12, Hauz Khas Village',
      coordinates: { latitude: 28.5494, longitude: 77.2001 }
    },
    location: {
      type: 'Point',
      coordinates: [77.2001, 28.5494]
    },
    maxDeliveryRadiusKm: 14,
    deliveryZones: [
      { maxDistanceKm: 5, deliveryFee: 40, minOrderAmount: 299 },
      { maxDistanceKm: 14, deliveryFee: 85, minOrderAmount: 499 }
    ],
    businessHours: [0, 1, 2, 3, 4, 5, 6].map(day => ({
      day,
      open: '11:00',
      close: '00:00',
      isClosed: false
    })),
    fssaiLicenseNumber: 'FSSAI-10019011006543',
    gstinNumber: '07AAASH4433E1Z2',
    commissionRate: 10.0,
    averageRating: 4.7,
    totalReviews: 320,
    isActive: true,
    verificationStatus: 'APPROVED'
  });
  ownerHauzKhas.restaurantId = hauzKhas._id as any;
  await ownerHauzKhas.save();

  // 5. Bengaluru - Indiranagar Craft Micro-Kitchen (DELIVERY_ONLY)
  const indiranagarKitchen = await Restaurant.create({
    name: 'Indiranagar Craft Micro-Kitchen',
    slug: 'indiranagar-craft-kitchen',
    ownerId: ownerIndiranagar._id,
    operatingMode: 'DELIVERY_ONLY',
    cuisineTypes: ['South Indian', 'Biryani', 'Modern Indian', 'Healthy Bowls'],
    description: 'High-efficiency chef cloud kitchen delivering slow-cooked Thalassery biryanis, Kundapura ghee roasts, millet bowls, and Coorg filter coffee treats.',
    heroImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
    logoImage: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=200&q=80',
    address: {
      addressLine1: 'Plot 742, 100 Feet Road, HAL 2nd Stage',
      locality: 'Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
      country: 'India',
      street: 'Plot 742, 100 Feet Road, Indiranagar',
      coordinates: { latitude: 12.9784, longitude: 77.6408 }
    },
    location: {
      type: 'Point',
      coordinates: [77.6408, 12.9784]
    },
    maxDeliveryRadiusKm: 12,
    deliveryZones: [
      { maxDistanceKm: 4, deliveryFee: 35, minOrderAmount: 199 },
      { maxDistanceKm: 12, deliveryFee: 75, minOrderAmount: 399 }
    ],
    businessHours: [0, 1, 2, 3, 4, 5, 6].map(day => ({
      day,
      open: '11:00',
      close: '02:00',
      isClosed: false
    })),
    fssaiLicenseNumber: 'FSSAI-11221334000876',
    gstinNumber: '29AABCI8899P1ZK',
    commissionRate: 9.0,
    averageRating: 4.85,
    totalReviews: 198,
    isActive: true,
    verificationStatus: 'APPROVED'
  });
  ownerIndiranagar.restaurantId = indiranagarKitchen._id as any;
  await ownerIndiranagar.save();

  // 6. Mumbai - Bandra Seaside Trattoria & Coastal Co. (HYBRID)
  const bandraTrattoria = await Restaurant.create({
    name: 'Bandra Seaside Trattoria & Coastal Co.',
    slug: 'bandra-seaside-trattoria',
    ownerId: ownerBandraTrattoria._id,
    operatingMode: 'HYBRID',
    cuisineTypes: ['Coastal Seafood', 'Italian', 'Mediterranean', 'Desserts'],
    description: 'Breezy seaside dining celebrating coastal Konkan seafood, hand-rolled pasta, wood-fired sourdough pizzas, and Sicilian lemon cannolis.',
    heroImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    logoImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=200&q=80',
    address: {
      addressLine1: 'Carter Road Promenade, Bandra West',
      locality: 'Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400050',
      country: 'India',
      street: 'Carter Road Promenade, Bandra West',
      coordinates: { latitude: 19.0596, longitude: 72.8300 }
    },
    location: {
      type: 'Point',
      coordinates: [72.8300, 19.0596]
    },
    maxDeliveryRadiusKm: 15,
    deliveryZones: [
      { maxDistanceKm: 5, deliveryFee: 45, minOrderAmount: 350 },
      { maxDistanceKm: 15, deliveryFee: 95, minOrderAmount: 600 }
    ],
    businessHours: [0, 1, 2, 3, 4, 5, 6].map(day => ({
      day,
      open: '12:00',
      close: '23:30',
      isClosed: false
    })),
    fssaiLicenseNumber: 'FSSAI-11523998000124',
    gstinNumber: '27AABCL1234F1Z9',
    commissionRate: 9.5,
    averageRating: 4.9,
    totalReviews: 240,
    isActive: true,
    verificationStatus: 'APPROVED'
  });
  ownerBandraTrattoria.restaurantId = bandraTrattoria._id as any;
  await ownerBandraTrattoria.save();

  console.log('[Seed Script] Seeding culinary menus with authentic INR pricing...');

  // Menu: The Great Doon Bistro & Bakery
  const itemDoon1 = await MenuItem.create({
    restaurantId: doonBistro._id,
    category: 'Breakfast & Breads',
    name: 'Himalayan Walnut Sourdough Toast & Avocado',
    description: 'Naturally leavened sourdough topped with crushed Hass avocado, Doon valley walnut crumble, feta, and extra virgin olive oil.',
    basePrice: 280,
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
    dietaryTags: ['VEG', 'CHEF_SPECIAL'],
    variants: [
      { name: 'Standard Sourdough', priceDelta: 0 },
      { name: 'Multigrain Mountain Flour', priceDelta: 40 }
    ],
    modifierGroups: [
      {
        name: 'Extra Toppings',
        minSelection: 0,
        maxSelection: 2,
        options: [
          { name: 'Poached Organic Farm Egg', price: 60 },
          { name: 'Smoked Himalayan Trout', price: 140 }
        ]
      }
    ],
    isAvailable: true,
    preparationTimeMinutes: 15
  });

  const itemDoon2 = await MenuItem.create({
    restaurantId: doonBistro._id,
    category: 'Mains',
    name: 'Pahari Jhol Chicken with Bhature',
    description: 'Rustic Garhwali country chicken simmered in coriander root, jakhiya seeds, and roasted mountain spices, served with fluffy artisanal bhature.',
    basePrice: 420,
    imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80',
    dietaryTags: ['NON_VEG', 'CHEF_SPECIAL'],
    variants: [
      { name: 'Regular Portion', priceDelta: 0 },
      { name: 'Sharing Platter (Feeds 2)', priceDelta: 220 }
    ],
    modifierGroups: [],
    isAvailable: true,
    preparationTimeMinutes: 25
  });

  const itemDoon3 = await MenuItem.create({
    restaurantId: doonBistro._id,
    category: 'Mains',
    name: 'Kashmiri Morel (Gucchi) Wild Mushroom Risotto',
    description: 'Arborio rice cooked slowly in vegetable bouillon, wild forest gucchi mushrooms, parmesan crisps, and white truffle essence.',
    basePrice: 550,
    imageUrl: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=600&q=80',
    dietaryTags: ['VEG', 'CHEF_SPECIAL'],
    variants: [],
    modifierGroups: [],
    isAvailable: true,
    preparationTimeMinutes: 22
  });

  const itemDoon4 = await MenuItem.create({
    restaurantId: doonBistro._id,
    category: 'Desserts & Coffee',
    name: 'Old Dehradun Butter Croissant & Hot Chocolate',
    description: 'Golden, 72-layered pure French butter croissant paired with rich 55% single-origin dark hot cocoa.',
    basePrice: 240,
    imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
    dietaryTags: ['VEG'],
    variants: [],
    modifierGroups: [],
    isAvailable: true,
    preparationTimeMinutes: 10
  });

  // Menu: Mussoorie Foothills Grill
  const itemGrill1 = await MenuItem.create({
    restaurantId: mussoorieGrill._id,
    category: 'Kebabs & Starters',
    name: 'Melt-in-Mouth Galouti Kebab with Sheermal',
    description: 'Smoked minced lamb infused with 32 fragrant potli spices, finished on a Mahi tawa and accompanied by saffron-infused mini sheermal.',
    basePrice: 440,
    imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80',
    dietaryTags: ['NON_VEG', 'CHEF_SPECIAL'],
    variants: [
      { name: '4 Pieces', priceDelta: 0 },
      { name: '8 Pieces Grand Platter', priceDelta: 360 }
    ],
    modifierGroups: [],
    isAvailable: true,
    preparationTimeMinutes: 20
  });

  const itemGrill2 = await MenuItem.create({
    restaurantId: mussoorieGrill._id,
    category: 'Mains',
    name: 'Daryaganj Style Velvet Butter Chicken',
    description: 'Tandoor-charred boneless chicken tikka cooked in a velvety tomato makhani reduction finished with fresh churned white butter.',
    basePrice: 460,
    imageUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80',
    dietaryTags: ['NON_VEG', 'HALAL'],
    variants: [],
    modifierGroups: [],
    isAvailable: true,
    preparationTimeMinutes: 22
  });

  const itemGrill3 = await MenuItem.create({
    restaurantId: mussoorieGrill._id,
    category: 'Kebabs & Starters',
    name: 'Steamed Pahari Mutton Momos (8 pcs)',
    description: 'Juicy mountain lamb dumplings wrapped in delicate dough, served with fiery garlic bhang chutney and clear bone broth.',
    basePrice: 290,
    imageUrl: 'https://images.unsplash.com/photo-1625398407796-82650a8c135f?auto=format&fit=crop&w=600&q=80',
    dietaryTags: ['NON_VEG'],
    variants: [],
    modifierGroups: [],
    isAvailable: true,
    preparationTimeMinutes: 15
  });

  const itemGrill4 = await MenuItem.create({
    restaurantId: mussoorieGrill._id,
    category: 'Mains',
    name: 'Dal Makhani (Slow-Cooked 24 Hours)',
    description: 'Black urad lentils simmered overnight over slow charcoal embers with vine tomatoes, garlic, and homemade dairy cream.',
    basePrice: 320,
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
    dietaryTags: ['VEG'],
    variants: [],
    modifierGroups: [],
    isAvailable: true,
    preparationTimeMinutes: 12
  });

  // Menu: Bukhara Heritage Darbar
  await MenuItem.create({
    restaurantId: bukhara._id,
    category: 'Signature Tandoor',
    name: 'Sikandari Raan (Royal Whole Lamb Roast)',
    description: 'Tender baby leg of spring lamb marinated in malt vinegar, cinnamon, black cumin, and broiled in a custom clay pit tandoor.',
    basePrice: 1450,
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    dietaryTags: ['NON_VEG', 'CHEF_SPECIAL'],
    variants: [],
    modifierGroups: [],
    isAvailable: true,
    preparationTimeMinutes: 45
  });

  await MenuItem.create({
    restaurantId: bukhara._id,
    category: 'Signature Tandoor',
    name: 'Bukhara Dal Dum Pukht',
    description: 'The world-famous signature lentil preparation simmered over low fire for a full 24 hours. Silky, deeply flavorful, and unhurried.',
    basePrice: 520,
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
    dietaryTags: ['VEG'],
    variants: [],
    modifierGroups: [],
    isAvailable: true,
    preparationTimeMinutes: 15
  });

  // Menu: Indiranagar Craft Micro-Kitchen
  await MenuItem.create({
    restaurantId: indiranagarKitchen._id,
    category: 'Specialty Bowls',
    name: 'Kundapura Ghee Roast Mutton Bowl',
    description: 'Tender goat chunks braised in pure Byadagi chilli ghee paste, paired with hot coin Malabar parottas and pickled shallots.',
    basePrice: 390,
    imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80',
    dietaryTags: ['NON_VEG', 'CHEF_SPECIAL'],
    variants: [],
    modifierGroups: [],
    isAvailable: true,
    preparationTimeMinutes: 18
  });

  await MenuItem.create({
    restaurantId: indiranagarKitchen._id,
    category: 'Biryani & Rice',
    name: 'Thalassery Jeerakasala Chicken Biryani',
    description: 'Fragrant short-grain Kaima rice cooked with Malabar country chicken, fried cashews, golden raisins, and rich country ghee.',
    basePrice: 340,
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
    dietaryTags: ['NON_VEG', 'HALAL'],
    variants: [],
    modifierGroups: [],
    isAvailable: true,
    preparationTimeMinutes: 15
  });

  // Menu: Bandra Seaside Trattoria
  await MenuItem.create({
    restaurantId: bandraTrattoria._id,
    category: 'Pastas & Mains',
    name: 'Mangalorean Prawn Ghee Roast Linguine',
    description: 'Coastal seafood meets Italian pasta: Tiger prawns tossed in spicy roasted masala, finished with fresh lime zest and garlic linguine.',
    basePrice: 560,
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
    dietaryTags: ['NON_VEG', 'CHEF_SPECIAL'],
    variants: [],
    modifierGroups: [],
    isAvailable: true,
    preparationTimeMinutes: 20
  });

  console.log('[Seed Script] Creating dining tables...');
  const table1 = await Table.create({
    restaurantId: doonBistro._id,
    tableNumber: 'B1',
    capacity: 2,
    zone: 'TERRACE',
    minPartySize: 1,
    isActive: true
  });

  const table2 = await Table.create({
    restaurantId: doonBistro._id,
    tableNumber: 'B2',
    capacity: 4,
    zone: 'INDOOR',
    minPartySize: 2,
    isActive: true
  });

  const tableBukhara1 = await Table.create({
    restaurantId: bukhara._id,
    tableNumber: 'VIP-01',
    capacity: 6,
    zone: 'VIP_BOOTH',
    minPartySize: 4,
    isActive: true
  });

  console.log('[Seed Script] Creating completed orders in INR...');
  const order1 = await Order.create({
    orderNumber: 'GF-IN-2026-001',
    restaurantId: doonBistro._id,
    customerId: customer1._id,
    orderType: 'DELIVERY',
    items: [
      {
        menuItemId: itemDoon1._id,
        name: itemDoon1.name,
        quantity: 2,
        unitPrice: 280,
        totalPrice: 560
      },
      {
        menuItemId: itemDoon2._id,
        name: itemDoon2.name,
        quantity: 1,
        unitPrice: 420,
        totalPrice: 420
      }
    ],
    subtotal: 980,
    deliveryFee: 47, // 35 base + 1 km * 12
    packagingFee: 20,
    platformFee: 10,
    gstAmount: 59.26, // 5% on 980 (49) + 18% on 57 (10.26)
    tip: 50,
    discountAmount: 50, // WELCOME50
    totalAmount: 1066.26,
    paymentStatus: 'PAID',
    orderStatus: 'DELIVERED',
    deliveryAddress: {
      addressLine1: 'Apartment 4B, Silver Oak Residency',
      locality: 'Rajpur Road',
      city: 'Dehradun',
      state: 'Uttarakhand',
      postalCode: '248001',
      country: 'India',
      street: 'Apartment 4B, Silver Oak Residency, Rajpur Road',
      location: { lat: 30.3340, lng: 78.0580 }
    }
  });

  console.log('[Seed Script] Creating verified table reservations...');
  const reservation1 = await Reservation.create({
    restaurantId: doonBistro._id,
    customerId: customer1._id,
    tableId: table2._id,
    guestCount: 3,
    reservationDate: new Date(Date.now() + 86400000 * 2), // 2 days ahead
    timeSlot: '20:30',
    durationMinutes: 90,
    status: 'CONFIRMED',
    depositAmount: 500, // INR 500 deposit
    qrCodeToken: 'GF-PASS-DOON-998811',
    specialRequests: 'Window side table requested for anniversary celebration.'
  });

  console.log('[Seed Script] Creating verified customer reviews...');
  await Review.create({
    restaurantId: doonBistro._id,
    userId: customer1._id,
    orderId: order1._id,
    rating: 5,
    comment: 'Exceptional Pahari Jhol Chicken! Arrived piping hot in Jakhan within 28 minutes. Transparent fee breakdown is so refreshing.',
    isVerifiedDiner: true
  });

  await Review.create({
    restaurantId: mussoorieGrill._id,
    userId: customer1._id,
    rating: 5,
    comment: 'The Galouti Kebabs with Sheermal melt in your mouth. Best charcoal grill in Dehradun foothills!',
    isVerifiedDiner: true
  });

  console.log('[Seed Script] Creating loyalty reward transactions...');
  await LoyaltyLedger.create({
    userId: customer1._id,
    points: 98,
    transactionType: 'EARNED',
    referenceType: 'ORDER',
    referenceId: order1._id,
    balanceAfter: 1450,
    notes: 'Earned 10% loyalty coins on Order #GF-IN-2026-001'
  });

  console.log('\n======================================================================');
  console.log('✅ GourmetFleet India Marketplace Seed Complete!');
  console.log('----------------------------------------------------------------------');
  console.log('Admin Account:        admin@gourmetfleet.com / Password123!');
  console.log('Doon Bistro Owner:    vikram@doonbistro.com / Password123!');
  console.log('Mussoorie Grill:      rajesh@mussooriegrill.com / Password123!');
  console.log('Customer Account:     customer@gourmetfleet.com / Password123!');
  console.log('Cities Seeded:        Dehradun, Delhi NCR, Bengaluru, Mumbai');
  console.log('Locations Authority:  35+ Indian Cities with Haversine Geolocation');
  console.log('======================================================================\n');

  if (shouldDisconnect && mongoose.connection.readyState !== 0 && !memoryServer) {
    await mongoose.disconnect();
    console.log('[Seed Script] Disconnected from database.');
  }
}

// Allow direct CLI execution: `npm run seed`
if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  runSeed(true).catch(err => {
    console.error('[Seed Script Error]', err);
    process.exit(1);
  });
}
