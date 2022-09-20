
const mongoose = require('mongoose')
const cities = require('./cities');
const Campground = require('../models/campground');
const { places, descriptors } = require('./seedHelpers')

mongoose.connect('mongodb://localhost:27017/Yelp', {
    useNewUrlParser: true,

    useUnifiedTopology: true
})
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"))
db.once("open", () => {
    console.log("Database connection");
})
const sample = array => array[Math.floor(Math.random() * array.length)]


const seedDB = async () => {

    await Campground.deleteMany({});
    for (let i = 0; i < 400; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;

        const camp = new Campground({
            author: '63216725b1f99d7fdded5b38',
            location: `${cities[random1000].city},${cities[random1000].state} `,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                    url: 'https://res.cloudinary.com/dnunhyjdm/image/upload/v1663312170/YelpCamp/ormapgzzhfojc0c1popj.jpg',
                    filename: 'YelpCamp/ormapgzzhfojc0c1popj',

                }
            ],
            description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Consequuntur iusto qui quasi officia culpa voluptatem et facere praesentium laboriosam voluptas deserunt exercitationem dicta sunt cum voluptates optio, aliquam nesciunt!',
            price: price,
            geometry: {
                type: "Point",
                coordinates: [cities[random1000].longitude,
                cities[random1000].latitude]
            }
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})
