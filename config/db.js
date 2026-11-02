// const mongoose = require("mongoose");

// const mongoConnect = async () => {
//   try {
//     await mongoose.connect(process.env.MANGO_URL);
//     console.log("MongoDB connected successfully!");
//   } catch (error) {
//     console.error("MongoDB connection failed:", error.message);
//     throw error;
//   }
// };

// module.exports = mongoConnect;



const mongoose = require("mongoose");

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

const mongoConnect = async () => {
  if (!process.env.MANGO_URL) {
    throw new Error("MANGO_URL is missing");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MANGO_URL)
      .then((mongooseInstance) => {
        console.log("MongoDB connected successfully!");
        return mongooseInstance;
      })
      .catch((error) => {
        cached.promise = null;
        throw error;
      });
  }

  cached.conn = await cached.promise;

  return cached.conn;
};

module.exports = mongoConnect;

