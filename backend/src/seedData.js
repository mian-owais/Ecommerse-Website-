const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');
const Category = require('./models/Category');

const sampleCategories = [
  {
    name: 'Electronics',
    emoji: '📱',
    description: 'Latest electronic devices and gadgets',
    isActive: true
  },
  {
    name: 'Accessories',
    emoji: '🎧',
    description: 'Premium tech accessories and peripherals',
    isActive: true
  },
  {
    name: 'Gadgets',
    emoji: '⚙️',
    description: 'Innovative gadgets and smart devices',
    isActive: true
  },
  {
    name: 'Wearables',
    emoji: '⌚',
    description: 'Wearable technology and smart gear',
    isActive: true
  }
];

const sampleProducts = [
  {
    name: 'Wireless Headphones Pro',
    description: 'Premium wireless headphones with active noise cancellation, 30-hour battery life, and Bluetooth 5.0 connectivity.',
    price: 129.99,
    originalPrice: 179.99,
    category: 'Electronics',
    image: '🎧',
    stock: 25,
    sku: 'WHD-PRO-2024',
    rating: 4.5,
    reviews: 128,
    features: [
      'Active Noise Cancellation (ANC)',
      '30-hour battery life',
      'Bluetooth 5.0 connectivity',
      'Premium comfort padding',
      'Built-in microphone for calls',
      'Collapsible design for portability'
    ],
    specifications: {
      'Driver Size': '40mm',
      'Frequency Response': '20Hz - 20kHz',
      'Impedance': '32 Ohm',
      'Connectivity': 'Bluetooth 5.0',
      'Battery': '1000mAh Li-ion',
      'Weight': '250g'
    }
  },
  {
    name: 'Smart Watch Ultra',
    description: 'Advanced fitness tracking smartwatch with heart rate monitor, sleep tracking, and 7-day battery life.',
    price: 249.99,
    originalPrice: 299.99,
    category: 'Wearables',
    image: '⌚',
    stock: 15,
    sku: 'SWT-ULT-2024',
    rating: 4.8,
    reviews: 95,
    features: [
      'Heart rate monitoring',
      'Sleep tracking',
      '7-day battery life',
      'Water resistant up to 50m',
      'Multiple sport modes',
      'AMOLED display'
    ],
    specifications: {
      'Display': '1.4-inch AMOLED',
      'Resolution': '454 x 454 pixels',
      'Battery': '500mAh Li-ion',
      'Waterproof Rating': '5ATM (50m)',
      'Connectivity': 'Bluetooth 5.0',
      'Weight': '32g'
    }
  },
  {
    name: 'USB-C Hub Pro',
    description: '7-port USB-C hub with HDMI, USB 3.0, and USB-C power delivery for maximum connectivity.',
    price: 49.99,
    originalPrice: 69.99,
    category: 'Accessories',
    image: '🔌',
    stock: 40,
    sku: 'USB-HUB-2024',
    rating: 4.2,
    reviews: 67,
    features: [
      '7 ports total',
      'HDMI 4K output',
      '3x USB 3.0 ports',
      'USB-C power delivery',
      'Aluminum construction',
      'Led indicator'
    ],
    specifications: {
      'Ports': '7 (1 HDMI, 3 USB 3.0, 1 USB-C PD, 2 USB-C)',
      'Max Power Delivery': '100W',
      'Max Data Speed': '5Gbps',
      'Cable Length': '0.3m',
      'Material': 'Aluminum alloy',
      'Color': 'Space gray'
    }
  },
  {
    name: 'Premium Phone Stand',
    description: 'Adjustable aluminum phone stand perfect for desk use, video calls, and content creation.',
    price: 39.99,
    originalPrice: 59.99,
    category: 'Accessories',
    image: '📱',
    stock: 50,
    sku: 'PHN-STD-2024',
    rating: 4.6,
    reviews: 82,
    features: [
      'Adjustable angle',
      'Aluminum construction',
      'Non-slip rubber pads',
      'Supports 4-7 inch phones',
      '360° rotation',
      'Compact design'
    ],
    specifications: {
      'Material': 'Aviation-grade aluminum',
      'Compatibility': 'Universal 4-7 inch phones',
      'Adjustable angles': '0-90 degrees',
      'Max weight capacity': '0.5kg',
      'Weight': '140g',
      'Dimensions': '120 x 85 x 40mm'
    }
  },
  {
    name: 'Wireless Mouse',
    description: 'Precision wireless mouse with ergonomic design and extended battery life for comfortable computing.',
    price: 34.99,
    originalPrice: 49.99,
    category: 'Electronics',
    image: '🖱️',
    stock: 35,
    sku: 'WRL-MOU-2024',
    rating: 4.4,
    reviews: 56,
    features: [
      'Wireless connectivity',
      'Ergonomic design',
      '18-month battery life',
      'Precision scrolling',
      '2.4GHz receiver',
      'Silent clicking'
    ],
    specifications: {
      'Type': 'Optical laser',
      'DPI': '800 - 1600',
      'Connectivity': '2.4GHz wireless',
      'Battery': '2 AA batteries',
      'Battery Life': '18 months',
      'Weight': '85g'
    }
  },
  {
    name: 'Bluetooth Speaker',
    description: 'Portable Bluetooth speaker with 360° sound, waterproof design, and 12-hour battery life.',
    price: 89.99,
    originalPrice: 119.99,
    category: 'Electronics',
    image: '🔊',
    stock: 30,
    sku: 'BT-SPK-2024',
    rating: 4.7,
    reviews: 103,
    features: [
      '360° sound',
      'IPX7 waterproof',
      '12-hour battery',
      'Bluetooth 5.0',
      'Bass boost',
      'TWS pairing'
    ],
    specifications: {
      'Driver': 'Dual 5W drivers',
      'Connectivity': 'Bluetooth 5.0',
      'Waterproof Rating': 'IPX7',
      'Battery': '2000mAh Li-ion',
      'Battery Life': '12 hours',
      'Weight': '260g'
    }
  },
  {
    name: 'Laptop Stand',
    description: 'Adjustable laptop stand made from premium materials to improve ergonomics and reduce neck strain.',
    price: 59.99,
    originalPrice: 79.99,
    category: 'Accessories',
    image: '💻',
    stock: 28,
    sku: 'LAP-STD-2024',
    rating: 4.3,
    reviews: 72,
    features: [
      'Height adjustable',
      'Premium aluminum',
      'Supports up to 17 inch',
      'Cable management',
      'Non-slip feet',
      'Minimalist design'
    ],
    specifications: {
      'Material': 'Aluminum alloy',
      'Compatibility': 'Universal 10-17 inch laptops',
      'Height range': '2-8 inches',
      'Max weight': '15kg',
      'Folding': 'Portable design',
      'Weight': '320g'
    }
  },
  {
    name: 'Wireless Charger',
    description: 'Fast wireless charger with efficient heat dissipation and compatibility with all Qi-enabled devices.',
    price: 44.99,
    originalPrice: 64.99,
    category: 'Gadgets',
    image: '🔋',
    stock: 45,
    sku: 'WL-CHG-2024',
    rating: 4.5,
    reviews: 91,
    features: [
      '15W fast charging',
      'Qi compatible',
      'LED indicator',
      'Over-temperature protection',
      'Non-slip surface',
      'Compact design'
    ],
    specifications: {
      'Input': 'USB Type-C 5V/2A',
      'Output': '15W max',
      'Compatibility': 'All Qi-enabled devices',
      'Coil': 'Copper coil',
      'Dimensions': '100 x 100 x 8mm',
      'Color': 'Black'
    }
  },
  {
    name: 'USB-C Cable 2m',
    description: 'Durable USB-C cable with fast charging and data transfer capabilities, perfect for daily use.',
    price: 19.99,
    originalPrice: 29.99,
    category: 'Accessories',
    image: '🔗',
    stock: 80,
    sku: 'USB-CBL-2024',
    rating: 4.4,
    reviews: 127,
    features: [
      '2-meter length',
      'Fast charging 100W',
      'Data transfer 480Mbps',
      'Braided nylon',
      'Tangle-free',
      'Lifetime warranty'
    ],
    specifications: {
      'Length': '2 meters',
      'Connectivity': 'USB Type-C to USB Type-C',
      'Power Rating': '100W',
      'Data Speed': '480Mbps',
      'Material': 'Braided nylon',
      'Color': 'Black'
    }
  },
  {
    name: 'Screen Protector - Tempered Glass',
    description: '9H hardness tempered glass screen protector with anti-fingerprint coating and easy installation.',
    price: 14.99,
    originalPrice: 24.99,
    category: 'Accessories',
    image: '🛡️',
    stock: 120,
    sku: 'SCR-PRT-2024',
    rating: 4.6,
    reviews: 203,
    features: [
      '9H hardness',
      'Anti-fingerprint',
      'Easy installation',
      'Ultra-thin',
      '99.9% transparency',
      'Scratch resistant'
    ],
    specifications: {
      'Thickness': '0.3mm',
      'Hardness': '9H',
      'Transparency': '99.9%',
      'Coating': 'Anti-fingerprint',
      'Compatibility': 'Universal phones',
      'Package': '2 pack'
    }
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('🗑️  Cleared existing categories');

    // Insert sample categories
    const insertedCategories = await Category.insertMany(sampleCategories);
    console.log(`✅ ${insertedCategories.length} categories inserted successfully!`);

    // Insert sample products
    const insertedProducts = await Product.insertMany(sampleProducts);
    console.log(`✅ ${insertedProducts.length} products inserted successfully!`);

    // Display sample product info
    const productCount = await Product.countDocuments();
    console.log(`\n📊 Database now contains ${productCount} products`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
