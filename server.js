import express from "express";
import session from "express-session";
import crypto from "crypto";
import bodyParser from "body-parser";
import pool from "./db.js";
import multer from "multer";
import path from "path";
import nodemailer from "nodemailer";
import fs from "fs";


// Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/img/produit'); 
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueName = 'Prdt' + Date.now() + ext;
        cb(null, uniqueName);
    }
});



const upload = multer({ storage: storage });

const app = express();
app.set("view engine", "ejs");

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
}));


app.use((req, res, next) => {
    res.locals.userRole = req.session.userRole || null;
    next();
});

//MIDDLEWARES MAISON
function authenticate(req, res, next) {
    if (req.session.hasOwnProperty("userID")) {
        next();
    }
    else {
        res.status(403).redirect("connexion")
    }
}

function isAdmin(req, res, next) {
    if (req.session.userRole == "admin") {
        next();
    }
    else {
        res.status(403).redirect("/");
    }
}



//protéger une page (rajout d'authenticate et par ex isAdmin)
// app.get("/", authenticate, isAdmin, async function(req,res){
//     //récupération bdd (code à réutiliser pour les autres routes)
//     let data = await pool.query("SELECT * FROM produit");
//     res.render("index", {variable : data});
// });

//

// ROUTES




app.get("/", async function (req, res) {    
    try {
        if (req.session.role === "admin") {
            res.render("/admin/accueil", { page_css1: "headeradmin.css" });
        } else {
            res.render("accueil", { page_css1: "headerclient.css", page_css2: "accueilclient.css" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur serveur");
    }
});

app.get("/presentation", async function (req, res) {    
    try {
        if (req.session.role === "admin") {
            res.render("/admin/presentation", { page_css1: "presentation.css", page_css2: "headeradmin.css" });
        } else {
            res.render("presentation", { page_css1: "headerclient.css", page_css2: "none.css" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur serveur");
    }
});

app.get("/devis", async function (req, res) {    
    try {
        if (req.session.role === "admin") {
            res.render("/admin/devis", { page_css1: "devis.css", page_css2: "headeradmin.css" });
        } else {
            res.render("devis", { page_css1: "headerclient.css", page_css2: "none.css" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur serveur");
    }
});

app.get("/contact", async function (req, res) {    
    try {
        if (req.session.role === "admin") {
            res.render("/admin/contact", { page_css1: "contact.css", page_css2: "headeradmin.css" });
        } else {
            res.render("contact", { page_css1: "headerclient.css", page_css2: "none.css" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur serveur");
    }
});


app.get("/connexion", async function (req, res) {    
    try {
        res.render("/connexion", { page_css1: "connexion.css", page_css2: "headeradmin.css" });
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur serveur");
    }
});



















app.use((req, res) => {
    res.status(404).render("404");
})


app.listen(3000);