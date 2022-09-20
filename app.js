if (process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose')
const Campground = require('./models/campground');
app.use(express.urlencoded({ extended: true }));
const methodOverride = require('method-override');
app.use(methodOverride('_method'));
const ejsMate = require('ejs-mate');
app.engine('ejs', ejsMate);
const session = require('express-session');
const ExpressError = require('./utilities/ExpressError');
const Joi = require('joi');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const Review = require('./models/review');
const flash = require('connect-flash')
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users')
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const MongoStore = require('connect-mongo');
app.use(express.static(path.join(__dirname, 'public')))
const dbUrl = process.env.DATABURL || 'mongodb://localhost:27017/Yelp';

mongoose.connect(dbUrl, {
    useNewUrlParser: true,

    useUnifiedTopology: true
})
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"))
db.once("open", () => {
    console.log("Database connection");
})



const secret = process.env.SECRET || 'thisshouldbeabettersecret'

// const store = MongoStore.create({
//     mangoUrl: dbUrl,
//     secret,
//     touchAfter: 24 * 60 * 60
// })
store = MongoStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
})


const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,

    cookie: {
        httpOnly: true,
        // secure:true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }

}

store.on("error", function (e) {
    console.log("SESSTION STORE ERROR", e)
})



app.use(session(sessionConfig));
app.use(flash());
app.use(mongoSanitize());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
//This is the array that needs added to
const styleSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",

    "https://kit-free.fontawesome.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://cdn.jsdelivr.net/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dnunhyjdm/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {

    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})
// 'mongodb://localhost:27017/Yelp'


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))




app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes)



app.get('/', (req, res) => {
    res.render('home');
})




app.all('*', (req, res, next) => {
    next(new ExpressError("Page not found", 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Oh no Something Went Wrong";
    res.status(statusCode).render('error', { err })


})

app.listen(3000, () => {
    console.log("Connection OK");
})