import mongoose from "mongoose";

// Database connection function
const dbConnection = () => {
  mongoose.connect(process.env.DB_URI).then((con) => {
    console.log("DB connection successful");
  });
};

// Export the database connection function
export default dbConnection;
