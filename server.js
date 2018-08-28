var express = require("express");
var request = require("request");
var cheerio = require("cheerio");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");
var path = require("path");

var db = require("./models");

var PORT = process.env.PORT || 3000;

var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Handlebars
app.engine(
    "handlebars",
    exphbs({
        defaultLayout: "main"
    })
);
app.set("view engine", "handlebars");

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);




    app.get("/", function (req, res) {
        request("https://www.ksl.com/", function (err, res, html) {

    // Load the html body from request into cheerio
    var $ = cheerio.load(html);
        // Find all results from the scrapedData collection in the db
        $(".headline").each(function (i, element) {
            // Save the text and href of each link enclosed in the current element
            var currentDate = new Date();
            var postYear = currentDate.getFullYear();
            var postDate = $(this).find("span.short").text().trim();
            var postMD = postDate.slice(0, 6);
            var fullPostDate = postMD + " " + postYear;
            fullPostDate = fullPostDate.replace(/\s+/g, '-');

            var result = {};
            result.title = $(this).find("a").text();
            result.link = $(this).find("a").attr("href");
            result.link =  "https://www.ksl.com" + result.link;
            result.summary = $(this).find("h5").text();
            result.image = $(this).siblings(".image_box").find("img").attr("data-srcset");
            result.posted = fullPostDate;
            db.Article.create(result).then(function (dbArticle) {
            })

        })
        

    });
    res.sendFile(path.join(__dirname, "./public/home.html"));
     //res.render("empty");
});

app.get("/new/:date", function (req, res) {
    //var month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    // Find all results from the scrapedData collection in the db
    //var todayDate = new Date();
    //var todayDay = todayDate.getDate();
    //var todayMonth = todayDate.getMonth();
    //var todayYear = todayDate.getFullYear();

    //var today = month[todayMonth] + "-" + todayDay + "-" + todayYear;

    //console.log(today);
    db.Article.find({ posted: req.params.date }, function (error, found) {
        // Throw any errors to the console
        if (error) {
            console.log(error);
        }
        // If there are no errors, send the data to the browser as json
        else {
            console.log(found);
            res.render("headline", {
                examples: found
            })
        }
    })
});


app.get("/all", function (req, res) {
    // Find all results from the scrapedData collection in the db
    db.Article.find({}, function (error, found) {
        // Throw any errors to the console
        if (error) {
            console.log(error);
        }
        // If there are no errors, send the data to the browser as json
        else {
            res.render("index",
                { examples: found });
        }
    });
});
// Route for grabbing a specific Article by id, populate it with it's note
app.get("/article/:id", function (req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ _id: req.params.id })
        // ..and populate all of the notes associated with it
        .populate("note")
        .then(function (dbArticle) {
            // If we were able to successfully find an Article with the given id, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

app.delete("/delete/:id", function (req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Note.findOneAndDelete({ _id: req.params.id })
        // ..and populate all of the notes associated with it

        .then(function (dbNote) {
            // If we were able to successfully find an Article with the given id, send it back to the client
            res.json(dbNote);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route for saving/updating an Article's associated Note
app.post("/article/:id", function (req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
        .then(function (dbNote) {
            // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
            // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
            // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { note: dbNote._id } }, { new: false });
        })
        .then(function (dbArticle) {
            // If we were able to successfully update an Article, send it back to the client

            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});


// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});


