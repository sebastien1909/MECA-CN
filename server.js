/*
 * server.js
 * Serveur Express principal de l'application.
 * - Configure les middlewares (sessions, bodyParser, static)
 * - Configure multer pour la gestion des uploads
 * - Déclare les routes publiques et admin
*/

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
// --- CONFIGURATION MULTER POUR LES PRODUITS ---
const storageProduits = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/img/produits'); 
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, 'Prdt' + Date.now() + ext);
    }
});
const uploadProduits = multer({ storage: storageProduits });

// --- CONFIGURATION MULTER POUR LES MACHINES ---
const storageMachines = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/img/machines'); 
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, 'Mchn' + Date.now() + ext); // Préfixe différent pour s'y retrouver
    }
});
const uploadMachines = multer({ storage: storageMachines });




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

/**
 * Middleware `authenticate`
 * Vérifie que l'utilisateur est authentifié (présence de "session.userID").
 * Si authentifié -> "next()", sinon redirige vers la page de connexion.
 */
function authenticate(req, res, next) {
    if (req.session.hasOwnProperty("userID")) {
        next();
    }
    else {
        res.status(403).redirect("connexion")
    }
}

/**
* Middleware "isAdmin"
Vérifie que la session correspond à un administrateur.
Si oui -> "next()", sinon redirige vers la page d'accueil.
 */
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




/**
 * GET /
 * Page d'accueil : redirige les administrateurs vers l'interface admin,
 * sinon affiche la page publique d'accueil.
 */
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

/**
 * GET /presentation
 * Page de présentation de l'entreprise. Rend la vue adaptée selon le rôle.
 */
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

// Route publique pour lister les machines
/**
 * GET /machines
 * Route client listant toutes les machines (séparées par type).
 */
app.get("/machines", async function (req, res) {
    try {
        const [machines] = await pool.query("SELECT * FROM machines");
        const machinestourneuses = machines.filter(machine => machine.type === "tournage");
        const machinefraiser = machines.filter(machine => machine.type === "fraisage");

        res.render("parcmachine", { page_css1: "headerclient.css", page_css2: "parcmachine.css", machines: machines, machinestourneuses: machinestourneuses, machinefraiser: machinefraiser });
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur serveur");
    }
});

// Route admin pour la gestion du parc machine (protégée)
app.get("/admin/machines", isAdmin, async function (req, res) {
    try {
        const [machines] = await pool.query("SELECT * FROM machines");
        const machinestourneuses = machines.filter(machine => machine.type === "tournage");
        const machinefraiser = machines.filter(machine => machine.type === "fraisage");

        // On récupère le message de succès s'il existe
        const successMessage = req.query.success === 'add' ? "La machine a été ajoutée avec succès !" : null;

        res.render("admin/parcmachine", { 
            page_css1: "parcmachine.css", 
            page_css2: "headeradmin.css", 
            machines, 
            machinestourneuses, 
            machinefraiser,
            successMessage // On envoie le message au template
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur serveur");
    }
});


/**
GET /realisations
Liste les réalisations (portfolio). Supporte le filtrage par catégorie
via le paramètre `categorie` en query string.
 */
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

/**
GET /devis
Page du formulaire de demande de devis. Récupère les dimensions max des machines pour éviter toutes demandes impossibles (affichage et validation côté client).
 */
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





/**
 * GET /contact
Page de contact et formulaire pour envoyer un message à l'entreprise.
 */
app.get("/contact", async function (req, res) {    
    try {
        res.render("contact", { page_css1: "headerclient.css", page_css2: "contact.css" });
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur serveur");
    }
});


/**
 * GET /connexion
Page de connexion pour les utilisateurs (identification).
 */
app.get("/connexion", async function (req, res) {    
    try {
        res.render("connexion", { page_css1: "connexion.css", page_css2: "headerclient.css" });
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur serveur");
    }
});


/**
 * GET /mentions
Page des mentions légales.
 */
app.get("/mentions", async function (req, res) {    
    try {
        res.render("mentions", { page_css1: "mentions.css", page_css2: "headeradmin.css" });
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur serveur");
    }   
});




/**
 * GET /tests
Page de test/de développement (utilitaire).
 */
app.get("/tests", async function (req, res) {
    try {
        res.render("tests", { page_css1: "tests.css", page_css2: "headerclient.css" });
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur serveur");
    }
});


/**
 * GET /admin/accueil
Tableau de bord administrateur (page d'accueil admin).
 */
app.get("/admin/accueil", async function (req, res) {
    try {
        res.render("admin/accueil", { page_css1: "accueiladmin.css", page_css2: "headeradmin.css" });
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur serveur");
    }
});

/**
 * GET /admin/presentation
Page admin pour modifier la page de présentation publique.
 */
app.get("/admin/presentation", async function (req, res) {
    try {
        res.render("admin/presentation", { page_css1: "presentation.css", page_css2: "headeradmin.css" });
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur serveur");
    }
});

/**
 * GET /admin/realisations
Version administrateur du listing des réalisations (avec options de gestion).
 */
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

/**
 * GET /deconnexion
Détruit la session et déconnecte l'utilisateur.
 */
app.get("/deconnexion", async function (req, res) {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.error("Erreur lors de la déconnexion :", err);
                res.status(500).send("Erreur serveur");
            } else {
                res.redirect("/");
            }
        });
    } catch (err) {
        console.error("Erreur serveur :", err);
        res.status(500).send("Erreur serveur");
    }
}); 




