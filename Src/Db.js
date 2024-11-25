import mongoose from "mongoose";

export const ConnectDb = async () => {
  try {
    const res = await mongoose.connect(process.env.DB_URL);
    if (res) {
      console.log(`Database Connect at Port : ${res.connections[0].port}`);
    }
  } catch (error) {
    console.log("Error Occur Will   Database Connection ");
  }
};
