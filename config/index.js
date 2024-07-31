const mongoose = require("mongoose");
const initData = require("./data");
const User = require("../models/listings");

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/fightclub");
}

const initDb = async () => {
  await User.deleteMany({});
  // await User.insertMany(initData.data);
  console.log("Data was initialized");
};

initDb();
