import mongoose from "mongoose";

const dbConnection = () => {
  mongoose
    .connect(process.env.DB_URI)
    .then((con) => {
      console.log("DB connection successful");
    })
    // .catch((err) => {
    //   console.error("DB connection error:", err);
    //   process.exit(1); // Exit process with failure
    // });
};

export default dbConnection;
