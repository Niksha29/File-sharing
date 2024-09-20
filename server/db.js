import 'dotenv/config';
import mongoose from "mongoose";

function connectDB() {
    mongoose.connect(process.env.MONGO_CONNECTION_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log('Database connected');
    })
    .catch((err) => {
        console.error('Connection failed', err);
    });
}

export default connectDB;
