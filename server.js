import express from "express";
import session from "express-session";
import crypto from "crypto";
import bodyParser from "body-parser";
import pool from "./db.js";
import multer from "multer";
import path from "path";
import nodemailer from "nodemailer";
import fs from "fs";
import "dotenv/config";
import sha256 from "js-sha256";



// Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/img/produits'); 
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
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 1000 ,
            secure: false,
            httpOnly: true,
    } 
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
            return res.redirect("/admin/accueil"); 
        } else {
            res.render("accueil", { 
                page_css1: "headerclient.css", 
                page_css2: "accueilclient.css" 
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur serveur");
    }
});

app.get("/presentation", async function (req, res) {    
    try {
        if (req.session.role === "admin") {
            res.redirect("admin/presentation", { page_css1: "presentation.css", page_css2: "headeradmin.css" });
        } else {
            res.render("presentation", { page_css1: "headerclient.css", page_css2: "presentation.css" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur serveur");
    }
});

app.get("/machines", async function (req, res) {    
    try {

        const [machines] = await pool.query("SELECT * FROM machines");

        if (req.session.role === "admin") {
            res.render("/admin/parcmachine", { page_css1: "parcmachine.css", page_css2: "headeradmin.css", machines: machines });
        } else {
            res.render("parcmachine", { page_css1: "headerclient.css", page_css2: "parcmachine.css", machines: machines });
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
        const produitsSuivants = produitsResultat;

        res.render("realisations", { 
            page_css1: "headerclient.css", 
            page_css2: "realisationclient.css", 
            produits: produitsSuivants, 
            produit1: produit1, 
            categories: categories,
            categorieChoisie: categorieChoisie || 'all'
        });
    }
    catch (err) {
        console.error("Erreur SQL ou Serveur :", err);
        res.status(500).send("Erreur lors de la récupération des données");
    }
});

app.get("/devis", async function (req, res) {    
    try {
        const [dimensions] = await pool.query('SELECT MAX(d_x) as max_x, MAX(d_y) as max_y, MAX(d_z) as max_z FROM machines');
        
        res.render("devis", { 
            page_css1: "headerclient.css", 
            page_css2: "devis.css",
            maxDimensions: dimensions[0],
            role: req.session.role
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur serveur");
    }
});





app.get("/contact", async function (req, res) {    
    try {
        res.render("contact", { page_css1: "headerclient.css", page_css2: "contact.css" });
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur serveur");
    }
});


app.get("/connexion", async function (req, res) {    
    try {
        res.render("connexion", { page_css1: "connexion.css", page_css2: "headerclient.css" });
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




app.get("/tests", async function (req, res) {
    try {
        res.render("tests", { page_css1: "tests.css", page_css2: "headerclient.css" });
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur serveur");
    }
});


app.get("/admin/accueil", async function (req, res) {
    try {
        res.render("admin/accueil", { page_css1: "accueiladmin.css", page_css2: "headeradmin.css" });
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur serveur");
    }
});

app.get("/admin/presentation", async function (req, res) {
    try {
        res.render("admin/presentation", { page_css1: "presentation.css", page_css2: "headeradmin.css" });
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur serveur");
    }
});

app.get("/admin/realisations", async function (req, res) {
    try {
        // 1. Récupérer la catégorie depuis l'URL
        const categorieChoisie = req.query.categorie;
        
        // 2. Récupérer toutes les catégories pour le menu de tri
        const [categories] = await pool.query("SELECT * FROM categories");

        // 3. Récupérer les produits (avec ou sans filtre)
        let produitsResultat;
        
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
        const produitsSuivants = produitsResultat;

        res.render("admin/realisations", { 
            page_css1: "headeradmin.css", 
            page_css2: "realisationclient.css", 
            produits: produitsSuivants, 
            produit1: produit1, 
            categories: categories,
            categorieChoisie: categorieChoisie || 'all'
        });
    } 
    catch (err) {
        console.error("Erreur SQL ou Serveur :", err);
        res.status(500).send("Erreur lors de la récupération des données");
    }
});











app.post("/envoyer-devis", upload.array('fichiers', 10), async (req, res) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail', 
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS  
            }
        });


        const attachments = req.files.map(file => ({
            filename: file.originalname,
            path: file.path
        }));


        await transporter.sendMail({
            from: `"Site Web MECA-CN" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_DEST || 'contact@meca-cn.com',
            replyTo: req.body.email, // Permet de répondre directement au client
            subject: `Nouveau Devis - ${req.body.entreprise || req.body.nom}`,
            text: `Nouvelle demande de devis\n\nClient: ${req.body.nom} (${req.body.entreprise})\nEmail: ${req.body.email}\nProduit: ${req.body.produit} (${req.body.quantite} pièces)\nMatière: ${req.body.matiere || 'Non précisé'}\nDimensions: ${req.body.dim_x} x ${req.body.dim_y} x ${req.body.dim_z} mm\nDate souhaitée: ${req.body.date_livraison}\nDescription: ${req.body.description || 'Aucune'}\nFichiers joints: ${req.files.length ? req.files.map(file => file.originalname).join(', ') : 'Aucun'}\n`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #1f2937; background: #f4f6fb; padding: 20px;">
                    <div style="max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 18px; overflow: hidden; border: 1px solid #e2e8f0;">
                        <div style="background: #0f4bb7; color: #ffffff; padding: 28px 30px; text-align: center;">
                            <h1 style="margin: 0; font-size: 24px; letter-spacing: 0.5px;">Nouvelle demande de devis</h1>
                            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85);">Une nouvelle demande a été envoyée depuis le site.</p>
                        </div>
                        <div style="padding: 30px;">
                            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                                <tbody>
                                    <tr>
                                        <td style="padding: 12px 0; color: #64748b; width: 180px;">Client</td>
                                        <td style="padding: 12px 0; font-weight: 700;">${req.body.nom || 'Non précisé'} ${req.body.entreprise ? '(' + req.body.entreprise + ')' : ''}</td>
                                    </tr>
                                    <tr style="border-top: 1px solid #e2e8f0;">
                                        <td style="padding: 12px 0; color: #64748b;">Email</td>
                                        <td style="padding: 12px 0; font-weight: 700;">${req.body.email || 'Non précisé'}</td>
                                    </tr>
                                    <tr style="border-top: 1px solid #e2e8f0;">
                                        <td style="padding: 12px 0; color: #64748b;">Produit</td>
                                        <td style="padding: 12px 0; font-weight: 700;">${req.body.produit || 'Non précisé'}</td>
                                    </tr>
                                    <tr style="border-top: 1px solid #e2e8f0;">
                                        <td style="padding: 12px 0; color: #64748b;">Matière</td>
                                        <td style="padding: 12px 0; font-weight: 700;">${req.body.matiere || 'Non précisé'}</td>
                                    </tr>
                                    <tr style="border-top: 1px solid #e2e8f0;">
                                        <td style="padding: 12px 0; color: #64748b;">Quantité</td>
                                        <td style="padding: 12px 0; font-weight: 700;">${req.body.quantite || '0'} pièce(s)</td>
                                    </tr>
                                    <tr style="border-top: 1px solid #e2e8f0;">
                                        <td style="padding: 12px 0; color: #64748b;">Dimensions</td>
                                        <td style="padding: 12px 0; font-weight: 700;">${req.body.dim_x || '0'} x ${req.body.dim_y || '0'} x ${req.body.dim_z || '0'} mm</td>
                                    </tr>
                                    <tr style="border-top: 1px solid #e2e8f0;">
                                        <td style="padding: 12px 0; color: #64748b;">Date souhaitée</td>
                                        <td style="padding: 12px 0; font-weight: 700;">${req.body.date_livraison || 'Non sélectionnée'}</td>
                                    </tr>
                                </tbody>
                            </table>

                            <div style="margin-bottom: 24px;">
                                <h2 style="margin: 0 0 12px; font-size: 18px; color: #0f4bb7;">Description</h2>
                                <p style="margin: 0; color: #475569;">${req.body.description ? req.body.description.replace(/\n/g, '<br>') : 'Aucune description fournie.'}</p>
                            </div>

                            <div style="margin-bottom: 24px;">
                                <h2 style="margin: 0 0 12px; font-size: 18px; color: #0f4bb7;">Fichiers joints</h2>
                                ${req.files.length ? `<ul style="margin: 0; padding-left: 20px; color: #475569;">${req.files.map(file => `<li style="margin-bottom: 8px;">${file.originalname} (${Math.round(file.size / 1024)} Ko)</li>`).join('')}</ul>` : '<p style="margin: 0; color: #475569;">Aucun fichier joint.</p>'}
                            </div>

                            <p style="margin: 0; color: #94a3b8; font-size: 13px;">Cette demande de devis a été générée depuis le formulaire de contact du site.</p>
                        </div>
                    </div>
                </div>
            `,
            attachments: attachments
        });


        req.files.forEach(file => {
            fs.unlink(file.path, (err) => {
                if (err) console.error("Erreur suppression fichier temporaire:", err);
            });
        });

        res.render("confirmation_devis", { 
            success: true, 
            message: "Votre demande a été envoyée avec succès !",
            page_css1: "headerclient.css",
            page_css2: "devis.css"
        });

    } catch (err) {
        console.error("Erreur Nodemailer :", err);
        res.render("confirmation_devis", { 
            success: false, 
            message: "Désolé, une erreur technique est survenue.",
            page_css1: "headerclient.css",
            page_css2: "devis.css.css"
        });
    }
});




app.get('/api/max-dimensions', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT MAX(d_x) as max_x, MAX(d_y) as max_y, MAX(d_z) as max_z FROM machines');
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur serveur');
    }
});


app.get("/modif_realisations/:id", async function (req, res) {
    try {
        const produitId = req.params.id; 
        const [produit] = await pool.query("SELECT * FROM produits WHERE id = ?", [produitId]);
        const categorieId = produit[0].categorie;
        const [categories] = await pool.query("SELECT nom FROM categories WHERE id_cat = ?", [categorieId]);
        const listeCategories = await pool.query("SELECT * FROM categories");
        res.render("admin/modifrealisation", { 
            page_css1: "headeradmin.css", 
            page_css2: "modif_realisations.css", 
            produit: produit[0], 
            categories: categories[0].nom, 
            listeCategories: listeCategories[0]
        });
    } catch (err) {
        console.error("Erreur SQL ou Serveur :", err);
        res.status(500).send("Erreur lors de la récupération des données");
    }});


app.get("/suppression", async function (req, res) {
    try {
        res.render("/admin/suppression", { page_css1: "headeradmin.css", page_css2: "suppression.css" });
    } catch (err) {
        console.error("Erreur SQL ou Serveur :", err);
        res.status(500).send("Erreur lors de la suppression de la réalisation");
    }
});



















app.post("/envoyer-contact", async function (req, res) {

    const { nom, entreprise, email, telephone, objet, message } = req.body;

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: `"${nom}" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_DEST || 'meca.cn@wanadoo.fr',
            replyTo: email,
            subject: `[CONTACT SITE] ${objet}`,
            text: `Message de ${nom} (Entreprise: ${entreprise})\nTel: ${telephone}\n\n${message}`,
            html: `
                <h3>Nouveau message de contact</h3>
                <p><strong>Nom:</strong> ${nom}</p>
                <p><strong>Entreprise:</strong> ${entreprise}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Téléphone:</strong> ${telephone}</p>
                <p><strong>Objet:</strong> ${objet}</p>
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
            `
        });


        res.render("contact", { 
            page_css1: "headerclient.css", 
            page_css2: "contact.css", 
            success: "Votre message a bien été envoyé !" 
        });

    } catch (err) {
        console.error("Erreur Nodemailer :", err);
        res.render("contact", { 
            page_css1: "headerclient.css", 
            page_css2: "contact.css", 
            error: "Désolé, une erreur est survenue. Veuillez nous contacter par téléphone." 
        });
    }
});



app.post("/connexion", async function (req, res) {
    const { id_user, password } = req.body;
    try {
        const [rows] = await pool.query("SELECT * FROM utilisateurs WHERE identifiant = ?", [id_user]);

        if (rows.length === 0) {
            return res.render("connexion", { page_css1: "connexion.css", page_css2: "headerclient.css", error: "Identifiant ou mot de passe incorrect" });
        }

        const user = rows[0];
        const mdp = user.password;
        const role = user.role;

        if (mdp === sha256(password)) {
            req.session.userID = user.id;
            req.session.role = role;
            if (role === "admin") {
                return res.redirect("/admin/accueil");
            }
            return res.redirect("/");
        }

        return res.render("connexion", { page_css1: "connexion.css", page_css2: "headerclient.css", error: "Identifiant ou mot de passe incorrect" });
    } catch (err) {
        console.error("Erreur connexion :", err);
        res.render("connexion", { page_css1: "connexion.css", page_css2: "headerclient.css", error: "Erreur serveur, réessayez plus tard" });
    }
});




app.use((req, res) => {
    res.status(404).render("404");
})


app.listen(3000);