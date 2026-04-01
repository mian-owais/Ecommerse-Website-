// Script to fix duplicate SKU issue
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

async function fixSkuDuplicate() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✓ Connected to MongoDB');

    // Step 1: Drop the SKU index to remove constraints
    console.log('\nDropping SKU index...');
    try {
      await Product.collection.dropIndex('sku_1');
      console.log('✓ SKU index dropped');
    } catch (err) {
      if (err.code === 27) {
        console.log('✓ Index doesn\'t exist (already dropped)');
      } else {
        console.log('⚠ Error dropping index:', err.message);
      }
    }

    // Step 2: Convert all empty/null SKUs to null
    console.log('\nFixing empty SKU values...');
    const result = await Product.updateMany(
      { sku: { $in: ['', ' ', null] } },
      { $set: { sku: null } }
    );
    console.log(`✓ Updated ${result.modifiedCount} documents`);

    // Step 3: Recreate the index with proper sparse settings
    console.log('\nRecreating SKU index...');
    await Product.collection.createIndex(
      { sku: 1 },
      { unique: true, sparse: true }
    );
    console.log('✓ SKU index recreated');

    console.log('\n✅ Database cleanup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    process.exit(1);
  }
}

fixSkuDuplicate();