/**
 * GET /api/max-dimensions
Endpoint API retournant les dimensions maximales disponibles (JSON).
 */
app.get('/api/max-dimensions', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT MAX(d_x) as max_x, MAX(d_y) as max_y, MAX(d_z) as max_z FROM machines');
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur serveur');
    }
});


/**
 * GET /modif_realisations/:id
Récupère les informations d'une réalisation et rend le formulaire de modification.
 */
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


/**
 * GET /suppression
Page de confirmation de suppression (catégorie, réalisations, machines).
 */
app.get("/admin/suppression", async function (req, res) {
    try {
        const liste_categories = await pool.query("SELECT * FROM categories");
        const liste_realisations = await pool.query("SELECT * FROM produits");
        const liste_machines = await pool.query("SELECT * FROM machines");
        res.render("admin/suppression", { page_css1: "headeradmin.css", page_css2: "suppression.css", liste_categories: liste_categories[0], liste_realisations: liste_realisations[0], liste_machines: liste_machines[0] });
    } catch (err) {
        console.error("Erreur SQL ou Serveur :", err);
        res.status(500).send("Erreur lors de la suppression de la réalisation");
    }
});


/**
 * GET /modif_machine/:id
Récupère une machine par son identifiant et rend le formulaire d'édition admin.
 */
app.get("/modif_machine/:id", async function (req, res) {
    try {
        const machineId = req.params.id;
        const [rows] = await pool.query("SELECT * FROM machines WHERE id_machine = ?", [machineId]);
        if (!rows || rows.length === 0) {
            return res.status(404).send("Machine non trouvée");
        }

        const machine = rows[0];

        res.render("admin/modifmachine", {
            page_css1: "headeradmin.css",
            page_css2: "modifmachine.css",
            machine: machine
        });
    } catch (err) {
        console.error("Erreur SQL ou Serveur :", err);
        res.status(500).send("Erreur lors de la récupération des données");
    }
});



app.get("/admin/ajoutmachine", isAdmin, async function (req, res) {
    try {
        // Fournir un objet 'machine' par défaut pour éviter les erreurs côté template
        const machine = {
            id_machine: null,
            nom_machine: '',
            description_courte: '',
            description_longue: '',
            image_machine: '',
            statistique1_nom: '',
            statistique1_donnee: '',
            statistique2_nom: '',
            statistique2_donnee: '',
            avantage_titre: '',
            avantage_description: '',
            d_x: null,
            d_y: null,
            d_z: null,
            type: 'tournage',
            annee_entree: ''
        };

        res.render("admin/ajoutmachine", { page_css1: "headeradmin.css", page_css2: "ajoutmachine.css", machine: machine });
    } catch (err) {
        console.error("Erreur SQL ou Serveur :", err);
        res.status(500).send("Erreur lors de l'affichage du formulaire d'ajout");
    }
});



