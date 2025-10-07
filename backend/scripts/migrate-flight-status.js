const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/osh-airlines');

const flightSchema = new mongoose.Schema({
  flightNumber: String,
  origin: String,
  destination: String,
  departureDate: Date,
  arrivalDate: Date,
  duration: Number,
  companyId: String,
  economyPrice: Number,
  economySeats: Number,
  comfortPrice: Number,
  comfortSeats: Number,
  businessPrice: Number,
  businessSeats: Number,
  isActive: Boolean,
  status: String,
  createdAt: Date,
  updatedAt: Date
});

const Flight = mongoose.model('Flight', flightSchema, 'flights');

async function migrateFlightStatus() {
  try {
    console.log('🔄 Starting flight status migration...');
    
    // Get all flights
    const flights = await Flight.find({});
    console.log(`📊 Found ${flights.length} flights to migrate`);
    
    let updatedCount = 0;
    
    for (const flight of flights) {
      // Calculate status based on departure time
      const now = new Date();
      const departure = new Date(flight.departureDate);
      const newStatus = departure > now ? 'upcoming' : 'passed';
      
      // Only update if status is null, undefined, or different
      if (!flight.status || flight.status !== newStatus) {
        await Flight.updateOne(
          { _id: flight._id },
          { $set: { status: newStatus } }
        );
        updatedCount++;
        console.log(`✅ Updated flight ${flight.flightNumber}: ${flight.status || 'null'} → ${newStatus}`);
      }
    }
    
    console.log(`🎉 Migration completed! Updated ${updatedCount} flights`);
    
    // Show final status distribution
    const upcomingCount = await Flight.countDocuments({ status: 'upcoming' });
    const passedCount = await Flight.countDocuments({ status: 'passed' });
    const nullCount = await Flight.countDocuments({ status: { $in: [null, undefined] } });
    
    console.log('\n📈 Final status distribution:');
    console.log(`   Upcoming: ${upcomingCount}`);
    console.log(`   Passed: ${passedCount}`);
    console.log(`   Null/Undefined: ${nullCount}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

migrateFlightStatus();
