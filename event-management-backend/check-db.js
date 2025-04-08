require('dotenv').config();
const mongoose = require('mongoose');

async function checkDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    console.log('Connection string:', process.env.MONGO_URI);
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB successfully!');
    
    // Get all databases
    const admin = mongoose.connection.db.admin();
    const dbList = await admin.listDatabases();
    
    console.log('\nAvailable databases:');
    dbList.databases.forEach(db => {
      console.log(`- ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });
    
    // Check if our database exists
    const dbName = process.env.MONGO_URI.split('/').pop().split('?')[0];
    const dbExists = dbList.databases.some(db => db.name === dbName);
    
    if (dbExists) {
      console.log(`\nDatabase '${dbName}' exists!`);
      
      // List collections in our database
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('\nCollections in the database:');
      collections.forEach(collection => {
        console.log(`- ${collection.name}`);
      });
    } else {
      console.log(`\nDatabase '${dbName}' does not exist!`);
    }
    
    // Close the connection
    await mongoose.connection.close();
    console.log('\nConnection closed.');
  } catch (error) {
    console.error('Error:', error);
  }
}

checkDatabase(); 