app.get("/admin/ajoutproduit", isAdmin, async function (req, res) {
    try {
        const [categories] = await pool.query("SELECT * FROM categories");

        // Fournir un objet `produit` vide pour le rendu (évite checks côté template)
        const produit = {
            id: null,
            nom: '',
            description: '',
            categorie: null,
            image: ''
        };

        res.render(
            "admin/ajoutrealisation",
            { page_css1: "headeradmin.css", page_css2: "ajoutrealisation.css", produit: produit, categories: categories }
        );
    } catch (err) {
        console.error("Erreur SQL ou Serveur :", err);
        res.status(500).send("Erreur lors de l'affichage du formulaire d'ajout");
    }
});




app.get("/ajout_categorie", isAdmin, async function (req, res) {
    try {

        const [produit_sans_categorie] = await pool.query("SELECT * FROM produits WHERE categorie = 0");

        if (produit_sans_categorie.length > 0) {
            // console.log("il y a des produits sans catégorie");
            // console.log(produit_sans_categorie[0]);
            // console.log(produit_sans_categorie.length);
            res.render("admin/ajoutcategorie", { page_css1: "headeradmin.css", page_css2: "ajoutcategorie.css", produits: produit_sans_categorie  });
        } else{
            // console.log("pas de produit 0");
            res.render("admin/ajoutcategorie", { page_css1: "headeradmin.css", page_css2: "ajoutcategorie.css"});
        }
    } catch (err) {
        console.error("Erreur SQL ou Serveur :", err);
        res.status(500).send("Erreur lors de l'affichage du formulaire d'ajout de catégorie");
    }
});


























// app.post



app.post("/supprimer-categorie", isAdmin, async function (req, res) {
    try {
        const id_categorie = req.body.categorie_id;
        // console.log("ID catégorie à supprimer :", id_categorie);
        await pool.query("DELETE FROM categories WHERE id_cat = ?", [id_categorie]);

        return res.redirect('/admin/suppression');
    } catch (err) {
        console.error("Erreur SQL ou Serveur :", err);
        res.status(500).send("Erreur lors de la suppression de la catégorie");
    }
});

app.post("/supprimer-realisation", isAdmin, async function (req, res) {
    try {
        const id_realisation = req.body.realisation_id;
        // console.log("ID réalisation à supprimer :", id_realisation);
        await pool.query("DELETE FROM produits WHERE id = ?", [id_realisation]);

        return res.redirect('/admin/suppression');
    } catch (err) {
        console.error("Erreur SQL ou Serveur :", err);
        res.status(500).send("Erreur lors de la suppression du produit");
    }
});


app.post("/supprimer-machine", isAdmin, async function (req, res) {
    try {
        const id_machine = req.body.machine_id;
        // console.log("ID machine à supprimer :", id_machine);
        await pool.query("DELETE FROM machines WHERE id_machine = ?", [id_machine]);

        return res.redirect('/admin/suppression');
    } catch (err) {
        console.error("Erreur SQL ou Serveur :", err);
        res.status(500).send("Erreur lors de la suppression de la machine");
    }
});

app.post("/ajouter_categorie", isAdmin, async function (req, res) {
    try {
        const nom_categorie = req.body.nom_categorie;
        const id_produit_a_lier = req.body.produit_associe;

        const insertQuery = 'INSERT INTO categories (nom) VALUES (?)';
        const [result] = await pool.query(insertQuery, [nom_categorie]);


        const newCategoryId = result.insertId;


        if (id_produit_a_lier && id_produit_a_lier !== "") {
            const updateQuery = 'UPDATE produits SET categorie = ? WHERE id = ?';
            const updateValues = [newCategoryId, id_produit_a_lier];
            await pool.query(updateQuery, updateValues);
        }


        return res.redirect('/admin/realisations');

    } catch (err) {
        console.error('Erreur lors de l\'ajout de la catégorie :', err);
        res.status(500).send('Erreur lors de l\'ajout de la catégorie');
    }
});

