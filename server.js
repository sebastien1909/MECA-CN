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
    if (req.session.role == "admin") {
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

app.get("/machines", async function (req, res) {    
    try {
        if (req.session.role === "admin") {
            res.render("/admin/parcmachine", { page_css1: "parcmachine.css", page_css2: "headeradmin.css" });
        } else {
            res.render("parcmachine", { page_css1: "headerclient.css", page_css2: "parcmachine.css" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur serveur");
    }
});


app.get("/realisations", async function (req, res) {
    try {
        // 1. Récupérer la catégorie depuis l'URL
        const categorieChoisie = req.query.categorie;
        
        // 2. Récupérer toutes les catégories pour le menu de tri
        const [categories] = await pool.query("SELECT * FROM categories");

        // 3. Récupérer les produits (avec ou sans filtre)
        let produitsResultat;
        console.log(produitsResultat);
        
        if (categorieChoisie && categorieChoisie !== 'all') {
            // Requête filtrée si on a un ID de catégorie
            const [rows] = await pool.query("SELECT * FROM produits WHERE categorie = ?", [categorieChoisie]);
            produitsResultat = rows;
        } else {
            // Requête globale par défaut
            const [rows] = await pool.query("SELECT * FROM produits");
            produitsResultat = rows;
        }

        // 4. Préparer les données pour EJS (gestion du premier produit et des suivants)
        const produit1 = produitsResultat.length > 0 ? produitsResultat[0] : null;
        const produitsSuivants = produitsResultat.slice(1);

        // 5. Rendu de la page (Gestion Admin / Client)
        if (req.session.role === "admin") {
            res.render("admin/realisations", { 
                page_css1: "realisationadmin.css", 
                page_css2: "headeradmin.css", 
                produits: produitsSuivants, 
                produit1: produit1, 
                categories: categories,
                categorieChoisie: categorieChoisie || 'all'
            });
        } else {
            res.render("realisations", { 
                page_css1: "headerclient.css", 
                page_css2: "realisationclient.css", 
                produits: produitsSuivants, 
                produit1: produit1, 
                categories: categories,
                categorieChoisie: categorieChoisie || 'all'
            });
        }

    } catch (err) {
        console.error("Erreur SQL ou Serveur :", err);
        res.status(500).send("Erreur lors de la récupération des données");
    }
});

app.get("/devis", async function (req, res) {    
    try {

        const userAgent = req.headers["user-agent"] || "";
        const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(userAgent);



        if (isMobile) {
            if (req.session.role === "admin") {
                res.render("/admin/devis_mobile", { page_css1: "devis.css", page_css2: "headeradmin.css" });
            } else {
                res.render("devis_mobile", { page_css1: "headerclient.css", page_css2: "devis.css" });
            }


        } else {
            if (req.session.role === "admin") {
                res.render("/admin/devis_ordinateur", { page_css1: "devis_ordi.css", page_css2: "headeradmin.css" });
            } else {
                res.render("devis_ordinateur", { page_css1: "headerclient.css", page_css2: "devis_ordi.css" });
            }
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
            res.render("contact", { page_css1: "headerclient.css", page_css2: "contact.css" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur serveur");
    }
});


app.get("/connexion", async function (req, res) {    
    try {
        res.render("connexion", { page_css1: "connexion.css", page_css2: "headeradmin.css" });
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur serveur");
    }
});


app.get("/mentions", async function (req, res) {    
    try {
        res.render("mentions", { page_css1: "mentions.css", page_css2: "headeradmin.css" });
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur serveur");
    }   
});








app.get("/produit", async function (req, res) {
    const produitId = req.query.produit_id;
    const [produit] = await pool.query("SELECT * FROM produits WHERE id = ?", [produitId]);
    const domaine_produit = produit[0].domaine;
    // Sélectionner 3 produits aléatoires du même domaine, en excluant le produit actuel
    const peut_plaire_requete = "SELECT * FROM produits WHERE domaine = ? AND id <> ? ORDER BY RAND() LIMIT 3";
    const [peut_plaire] = await pool.query(peut_plaire_requete, [domaine_produit, produitId]);

    res.render("produit", { produit: produit[0], peut_plaire, page_css: "produit.css" });
});
















app.use((req, res) => {
    res.status(404).render("404");
})


app.listen(3000);