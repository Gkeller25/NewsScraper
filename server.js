var express = require("express");
var mongojs = require("mongojs");
var request = require("request");
var cheerio = require("cheerio");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");
var rp = require('request-promise');

var db = require("./models");

var PORT = 3000;

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




app.get("/newest", function (req, res) {
    // Scrape data from one site and place it into the mongodb db
    
    // Make a request for the news section of `ycombinator`

    request("https://www.ksl.com/", function (err, res, html) {
        var newHL = [];
        // Load the html body from request into cheerio
        var $ = cheerio.load(html);
        //For each element with a "title" class
        let i = 0;

        $(".headline").each(function (i, element) {
            // Save the text and href of each link enclosed in the current element
            var result = {};
            result.title = $(this).find("a").text();
            result.link = $(this).find("a").attr("href");
            result.summary = $(this).find("h5").text();
            result.image = $(this).siblings(".image_box").find("img").attr("data-srcset");
            
            // Insert the data in the scrapedData db
            db.Article.findOne({ title: result.title }, function (err, article) {
                if (!article) {
                    //console.log(result);
                    db.Article.create(result).then(function (dbArticle) {
                        console.log("DBARTICLE: "+dbArticle);
                        newHL.push(result);
                        //res.json(newHL);
                    }).catch(function (err) {
                        return res.json(err);
                    });
                    console.log("1st LOG: "+newHL);
                     
                    
                   
                }
            });
            console.log("2nd LOG: "+newHL);
        });
        console.log("3rd LOG: "+newHL);
        //for (let i = 0; i < array.length; i++) {
        //    l;aksdjfals;kdjf
        //    if(i === array.length){
        //        res.json(array)
        //    }
        //}

        //});
        //db.scrapedHeadlines.insert({
        //    title: title,
        //    summary: summary,
        //    link: link,
        //    image: image
        //}, function(err, inserted) {
        //  if (err) {
        //    // Log the error if one is encountered during the query
        //    console.log(err);
        //  }
        //  else {
        //    // Otherwise, log the inserted data
        //    console.log(inserted);
        //  }
        //});
        //}
        // If this found element had both a title and a link

    });
    //console.log(newHL);
    //res.render("index", { new_Headlines: newHL });
});

// Send a "Scrape Complete" message to the browser



// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});


