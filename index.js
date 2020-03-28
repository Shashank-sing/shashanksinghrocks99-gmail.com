import express from 'express';

var app = express();

app.set("view engine", "ejs")

app.get("/",()=> {
    res.render("index.ejs")
})

app.listen(process.env.PORT, ()=> {
    // console.log("Server Started");
})