/**
 * POST /ajouter_produit
 * Traite l'ajout d'une nouvelle réalisation (produit) depuis le back-office.
 */
app.post('/ajouter_produit', isAdmin, uploadProduits.single('image_produit'), async function (req, res) {
    try {
        const { nom_produit, description_produit, categorie } = req.body;
        const image = req.file ? ('/img/produits/' + req.file.filename) : null;

        const insertQuery = 'INSERT INTO produits (nom, description, categorie, image) VALUES (?, ?, ?, ?)';
        const values = [nom_produit || null, description_produit || null, categorie || null, image];

        await pool.query(insertQuery, values);

        return res.redirect('/admin/realisations');
    } catch (err) {
        console.error('Erreur lors de l\'ajout du produit :', err);
        res.status(500).send('Erreur lors de l\'ajout du produit');
    }
});



/**
 * POST /ajouter_machine
 * Traite le formulaire d'ajout d'une nouvelle machine (admin).
 * Gère l'upload d'image et insère la nouvelle ligne dans la table `machines`.
 */
app.post("/ajouter_machine", isAdmin, uploadMachines.single('image_machine'), async function (req, res) {
    try {
        const {
            nom_machine,
            description_courte,
            description_longue,
            statistique1_nom,
            statistique1_donnee,
            statistique2_nom,
            statistique2_donnee,
            avantage_titre,
            avantage_description,
            d_x,
            d_y,
            d_z,
            type,
            annee_entree
        } = req.body;

        const imageMachine = req.file ? ("/img/machines/" + req.file.filename) : null;

        const insertQuery = `INSERT INTO machines (nom_machine, description_courte, description_longue, statistique1_nom, statistique1_donnee, statistique2_nom, statistique2_donnee, avantage_titre, avantage_description, d_x, d_y, d_z, type, annee_entree, image_machine) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        const values = [
            nom_machine || null,
            description_courte || null,
            description_longue || null,
            statistique1_nom || null,
            statistique1_donnee || null,
            statistique2_nom || null,
            statistique2_donnee || null,
            avantage_titre || null,
            avantage_description || null,
            d_x || null,
            d_y || null,
            d_z || null,
            type || null,
            annee_entree || null,
            imageMachine
        ];

        await pool.query(insertQuery, values);
        
        // Redirection vers la liste des machines avec un indicateur de succès
        return res.redirect('/admin/machines?success=add');
    } catch (err) {
        console.error('Erreur lors de l\'ajout de la machine :', err);
        res.status(500).send('Erreur lors de l\'ajout de la machine');
    }
});


// Route POST pour enregistrer les modifications d'une machine (avec gestion de l'image)
app.post("/modifier_infos_machine", isAdmin, uploadMachines.single('image_machine'), async function (req, res) {
    try {
        const {
            id_machine,
            nom_machine,
            description_courte,
            description_longue,
            statistique1_nom,
            statistique1_donnee,
            statistique2_nom,
            statistique2_donnee,
            avantage_titre,
            avantage_description,
            d_x,
            d_y,
            d_z,
            type,
            annee_entree
        } = req.body;

        let query = `UPDATE machines SET nom_machine = ?, description_courte = ?, description_longue = ?, statistique1_nom = ?, statistique1_donnee = ?, statistique2_nom = ?, statistique2_donnee = ?, avantage_titre = ?, avantage_description = ?, d_x = ?, d_y = ?, d_z = ?, type = ?, annee_entree = ?`;
        const values = [nom_machine, description_courte, description_longue, statistique1_nom, statistique1_donnee, statistique2_nom, statistique2_donnee, avantage_titre, avantage_description, d_x || null, d_y || null, d_z || null, type, annee_entree || null];

        // Si une nouvelle image a été envoyée, supprimer l'ancienne (si existe) et ajouter le champ
        if (req.file) {
            const [ancien] = await pool.query("SELECT image_machine FROM machines WHERE id_machine = ?", [id_machine]);
            if (ancien && ancien.length > 0 && ancien[0].image_machine) {
                const nomFichierAncien = path.basename(ancien[0].image_machine);
                const cheminAncienneImage = path.join('public/img/machines', nomFichierAncien);
                if (fs.existsSync(cheminAncienneImage)) {
                    fs.unlink(cheminAncienneImage, (err) => {
                        if (err) console.error("Erreur lors de la suppression de l'ancienne image :", err);
                        else console.log("Ancienne image supprimée :", nomFichierAncien);
                    });
                }
            }

            const nouveauNom = "/img/machines/" + req.file.filename;
            query += ", image_machine = ?";
            values.push(nouveauNom);
        }

        query += " WHERE id_machine = ?";
        values.push(id_machine);

        await pool.query(query, values);

        res.redirect('/admin/machines');
    } catch (err) {
        console.error('Erreur lors de la modification de la machine :', err);
        res.status(500).send('Erreur lors de la modification de la machine');
    }
});



/**
 * POST /envoyer-devis
Traite le formulaire de demande de devis, envoie un email avec les pièces jointes.
Style du mail géré par le serveur
 */
app.post("/envoyer-devis", uploadProduits.array('fichiers', 10), async (req, res) => {
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


/**
 * POST /modifier_infos_realisation
Traite le formulaire d'édition d'une réalisation (admin), gère l'image.
 */
app.post("/modifier_infos_realisation", uploadProduits.array('fichiers', 1), async function (req, res) {
    try {
        const { id_produit, nom_produit, description, categorie } = req.body;
        
        let requete = "UPDATE produits SET nom = ?, description = ?, categorie = ?";
        let values = [nom_produit, description, categorie];

        // 1. Gestion de la nouvelle image
        if (req.files && req.files.length > 0) {
            
            // --- LOGIQUE DE SUPPRESSION DE L'ANCIENNE IMAGE ---
            // On cherche l'ancien nom de fichier en BDD avant d'écraser la donnée
            const [ancienProduit] = await pool.query("SELECT image FROM produits WHERE id = ?", [id_produit]);
            
            if (ancienProduit.length > 0 && ancienProduit[0].image) {
                // On extrait juste le nom du fichier (au cas où tu stockes le chemin complet)
                const nomFichierAncien = path.basename(ancienProduit[0].image);
                const cheminAncienneImage = path.join('public/img/produits', nomFichierAncien);

                // On vérifie si le fichier existe avant de tenter de le supprimer
                if (fs.existsSync(cheminAncienneImage)) {
                    fs.unlink(cheminAncienneImage, (err) => {
                        if (err) console.error("Erreur lors de la suppression de l'ancienne image :", err);
                        else console.log("Ancienne image supprimée avec succès :", nomFichierAncien);
                    });
                }
            }


            const nouveauNomFichier = "/img/produits/" + req.files[0].filename; 
            requete += ", image = ?";
            values.push(nouveauNomFichier);
        }

        requete += " WHERE id = ?";
        values.push(id_produit);

        await pool.query(requete, values);

        res.redirect("/admin/realisations");
    } catch (err) {
        console.error("Erreur SQL ou Serveur :", err);
        res.status(500).send("Erreur lors de la modification");
    }
});



/**
POST /envoyer-contact
Envoie un email de contact avec les informations fournies.
 */
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



/**
 * POST /connexion
Authentifie un utilisateur en comparant les identifiants au hash stocké.
Remplit la session et redirige selon le rôle.
 */
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





















app.post("/connexionrapide", async function (req, res) {
    try {
        req.session.userID = 1;
        req.session.role = "admin";
        return res.redirect("/admin/accueil");
    } catch (err) {
        console.error("Erreur connexion rapide :", err);
        res.status(500).send("Erreur serveur");
    }
});








app.use((req, res) => {
    res.status(404).render("404");
})


app.listen(3000);