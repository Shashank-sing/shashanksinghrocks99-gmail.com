var express = require("express");

var app = express();
app.use(express.static(__dirname + '/public'));

app.set("view engine", "ejs")

app.get("/",(req, res)=> {
    res.render("index.ejs")
})

app.listen(8080, ()=> {
    console.log("Server Started");
})