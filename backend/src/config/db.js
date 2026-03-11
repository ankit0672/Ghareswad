const mongoose = require('mongoose');

const connectDB = async () => {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/ghareswad';

    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000, // fail fast if mongo not running
        });
        console.log(`✅ MongoDB connected → ${uri}`);
    } catch (err) {
        console.error('❌ MongoDB connection failed:', err.message);
        console.error('');
        console.error('👉 Make sure MongoDB is running on your PC:');
        console.error('   1. Download MongoDB Community Server (free):');
        console.error('      https://www.mongodb.com/try/download/community');
        console.error('   2. Install it (default options) — MongoDB Compass is included.');
        console.error('   3. Start the MongoDB service:');
        console.error('      net start MongoDB   (run PowerShell as Admin)');
        console.error('   4. Then run `npm run dev` again.');
        process.exit(1);
    }
};

module.exports = connectDB;
