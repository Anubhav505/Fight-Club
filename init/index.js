const mongoose = require("mongoose");
const initData = require("./data.js");
const User = require("../models/listing.js");

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/fightclub');
};

const initDB = async () => {
    await User.deleteMany({});
    await User.insertMany(initData.data);
    console.log("Data was initialized");
}

initDB();