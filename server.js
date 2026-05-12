/*
 * server.js
 * Serveur Express principal de l'application.
 * - Configure les middlewares (sessions, bodyParser, static)
 * - Configure multer pour la gestion des uploads
 * - Déclare les routes publiques et admin

Lors du renvoi des différentes pages, deux pages css sont aussi renvoyées afin de permettre au serveur de ne pas se surcharger en chargeant toutes les pages CSS
*/

import express from "express";
import session from "express-session";
import crypto from "crypto";
import bodyParser from "body-parser";
import pool from "./db.js";
import multer from "multer";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import "dotenv/config";
import sha256 from "js-sha256";
import { findSourceMap } from "module";
import {generateHTML} from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';




// Multer
// --- CONFIGURATION MULTER POUR LES PRODUITS ---
const storageProduits = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/img/produits");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, "Prdt" + Date.now() + ext);
  },
});
const uploadProduits = multer({ storage: storageProduits });

// --- CONFIGURATION MULTER POUR LES MACHINES ---
const storageMachines = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/img/machines");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, "Mchn" + Date.now() + ext);
  },
});
const uploadMachines = multer({ storage: storageMachines });


const storageActu = multer.diskStorage({
  destination: (req, file, cb) =>{
    cb(null, "public/img/actus");
  },
  filename: (req, file, cb) =>{
    const ext = path.extname(file.originalname);
    cb(null, "Actu_main" + Date.now() + ext)
  },
});
const uploadActu = multer({ storage: storageActu})




// Setting d'express
// ==> sert à rendre les views
const app = express();
app.set("view engine", "ejs");

app.use(express.urlencoded({extended:true}))
app.use(express.static("public"));
app.use(express.json())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 1000, secure: false, httpOnly: true },
  }),
);

app.use((req, res, next) => {
  res.locals.userRole = req.session.userRole || null;
  next();
});

//MIDDLEWARES MAISON

/**
Middleware "authenticate"
Vérifie que l'utilisateur est authentifié (présence de "session.userID").
Si authentifié -> "next()", sinon redirige vers la page de connexion.
 */
function authenticate(req, res, next) {
  if (req.session.hasOwnProperty("userID")) {
    next();
  } else {
    res.status(403).redirect("connexion");
  }
}

/**
Middleware "isAdmin"
Vérifie que la session correspond à un administrateur.
Si oui -> "next()", sinon redirige vers la page d'accueil.
 */
function isAdmin(req, res, next) {
  if (req.session.role == "admin") {
    next();
  } else {
    res.status(403).redirect("/connexion");
  }
}

// ROUTES

// app.get

/**
GET /
Page d'accueil : redirige les administrateurs vers l'interface admin,
sinon affiche la page publique d'accueil.
*/
app.get("/", async function (req, res) {
  try {
    // regarde s'il y a des offres et affiche le bandeau dans le cas positif
    const [offres] = await pool.query("SELECT * FROM offres");
    const taille_liste_offre = offres.length
    // console.log(offres.length)
    if (req.session.role === "admin") {
      return res.redirect("/admin/accueil");
    } else {
      res.render("accueil", {
        page_css1: "headerclient.css",
        page_css2: "accueilclient.css",
        nbOffres: taille_liste_offre
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});

/**
GET /presentation
Page de présentation de l'entreprise. Rend la vue adaptée selon le rôle.
 */
app.get("/presentation", async function (req, res) {
  try {
    if (req.session.role === "admin") {
      res.redirect("admin/presentation", {
        page_css1: "presentation.css",
        page_css2: "headeradmin.css",
      });
    } else {
      res.render("presentation", {
        page_css1: "headerclient.css",
        page_css2: "presentation.css",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});

// Route publique pour lister les machines
/**
GET /machines
Route client listant toutes les machines (séparées par type).
 */
app.get("/machines", async function (req, res) {
  try {
    /* Récupération globale des machines de la BDD
        Exemple de liste : 
        [
            {
                id_machine: 3,
                nom_machine: 'Mazak Quick Turn 250MSY',
                description_courte: 'Tournage-fraisage haute productivité avec axe Y et contre-broche pour le concept Done-In-One.',
                description_longue: "Centre de tournage haute performance équipé d'une broche de fraisage, d'un axe Y et d'une broche secondaire pour un usinage complet sans reprise manuelle.",
                image_machine: '/img/machines/Mchn1776863314292.png',
                statistique1_nom: 'Diamètre de tournage max',
                statistique1_donnee: '380 mm',
                statistique2_nom: 'Vitesse outils motorisés',
                statistique2_donnee: '6.000 RPM',
                avantage_titre: 'Productivité Intégrée',
                avantage_description: 'La présence de la contre-broche (S) et des outils motorisés permet de terminer la pièce entièrement sur une seule machine.',
                d_x: '375.00',
                d_y: '100.00',
                d_z: '2500.00',
                type: 'tournage',
                annee_entree: 2024
            },
            {...}
        ]

        */
    const [machines] = await pool.query("SELECT * FROM machines");
    // Séparation des machines entre machines de tournage et de fraisage
    const machinestourneuses = machines.filter(
      (machine) => machine.type === "tournage",
    );
    //console.log(machinestourneuses);
    const machinefraiser = machines.filter(
      (machine) => machine.type === "fraisage",
    );
    //console.log(machinefraiser);
    res.render("parcmachine", {
      page_css1: "headerclient.css",
      page_css2: "parcmachine.css",
      machines: machines,
      machinestourneuses: machinestourneuses,
      machinefraiser: machinefraiser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});

// Route admin pour la gestion du parc machine (protégée)
app.get("/admin/machines", isAdmin, async function (req, res) {
  try {
    /* Récupération globale des machines de la BDD
        Exemple de liste : 
        [
            {
                id_machine: 3,
                nom_machine: 'Mazak Quick Turn 250MSY',
                description_courte: 'Tournage-fraisage haute productivité avec axe Y et contre-broche pour le concept Done-In-One.',
                description_longue: "Centre de tournage haute performance équipé d'une broche de fraisage, d'un axe Y et d'une broche secondaire pour un usinage complet sans reprise manuelle.",
                image_machine: '/img/machines/Mchn1776863314292.png',
                statistique1_nom: 'Diamètre de tournage max',
                statistique1_donnee: '380 mm',
                statistique2_nom: 'Vitesse outils motorisés',
                statistique2_donnee: '6.000 RPM',
                avantage_titre: 'Productivité Intégrée',
                avantage_description: 'La présence de la contre-broche (S) et des outils motorisés permet de terminer la pièce entièrement sur une seule machine.',
                d_x: '375.00',
                d_y: '100.00',
                d_z: '2500.00',
                type: 'tournage',
                annee_entree: 2024
            },
            {...}
        ]

        */
    const [machines] = await pool.query("SELECT * FROM machines");
    // Séparation des machines entre tournage et fraisage. Renvoie une liste
    const machinestourneuses = machines.filter(
      (machine) => machine.type === "tournage",
    );
    const machinefraiser = machines.filter(
      (machine) => machine.type === "fraisage",
    );

    const successMessage =
      req.query.success === "add"
        ? "La machine a été ajoutée avec succès !"
        : null;

    res.render("admin/parcmachine", {
      page_css1: "parcmachine.css",
      page_css2: "headeradmin.css",
      machines,
      machinestourneuses,
      machinefraiser,
      successMessage,
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
    const categorieChoisie = req.query.categorie;
    //console.log(categorieChoisie)

    let [categories] = await pool.query(
      "SELECT * FROM categories ORDER BY id_cat DESC",
    );

    let produitsResultat;
    /* 
        La catégorie  "-2" correspond à "autres".
        -2 a été sélectionné pour ne pas rentrer au conflit avec les id des catégories incrémentés automatiquement
        */
    if (categorieChoisie == -2) {
      const [rows] = await pool.query(
        "SELECT * FROM produits WHERE categorie NOT IN (SELECT id_cat FROM categories);",
      );
      //console.log(rows)
      produitsResultat = rows;
    } else if (categorieChoisie && categorieChoisie !== "all") {
      /*
        Sinon, si une catégorie a été choisie et qu'elle n'équivaut pas à "all" (tous)
        */
      const [rows] = await pool.query(
        "SELECT * FROM produits WHERE categorie = ?",
        [categorieChoisie],
      );
      produitsResultat = rows;
    }

    // Si la catégorie sélectionnée équivaut à "all"
    else {
      const [rows] = await pool.query("SELECT * FROM produits");
      produitsResultat = rows;
    }

    // Définir le premier produit de la liste pour les visiteurs sur ordinateurs (pour la mise en page)
    const produit1 = produitsResultat.length > 0 ? produitsResultat[0] : null;

    // On récupère aussi tout les produits
    const produitsSuivants = produitsResultat;

    res.render("realisations", {
      page_css1: "headerclient.css",
      page_css2: "realisationclient.css",
      produits: produitsSuivants,
      produit1: produit1,
      categories: categories,
      categorieChoisie: categorieChoisie || "all",
    });
  } catch (err) {
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
    // On récupère les dimensions max des machines
    const [dimensions] = await pool.query(
      "SELECT MAX(d_x) as max_x, MAX(d_y) as max_y, MAX(d_z) as max_z FROM machines",
    );
    res.render("devis", {
      page_css1: "headerclient.css",
      page_css2: "devis.css",
      maxDimensions: dimensions[0],
      role: req.session.role,
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
    res.render("contact", {
      page_css1: "headerclient.css",
      page_css2: "contact.css",
      success: null,
      error: null,
    });
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
    res.render("connexion", {
      page_css1: "connexion.css",
      page_css2: "headerclient.css",
    });
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
    res.render("mentions", {
      page_css1: "mentions.css",
      page_css2: "headerclient.css",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});


/*
GET /offres
Renvoie la page listant toutes les offres d'emploi disponibles sur le moment 
Gère le choix des catégories par l'utilisateur
Gère que la quantité do'ffre par catégorie et la distribution de ces dernières
*/
app.get("/offres", async function (req, res) {
  try {
    // Récupération de la catégorie envoyée par l'utilisateur dans la requête
    const categorieChoisie = req.query.categorie;
    // Initialisation
    let offresResultat;

    // S'il y a une catégorie et qu'on ne demande pas TOUTES les offres
    if (categorieChoisie && categorieChoisie !== "all") {
      const [rows] = await pool.query(
        "SELECT * FROM offres WHERE categorie = ? ORDER BY offre_id ASC",
        [categorieChoisie],
      );
      offresResultat = rows;
    } else {
      const [rows] = await pool.query("SELECT * FROM offres ORDER BY offre_id ASC");
      offresResultat = rows;
    }


    // Quantité
    const [categories] = await pool.query(
      "SELECT categorie, COUNT(*) AS nombre_offres FROM offres GROUP BY categorie",
    );

    res.render("offres", {
      page_css1: "offres.css",
      page_css2: "headerclient.css",
      offres: offresResultat,
      categories: categories,
      categorieChoisie: categorieChoisie || "all",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});

/*
GET /offre/:id
Renvoie les informations concernant une offre d'emploi
Récupère l'id de l'offre dans la requête, puis récupère les infos dans la bdd grace à cet id
*/

app.get("/offre/:id", async function (req, res) {
  try {
    const offre_id = req.params.id;
    const [offre] = await pool.query(
      "SELECT * FROM offres WHERE offre_id = ?",
      [offre_id],
    );

    //console.log(offre[0]);
    res.render("offre", {
      offre: offre[0],
      page_css1: "offre.css",
      page_css2: "headerclient.css",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});



/*
GET postuler/:id
Renvoie l'utilisateur vers la page d'envoi pour postuler sur l'offre
*/
app.get("/postuler/:id", async function (req, res) {
  try {
    const offre_id = req.params.id;
    const [offre] = await pool.query(
      "SELECT * FROM offres WHERE offre_id = ?",
      [offre_id],
    );
    // console.log(offre)
    res.render("cv", {
      offre: offre[0],
      page_css1: "cv.css",
      page_css2: "headerclient.css",
    });
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
    res.render("tests", {
      page_css1: "tests.css",
      page_css2: "headerclient.css",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});

/**
 * GET /admin/accueil
Tableau de bord administrateur (page d'accueil admin).
 */
app.get("/admin/accueil", isAdmin, async function (req, res) {
  try {
    res.render("admin/accueil", {
      page_css1: "accueiladmin.css",
      page_css2: "headeradmin.css",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});

/**
 * GET /admin/presentation
Page admin pour modifier la page de présentation publique.
 */
app.get("/admin/presentation", isAdmin, async function (req, res) {
  try {
    res.render("admin/presentation", {
      page_css1: "presentation.css",
      page_css2: "headeradmin.css",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});

/**
 * GET /admin/realisations
Version administrateur du listing des réalisations (avec options de gestion).
 */
app.get("/admin/realisations", isAdmin, async function (req, res) {
  try {
    // Récupération de la catégorie demandé par l'utilisateur ("all", "-2", "1", "2")
    const categorieChoisie = req.query.categorie;

    // Récupération de toutes les catégories
    const [categories] = await pool.query(
      "SELECT * FROM categories ORDER BY id_cat DESC",
    );

    // Initialisation de la variable qui va contenir les produits demandés
    let produitsResultat;

    // si la catégorie demandée est "autres"
    if (categorieChoisie == -2) {
      //récupération des produits et ajout dans la variable produitsResultat
      const [rows] = await pool.query(
        "SELECT * FROM produits WHERE categorie NOT IN (SELECT id_cat FROM categories);",
      );
      produitsResultat = rows;
    }

    // S'il y a une catégorie et qu'elle n'équivaut pas à "tous"
    if (categorieChoisie && categorieChoisie !== "all") {
      const [rows] = await pool.query(
        "SELECT * FROM produits WHERE categorie = ?",
        [categorieChoisie],
      );
      produitsResultat = rows;
    }

    // "Tous"
    else {
      const [rows] = await pool.query("SELECT * FROM produits");
      produitsResultat = rows;
    }

    // Définition du premier produit (utile pour les utilisateurs sur ordinateur)
    const produit1 = produitsResultat.length > 0 ? produitsResultat[0] : null;
    // Définition de tout les produits
    const produitsSuivants = produitsResultat;

    res.render("admin/realisations", {
      page_css1: "headeradmin.css",
      page_css2: "realisationclient.css",
      produits: produitsSuivants,
      produit1: produit1,
      categories: categories,
      categorieChoisie: categorieChoisie || "all",
    });
  } catch (err) {
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
    // Déconnexion ==> S'il y a une erreur, renvoyer un message serveur pour avertir l'utilisateur, sinon, rediriger l'utilisateur vers la page d'accueil
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
Récupération des dimensions maximales des machines (capacité maximale) et renvoie de ces dernières sous format JSON
 */
app.get("/api/max-dimensions", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT MAX(d_x) as max_x, MAX(d_y) as max_y, MAX(d_z) as max_z FROM machines",
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});

/**
 * GET /modif_realisations/:id
Récupère les informations d'une réalisation et rend le formulaire de modification.
 */
app.get("/modif_realisations/:id", isAdmin, async function (req, res) {
  try {
    const produitId = req.params.id;
    const [produit] = await pool.query("SELECT * FROM produits WHERE id = ?", [
      produitId,
    ]);
    const categorieId = produit[0].categorie;
    const [categories] = await pool.query(
      "SELECT nom FROM categories WHERE id_cat = ?",
      [categorieId],
    );
    const listeCategories = await pool.query("SELECT * FROM categories");
    res.render("admin/modifrealisation", {
      page_css1: "headeradmin.css",
      page_css2: "modif_realisations.css",
      produit: produit[0],
      categories: categories[0].nom,
      listeCategories: listeCategories[0],
    });
  } catch (err) {
    console.error("Erreur SQL ou serveur :", err);
    res.status(500).send("Erreur lors de la récupération des données");
  }
});

/**
 * GET /suppression
Page de confirmation de suppression (catégorie, réalisations, machines).
 */
app.get("/admin/suppression", isAdmin, async function (req, res) {
  try {
    const liste_categories = await pool.query("SELECT * FROM categories");
    const liste_realisations = await pool.query("SELECT * FROM produits");
    const liste_machines = await pool.query("SELECT * FROM machines");
    res.render("admin/suppression", {
      page_css1: "headeradmin.css",
      page_css2: "suppression.css",
      liste_categories: liste_categories[0],
      liste_realisations: liste_realisations[0],
      liste_machines: liste_machines[0],
    });
  } catch (err) {
    console.error("Erreur SQL ou Serveur :", err);
    res.status(500).send("Erreur lors de la suppression de la réalisation");
  }
});

/**
 * GET /modif_machine/:id
Récupère une machine par son identifiant et rend le formulaire d'édition admin.
 */
app.get("/modif_machine/:id", isAdmin, async function (req, res) {
  try {
    const machineId = req.params.id;
    const [rows] = await pool.query(
      "SELECT * FROM machines WHERE id_machine = ?",
      [machineId],
    );
    if (!rows || rows.length === 0) {
      return res.status(404).send("Machine non trouvée");
    }

    const machine = rows[0];

    res.render("admin/modifmachine", {
      page_css1: "headeradmin.css",
      page_css2: "modifmachine.css",
      machine: machine,
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
      nom_machine: "",
      description_courte: "",
      description_longue: "",
      image_machine: "",
      statistique1_nom: "",
      statistique1_donnee: "",
      statistique2_nom: "",
      statistique2_donnee: "",
      avantage_titre: "",
      avantage_description: "",
      d_x: null,
      d_y: null,
      d_z: null,
      type: "tournage",
      annee_entree: "",
    };

    res.render("admin/ajoutmachine", {
      page_css1: "headeradmin.css",
      page_css2: "ajoutmachine.css",
      machine: machine,
    });
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
      nom: "",
      description: "",
      categorie: null,
      image: "",
    };

    res.render("admin/ajoutrealisation", {
      page_css1: "headeradmin.css",
      page_css2: "ajoutrealisation.css",
      produit: produit,
      categories: categories,
    });
  } catch (err) {
    console.error("Erreur SQL ou Serveur :", err);
    res.status(500).send("Erreur lors de l'affichage du formulaire d'ajout");
  }
});

app.get("/ajout_categorie", isAdmin, async function (req, res) {
  try {
    const [produit_sans_categorie] = await pool.query(
      "SELECT * FROM produits WHERE categorie NOT IN (SELECT id_cat FROM categories)",
    );

    if (produit_sans_categorie.length > 0) {
      // console.log("il y a des produits sans catégorie");
      // console.log(produit_sans_categorie[0]);
      // console.log(produit_sans_categorie.length);
      res.render("admin/ajoutcategorie", {
        page_css1: "headeradmin.css",
        page_css2: "ajoutcategorie.css",
        produits: produit_sans_categorie,
      });
    } else {
      // console.log("pas de produit 0");
      res.render("admin/ajoutcategorie", {
        page_css1: "headeradmin.css",
        page_css2: "ajoutcategorie.css",
      });
    }
  } catch (err) {
    console.error("Erreur serveur ou SQL :", err);
    res
      .status(500)
      .send("Erreur lors de l'affichage du formulaire d'ajout de catégorie");
  }
});

app.get("/admin/profil", isAdmin, async function (req, res) {
  try {
    const userId = req.session.userID;
    const [rows] = await pool.query("SELECT * FROM utilisateurs WHERE id = ?", [
      userId,
    ]);
    if (!rows || rows.length === 0) {
      return res.status(404).send("Utilisateur non trouvé");
    }
    const user = rows[0];
    //console.log(user);
    res.render("admin/profil", {
      page_css1: "headeradmin.css",
      page_css2: "profil.css",
      user: user,
    });
  } catch (err) {
    console.error("Erreur SQL ou Serveur :", err);
    res.status(500).send("Erreur lors de l'affichage du profil");
  }
});

app.get("/admin/offres", isAdmin, async function (req, res) {
  try {
    const categorieChoisie = req.query.categorie;

    let offresResultat;

    if (categorieChoisie && categorieChoisie !== "all") {
      const [rows] = await pool.query(
        "SELECT * FROM offres WHERE categorie = ? ORDER BY offre_id ASC",
        [categorieChoisie],
      );
      offresResultat = rows;
    } else {
      const [rows] = await pool.query("SELECT * FROM offres ORDER BY offre_id ASC");
      offresResultat = rows;
    }

    const [categories] = await pool.query(
      "SELECT categorie, COUNT(*) AS nombre_offres FROM offres GROUP BY categorie",
    );

    res.render("admin/offres", {
      page_css1: "offres.css",
      page_css2: "headeradmin.css",
      offres: offresResultat,
      categories: categories,
      categorieChoisie: categorieChoisie || "all",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});


app.get("/ajoutoffre", isAdmin, async function(req,res){
  const [offres] = await pool.query("SELECT * FROM offres")
  // console.log(offres)
  const user_id = req.session.userID
  // console.log("ID utilisateur : ", user_id)
  const [username] = await pool.query("SELECT identifiant FROM utilisateurs WHERE id = ?", [user_id])
  const [types] = await pool.query("SELECT DISTINCT type FROM offres");
  // console.log(types[1].type)
  const [pres] = await pool.query("SELECT DISTINCT presentation FROM offres");
  const presentation = pres[0].presentation
  //console.log(presentation[0].presentation)

  const [categoriesData] = await pool.query("SELECT DISTINCT categorie FROM offres");
  const categories = categoriesData.map(cat => cat.categorie);

  //console.log(username[0].identifiant)
  res.render("admin/ajoutoffre", {
    offres:offres, 
    page_css1:"headeradmin.css", 
    page_css2:"ajoutoffre.css", 
    username:username[0].identifiant, 
    types:types, 
    presentation:presentation,
    categories:categories
  })
})


app.get("/actualites", async function(req,res){
  const [actualites] = await pool.query("SELECT * FROM actualite ORDER BY date_publication DESC LIMIT 99999 OFFSET 1");
  //console.log(actualites);
  const [une] = await pool.query("SELECT * FROM actualite ORDER BY date_publication DESC LIMIT 1");
  // console.log(une)
  const actu_une = une[0];

  res.render("actualite_liste", {
    page_css1:"headerclient.css",
    page_css2:"actualite-liste.css",
    une: actu_une,
    actus:actualites
  })
});



app.get("/articles/:id", (req,res) => {
  const file = fs.readFileSync(
    `articles/${req.params.id}.json`
  );
  const article = JSON.parse(file);

  const html = generateHTML(article.content, [StarterKit])

  res.render('actualite', {
    article: article,
    content:html
  })
})





app.get("/ajoutarticle", isAdmin, async function(req,res){


  res.render("admin/ajoutarticle", {
    page_css1:"ajoutarticle.css",
    page_css2:"headeradmin.css"
   })
})


app.get("/actualite/:id", async function(req,res){
  const [rows] = await pool.query("SELECT * FROM actualite WHERE id = ?", [req.params.id])

  const article = rows[0];
  res.render('actualite', {
    article
  })
})

app.get("/admin/actu", async function(req,res){
  const [actualites] = await pool.query("SELECT * FROM actualite ORDER BY date_publication DESC LIMIT 99999 OFFSET 1");
  //console.log(actualites);
  const [une] = await pool.query("SELECT * FROM actualite ORDER BY date_publication DESC LIMIT 1");
  // console.log(une)
  const actu_une = une[0];

  res.render("admin/actualite_liste", {
    page_css1:"headeradmin.css",
    page_css2:"actualite-liste.css",
    une: actu_une,
    actus:actualites
  })
})
















// app.post




app.post("/supprimerArticle", isAdmin, async function(req,res){
  const idNews = req.body.id;
  // console.log(idNews);
  await pool.query("DELETE FROM actualite WHERE id = ?", [idNews])

  res.redirect("/admin/actu")
})




app.post("/api/articles", isAdmin, uploadActu.single("presentation"), async function(req, res) {
  /*
  titre = titre de l'article
  contenu = contenu de l'article (récupéré sous forme de HTML (
    "<h1> ... </h1>
     <p> ... </p> 
     ..."
    ))

  presentation = image de presentation (image principale)
  baseline = courte description 

  Le tout est envoyé dans la BDD (table actualites)

  date_publication et redacteur créés dans l'appel à l'API
  */

  const { titre, baseline, contenu } = req.body;
  const presentation = req.file ? "/img/actus/" + req.file.filename : null;

  // Validation serveur
  if (!titre || !contenu || !presentation || !baseline) {
    return res.status(400).json({ success: false, message: 'Tous les champs sont obligatoires.' });
  }

  try {
    const date = new Date();
    const redacteur_id = req.session.userID;
    const [redacteurs] = await pool.query(
      "SELECT identifiant FROM utilisateurs WHERE id = ?", [redacteur_id]
    );
    const redacteur = redacteurs[0].identifiant;

    await pool.query(`
      INSERT INTO actualite (contenu, date_publication, redacteur, titre, baseline, img_presentation)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [contenu, date, redacteur, titre, baseline, presentation]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Erreur SQL :", err);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});


app.post("/newsletter_add", async function(req,res){
  try{
    const email = req.body.mail
    const date = new Date()
    // console.log(email);
    const [rows] = await pool.query("SELECT * FROM abonnement WHERE email = ?", [email])
    // console.log(rows)

    if (rows.length > 0){
      const abonnement = rows[0];
      if (abonnement.actif){
          return res.status(200).json({
                    success: false,
                    message: "Cette adresse mail est déjà abonnée."
                });
      } else{
        await pool.query("UPDATE abonnement SET actif = true WHERE email = ?", [email]);
        return res.status(200).json({
          success:true,
          message:"Abonnement réactivé"
        })
      }
    } else{
      await pool.query("INSERT INTO abonnement (email, date_abonnement, actif) VALUES (?, ?, true)", [email,date])
      return res.status(200).json({
        success:true,
        message:"Vous êtes maintenant abonné à la Newsletter"
      })
    }
    
  } catch(err){
      console.error("Erreur SQL ou serveur : ", err);

      return res.status(500).json({
        success: false,
        message: "Erreur lors de l'abonnement à la Newsletter"
      });
    }
})

app.post("/article", async function(req,res){
  try{
    const id = req.body.id;
    //console.log(id);
    const [article] = await pool.query("SELECT * FROM actualite WHERE id = ?", [id]);
    // console.log(article);

    const [autres] = await pool.query("SELECT * FROM actualite WHERE id != ? LIMIT 2", [id])
    res.render("actualite", {
      page_css1:"actualite.css",
      page_css2:"headerclient.css",
      article:article[0],
      autres: autres
    })

  } catch (err){
    console.error("Erreur SQL ou serveru : ", err);
    res.status(500).send("Erreur lors de la récupération de l'article")
  }
})


/* Route post qui permet d'arriver sur une offre d'emploi précise
l'id de l'offre est passée en paramètre d'URL, puis récupéré
Grâce à l'id récupéré, on trouve tout les détails de l'offre dans la bdd, puis on les envoie avec la page
Attention -> Différence entre "offre" et "offres". 
"offre" renvoie une seule offre avec toute les infos la correspondantes
"offres" (avec un "s") renvoie la page listant toutes les offres disponibles
*/

app.post("/consulter_offre", async function (req, res) {
  try {
    const id = req.body.offre_id;
    // console.log(id)
    const [offres] = await pool.query(
      "SELECT * FROM offres where offre_id = ?",
      [id],
    );
    const offre = offres[0];


    // récupérationde "l'enabilité" des sections plus secondaires
    const methodeEnable = offre.MethodeEnable;
    const infosEnable = offre.InfosEnable;
    const salaireEnable = offre.SalaireEnable;
    const recrutementEnable = offre.RecrutementEnable;
    const avantageEnable = offre.AvantageEnable;


    //console.log(offre);
    res.render("offre", {
      offre: offre,
      page_css1: "offre.css",
      page_css2: "headeradmin.css",
      methodeE: methodeEnable,
      infosE:infosEnable,
      salaireE:salaireEnable,
      recrutementE:recrutementEnable,
      avantageE:avantageEnable
    });
  } catch (err) {
    console.error("Erreur SQL ou serveur : ", err);
    res.status(500).send("Erreur lors de la consultation de l'offre");
  }
});

app.post("/ajouteroffre", async function(req,res){

  //cconsole.log(req.body)

  // Récupération des paramètres
  
  const intitule = req.body.intitule;
  const type = req.body["type-offre"];
  const location = req.body.localisation;
  const salaire = req.body.salaire;
  const presentation = req.body.presentation;
  const missions = req.body.missions;
  const competences = req.body.competences;
  const avantage = req.body.avantage;
  const recrutement = req.body.recrutement;
  const complementaire = req.body.complementaire;
  const methode = req.body.methode;
  let salaireEnable = req.body["salaire-switch"]
  let methodeEnable = req.body["methode-switch"]
  let avantageEnable = req.body["avantage-switch"]
  let recrutementEnable = req.body["recrutement-switch"]
  let infosEnable = req.body["infos-switch"]
  

  // console.log(infosEnable);

  let categorie = req.body.categorie;

  if(categorie === "autre"){
    categorie = req.body.nouvelleCategorie;
  }

  const today = new Date();

  // On récupère chaque élément et on s'assure qu'ils ont 2 chiffres avec padStart(2, '0')
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0'); // Janvier est 0 !
  const dd = String(today.getDate()).padStart(2, '0');

  const hh = String(today.getHours()).padStart(2, '0');
  const min = String(today.getMinutes()).padStart(2, '0');
  const ss = String(today.getSeconds()).padStart(2, '0');

  const formattedDate = `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
  // console.log(formattedDate);



  // transformer les "on" / "off" en booleen
  if (infosEnable == "on"){
    infosEnable = 1
  } else{
    infosEnable = 0
  }

  if (recrutementEnable == "on"){
    recrutementEnable = 1
  } else{
    recrutementEnable = 0
  }

  if (avantageEnable == "on"){
    avantageEnable = 1
  } else{
    avantageEnable = 0
  }

  if (methodeEnable == "on"){
    methodeEnable = 1
  } else{
    methodeEnable = 0
  }

  if (salaireEnable == "on"){
    salaireEnable = 1
  } else{
    salaireEnable = 0
  }

  //console.log(salaireEnable);

  


  // Trouver le plus petit ID disponible
  const [liste_ids] = await pool.query("SELECT offre_id FROM offres ORDER BY offre_id ASC");

  let id_final = 1;
  for (const element of liste_ids) {
      if (element.offre_id !== id_final) {
          break;
      }
      id_final++;
  }

  // Une seule requête, on spécifie toujours l'id
  const requete = `INSERT INTO offres 
      (offre_id, intitule, type, localisation, salaire, SalaireEnable, presentation, missions, 
      competences, avantages, AvantageEnable, recrutement, RecrutementEnable, Infos_complementaires, InfosEnable, date_creation, 
      mode_travail, MethodeEnable, categorie) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  await pool.query(requete, [
      id_final, intitule, type, location, salaire, salaireEnable, presentation, missions,
      competences, avantage, avantageEnable, recrutement, recrutementEnable, complementaire, infosEnable, formattedDate, methode, methodeEnable, categorie
  ]);
  


 res.redirect("/ajoutoffre")
})


app.post('/confirmer_modif/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    // console.log(req.body);


    const {
      intitule,
      type,
      presentation,
      missions,
      competences,
      avantages,
      recrutement,
      infos_complementaires
    } = req.body;

    // console.log("nouvelle missions : ",missions)



    /*
    Afin de n'actualiser que la section concernée, on test si chacun est différentde ce qui est stocké dans la bdd

    Je vais être honnête, les conditions (if) n'apportent apparemment rien étant donné que 
    tout les console.log s'effectuent lorsque je modifies une seule section de l'offre.
    Seul problème : j'ai modifié plein de trucs en même temps, donc je ne sais pas si les if ont aidé ou non

    Si vous voyez ce message, ca ve ut surement dire que je n'ai pas eu le temps ou le courage de confirmer l'utilité 
    des "if" utilisés ci-dessous
    */


    // missions

        const [old_miss] = await pool.query("SELECT missions FROM offres WHERE offre_id = ?", [id]);
        const ancienne_missions = old_miss[0].missions
        // console.log("Ancienne missions : ", ancienne_missions)
        // console.log(ancienne_missions);
        if (ancienne_missions !== missions){
          await pool.query(`UPDATE offres SET 
                              missions = ? 
                              WHERE offre_id = ?`, 
                              [missions, id]);
          // console.log("Les missions ont été modifiées")
        };


    // competences

        const [old_comp] = await pool.query("SELECT competences FROM offres WHERE offre_id = ?", [id]);
        const ancienne_competences = old_comp[0].competences;
        if (ancienne_competences !== competences){
          await pool.query(`UPDATE offres SET 
                              competences = ? 
                              WHERE offre_id = ?`, 
                              [competences, id])
          //console.log("Les compétences ont été modifiées");
        };


    // avantages

        const [old_advantage] = await pool.query("SELECT avantages FROM offres WHERE offre_id = ?", [id])
        const ancien_avantage = old_advantage[0].avantages
        if (ancien_avantage !== avantages){
          await pool.query(`UPDATE offres SET 
                              avantages = ? 
                              WHERE offre_id = ?`, 
                              [avantages, id]);
          //console.log("Les avantages ont été modifiés");
        };


    // recrutements

        const [old_recruit] = await pool.query("SELECT recrutement FROM offres WHERE offre_id = ?", [id]);
        const ancien_recrutement = old_recruit[0].recrutement;
        if (ancien_recrutement !== recrutement){
          await pool.query(`UPDATE offres SET 
                              recrutement = ? 
                              WHERE offre_id = ?`, 
                              [recrutement, id]);
          // console.log("Le process de recrutement a été modifié")
        };


    // informations complémentaires

        const [old_infos] = await pool.query("SELECT infos_complementaires FROM offres WHERE offre_id = ?", [id]);
        const ancienne_infos = old_infos[0].infos_complementaires;
        if (ancienne_infos !== infos_complementaires){
          await pool.query(`UPDATE offres SET 
                              infos_complementaires = ? 
                              WHERE offre_id = ?`, 
                              [infos_complementaires, id]);
          //console.log("Les informations complémentaires ont bien été modifiées");
        };


    //  presentation

        const [old_pres] = await pool.query("SELECT presentation FROM offres WHERE offre_id = ?", [id])
        const ancienne_presentation = old_pres[0].presenation;
        if (ancienne_presentation !== presentation){
          await pool.query(`UPDATE offres SET
                              presentation = ?`,
                            [presentation]);
        };


    // intitule
        
        const [old_int] = await pool.query("SELECT intitule FROM offres WHERE offre_id = ?", [id]);
        const ancien_intitule = old_int[0].intitule;
        if (ancien_intitule !== intitule){
          await pool.query(`UPDATE offres SET
                              intitule = ?
                              WHERE offre_id = ?`,
                            [intitule, id]);
        };


    // Type

        const [old_type] = await pool.query("SELECT type FROM offres WHERE offre_id = ?", [id]);
        const ancien_type = old_int[0].type;
        if (ancien_type !== type){
          await pool.query(`UPDATE offres SET
                              type = ?
                              WHERE offre_id = ?`,
                            [type, id]);
        };


    /*
    
    Requête originale

    await pool.query(`
      UPDATE offres SET
        missions = ?,
        competences = ?,
        avantages = ?,
        recrutement = ?,
        infos_complementaires = ?
      WHERE offre_id = ?
    `, [missions, competences, avantages, recrutement, infos_complementaires, id]);



      Deuxième requête originale

        UPDATE offres SET
          intitule = ?,
          type = ?,
          presentation = ?,
          missions = ?,
          competences = ?,
          avantages = ?,
          recrutement = ?,
          infos_complementaires = ?
        WHERE offre_id = ?
      `, [intitule, type, presentation, missions, competences, avantages, recrutement, infos_complementaires, id]);


    */


    res.redirect('/admin/offres');

  } catch (err) {
    console.error("Erreur modif offre :", err);
    res.status(500).send("Erreur serveur");
  }
});


app.post("/admin/consulter_offre", async function (req, res) {
  try {
    const id = req.body.offre_id;
    // console.log(id)
    const [offres] = await pool.query(
      "SELECT * FROM offres where offre_id = ?",
      [id],
    );
    const offre = offres[0];
    //console.log(offre);


    // récupération de "l'enabilité" des sections plus secondaires
    const methodeEnable = offre.MethodeEnable;
    const infosEnable = offre.InfosEnable;
    const salaireEnable = offre.SalaireEnable;
    const recrutementEnable = offre.RecrutementEnable;
    const avantageEnable = offre.AvantageEnable;



    res.render("admin/offre", {
      offre: offre,
      page_css1: "offre.css",
      page_css2: "headeradmin.css",
      methodeE:methodeEnable,
      infosE:infosEnable,
      salaireE:salaireEnable,
      recrutementE:recrutementEnable,
      avantageE:avantageEnable
    });
  } catch (err) {
    console.error("Erreur SQL ou serveur : ", err);
    res.status(500).send("Erreur lors de la consultation de l'offre");
  }
});

/* Route POST qui permet d'arriver sur la page de modification de l'offre

*/
app.post("/modifier_offre_access", async function (req, res) {
  try {
    const id = req.body.offre_id;
    const [offre_format_liste] = await pool.query(
      "SELECT * FROM offres WHERE offre_id = ?",
      [id],
    );
    const offre = offre_format_liste[0];
    //console.log(offre);
    res.render("admin/modifoffres", {
      offre: offre,
      page_css1: "offre.css",
      page_css2: "headeradmin.css",
      page_css3: "modifoffre.css",
    });
  } catch (err) {
    console.error("Erreur SQL ou serveur : ", err);
    res
      .status(500)
      .send(
        "Erreur lors de la tentative de rejoindre la page de modification de l'offre",
      );
  }
});

app.post("/supprimer_offre", async function (req, res) {
  try {
    const id = req.body.offre_id;
    const requete = "DELETE FROM offres WHERE offre_id = ?";
    await pool.query(requete, [id]);

    res.redirect("/admin/offres");
  } catch (err) {
    console.error("Erreur SQL ou serveur : ", err);
    res.status(500).send("Erreur lors de la suppression de l'offre");
  }
});

// Modifications infos profil (identifiant, email, téléphone, mot de passe)
/*
Vérifie que l'utilisateur est admin (middleware isAdmin)
    - Récupère l'ID de l'utilisateur connect via la session
    - Récupère les données envoyées par le formulaire (ancien ID + nouvel identifiant)
    - Si aucun changement, redirige vers le profil
    - Sinon, met à jour l'identifiant en base de données
*/
app.post("/modifier-id", isAdmin, async function (req, res) {
  try {
    const ID = req.session.userID;
    const nouvel_identifiant = req.body.identifiant;

    // Récupérer l'ancien identifiant depuis la BDD serait encore plus propre
    if (!nouvel_identifiant) {
      return res.redirect("/admin/profil");
    }

    await pool.query("UPDATE utilisateurs SET identifiant = ? WHERE id = ?", [
      nouvel_identifiant,
      ID,
    ]);

    return res.redirect("/admin/profil");
  } catch (err) {
    console.error("Erreur SQL ou serveur : ", err);
    res.status(500).send("Erreur lors de la modification de l'identifiant.");
  }
});

app.post("/modifier-email", isAdmin, async function (req, res) {
  try {
    const userId = req.session.userID;
    const ancien_email = req.body.ancien_mail;
    const nouveau_email = req.body.email;
    if (nouveau_email == ancien_email) {
      res.redirect("/admin/profil");
    }
    await pool.query("UPDATE utilisateurs SET mail = ? WHERE id = ?", [
      nouveau_email,
      userId,
    ]);
    return res
      .status(200)
      .send(
        "Email modifié avec succès ! <br><a href='/admin/profil'>Retourner au profil</a>",
      );
  } catch (err) {
    console.error("Erreur SQL ou Serveur :", err);
    res.status(500).send("Erreur lors de la modification de l'email");
  }
});

app.post("/modifier-telephone", isAdmin, async function (req, res) {
  try {
    const userId = req.session.userID;
    const ancien_telephone = req.body.ancien_telephone;
    const nouveau_telephone = req.body.telephone;

    if (nouveau_telephone == ancien_telephone) {
      res.redirect("/admin/profil");
    }

    await pool.query("UPDATE utilisateurs SET telephone = ? WHERE id = ?", [
      nouveau_telephone,
      userId,
    ]);
    return res
      .status(200)
      .send(
        "Numéro de téléphone modifié avec succès ! <br><a href='/admin/profil'>Retourner au profil</a>",
      );
  } catch (err) {
    console.error("Erreur SQL ou Serveur :", err);
    res
      .status(500)
      .send("Erreur lors de la modification du numéro de téléphone");
  }
});

app.post("/modifier-mot-de-passe", isAdmin, async function (req, res) {
  try {
    const userId = req.session.userID;
    const ancien_motdepasse = req.body.motdepasse;
    const hashed = sha256(ancien_motdepasse);
    const [rows] = await pool.query(
      "SELECT password from utilisateurs WHERE id = ?",
      [userId],
    );
    const nouveau_motdepasse = req.body.nouveau_motdepasse;
    const confirm_motdepasse = req.body.confirm_motdepasse;

    if (nouveau_motdepasse == ancien_motdepasse) {
      return res
        .status(400)
        .send(
          "Votre nouveau mot de passe doit être différent de l'ancien. Veuillez le modifier. <br><a href='/admin/profil'>Retourner au profil</a>",
        );
    }

    if (hashed == rows[0].password) {
      if (nouveau_motdepasse === confirm_motdepasse) {
        const nouveau_hashed = sha256(nouveau_motdepasse);
        const nouveau_hashed2 = sha256(nouveau_hashed);
        //console.log(nouveau_hashed2);

        await pool.query("UPDATE utilisateurs SET password = ? WHERE id = ?", [
          nouveau_hashed,
          userId,
        ]);
        return res
          .status(200)
          .send(
            "Mot de passe modifié avec succès ! <br><a href='/admin/profil'>Retourner au profil</a>",
          );
      } else {
        return res
          .status(400)
          .send(
            "Le nouveau mot de passe et sa confirmation ne correspondent pas. Veuillez réessayer. <br><a href='/admin/profil'>Retourner au profil</a>",
          );
      }
    } else {
      return res
        .status(400)
        .send(
          "Votre ancien mot de passe ne correspond pas. Veuillez réessayer. <br><a href='/admin/profil'>Retourner au profil</a>",
        );
    }
  } catch (err) {
    console.error("Erreur SQL ou Serveur :", err);
    res.status(500).send("Erreur lors de la modification du mot de passe");
  }
});

app.post("/supprimer-categorie", isAdmin, async function (req, res) {
  try {
    const id_categorie = req.body.categorie_id;
    // console.log("ID catégorie à supprimer :", id_categorie);
    await pool.query("DELETE FROM categories WHERE id_cat = ?", [id_categorie]);

    return res.redirect("/admin/suppression");
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

    return res.redirect("/admin/suppression");
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

    return res.redirect("/admin/suppression");
  } catch (err) {
    console.error("Erreur SQL ou Serveur :", err);
    res.status(500).send("Erreur lors de la suppression de la machine");
  }
});

app.post("/ajouter_categorie", isAdmin, async function (req, res) {
  try {
    const nom_categorie = req.body.nom_categorie;
    const id_produit_a_lier = req.body.produit_associe;

    const insertQuery = "INSERT INTO categories (nom) VALUES (?)";
    const [result] = await pool.query(insertQuery, [nom_categorie]);

    const newCategoryId = result.insertId;

    if (id_produit_a_lier && id_produit_a_lier !== "") {
      const updateQuery = "UPDATE produits SET categorie = ? WHERE id = ?";
      const updateValues = [newCategoryId, id_produit_a_lier];
      await pool.query(updateQuery, updateValues);
    }

    return res.redirect("/admin/realisations");
  } catch (err) {
    console.error("Erreur lors de l'ajout de la catégorie :", err);
    res.status(500).send("Erreur lors de l'ajout de la catégorie");
  }
});

/**
 * POST /ajouter_produit
 * Traite l'ajout d'une nouvelle réalisation (produit) depuis le back-office.
 */
app.post("/ajouter_produit",isAdmin,uploadProduits.single("image_produit"),async function (req, res) {
    try {
      const { nom_produit, description_produit, categorie } = req.body;
      const image = req.file ? "/img/produits/" + req.file.filename : null;

      const insertQuery =
        "INSERT INTO produits (nom, description, categorie, image) VALUES (?, ?, ?, ?)";
      const values = [
        nom_produit || null,
        description_produit || null,
        categorie || null,
        image,
      ];

      await pool.query(insertQuery, values);

      return res.redirect("/admin/realisations");
    } catch (err) {
      console.error("Erreur lors de l'ajout du produit :", err);
      res.status(500).send("Erreur lors de l'ajout du produit");
    }
  },
);

/**
POST /ajouter_machine
Traite le formulaire d'ajout d'une nouvelle machine (admin).
Gère l'upload d'image et insère la nouvelle ligne dans la table `machines`.
 */
app.post("/ajouter_machine",isAdmin,uploadMachines.single("image_machine"),async function (req, res) {
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
        annee_entree,
      } = req.body;

      const imageMachine = req.file
        ? "/img/machines/" + req.file.filename
        : null;

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
        imageMachine,
      ];

      await pool.query(insertQuery, values);

      // Redirection vers la liste des machines avec un indicateur de succès
      return res.redirect("/admin/machines?success=add");
    } catch (err) {
      console.error("Erreur lors de l'ajout de la machine :", err);
      res.status(500).send("Erreur lors de l'ajout de la machine");
    }
  },
);

// Route POST pour enregistrer les modifications d'une machine (avec gestion de l'image)
app.post("/modifier_infos_machine",isAdmin,uploadMachines.single("image_machine"),async function (req, res) {
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
        annee_entree,
      } = req.body;

      let query = `UPDATE machines SET nom_machine = ?, description_courte = ?, description_longue = ?, statistique1_nom = ?, statistique1_donnee = ?, statistique2_nom = ?, statistique2_donnee = ?, avantage_titre = ?, avantage_description = ?, d_x = ?, d_y = ?, d_z = ?, type = ?, annee_entree = ?`;
      const values = [
        nom_machine,
        description_courte,
        description_longue,
        statistique1_nom,
        statistique1_donnee,
        statistique2_nom,
        statistique2_donnee,
        avantage_titre,
        avantage_description,
        d_x || null,
        d_y || null,
        d_z || null,
        type,
        annee_entree || null,
      ];

      // Si une nouvelle image a été envoyée, supprimer l'ancienne (si existe) et ajouter le champ
      if (req.file) {
        const [ancien] = await pool.query(
          "SELECT image_machine FROM machines WHERE id_machine = ?",
          [id_machine],
        );
        if (ancien && ancien.length > 0 && ancien[0].image_machine) {
          const nomFichierAncien = path.basename(ancien[0].image_machine);
          const cheminAncienneImage = path.join(
            "public/img/machines",
            nomFichierAncien,
          );
          if (fs.existsSync(cheminAncienneImage)) {
            fs.unlink(cheminAncienneImage, (err) => {
              if (err)
                console.error(
                  "Erreur lors de la suppression de l'ancienne image :",
                  err,
                );
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

      res.redirect("/admin/machines");
    } catch (err) {
      console.error("Erreur lors de la modification de la machine :", err);
      res.status(500).send("Erreur lors de la modification de la machine");
    }
  },
);

/**
 POST /envoyer-devis
Traite le formulaire de demande de devis, envoie un email avec les pièces jointes.
Style du mail géré par le serveur
 */
app.post("/envoyer-devis",uploadProduits.array("fichiers", 10),async (req, res) => {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const attachments = req.files.map((file) => ({
        filename: file.originalname,
        path: file.path,
      }));

      await transporter.sendMail({
        from: `"Site Web MECA-CN" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_DEST || "contact@meca-cn.com",
        replyTo: req.body.email, // Permet de répondre directement au client
        subject: `Nouveau Devis - ${req.body.entreprise || req.body.nom}`,
        text: `Nouvelle demande de devis\n\nClient: ${req.body.nom} (${req.body.entreprise})\nEmail: ${req.body.email}\nProduit: ${req.body.produit} (${req.body.quantite} pièces)\nMatière: ${req.body.matiere || "Non précisé"}\nDimensions: ${req.body.dim_x} x ${req.body.dim_y} x ${req.body.dim_z} mm\nDélais souhaités : ${req.body.date_livraison}\nDescription: ${req.body.description || "Aucune"}\nFichiers joints: ${req.files.length ? req.files.map((file) => file.originalname).join(", ") : "Aucun"}\n`,
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
                                        <td style="padding: 12px 0; font-weight: 700;">${req.body.nom || "Non précisé"} ${req.body.entreprise ? "(" + req.body.entreprise + ")" : ""}</td>
                                    </tr>
                                    <tr style="border-top: 1px solid #e2e8f0;">
                                        <td style="padding: 12px 0; color: #64748b;">Email</td>
                                        <td style="padding: 12px 0; font-weight: 700;">${req.body.email || "Non précisé"}</td>
                                    </tr>
                                    <tr style="border-top: 1px solid #e2e8f0;">
                                        <td style="padding: 12px 0; color: #64748b;">Produit</td>
                                        <td style="padding: 12px 0; font-weight: 700;">${req.body.produit || "Non précisé"}</td>
                                    </tr>
                                    <tr style="border-top: 1px solid #e2e8f0;">
                                        <td style="padding: 12px 0; color: #64748b;">Matière</td>
                                        <td style="padding: 12px 0; font-weight: 700;">${req.body.matiere || "Non précisé"}</td>
                                    </tr>
                                    <tr style="border-top: 1px solid #e2e8f0;">
                                        <td style="padding: 12px 0; color: #64748b;">Quantité</td>
                                        <td style="padding: 12px 0; font-weight: 700;">${req.body.quantite || "0"} pièce(s)</td>
                                    </tr>
                                    <tr style="border-top: 1px solid #e2e8f0;">
                                        <td style="padding: 12px 0; color: #64748b;">Dimensions</td>
                                        <td style="padding: 12px 0; font-weight: 700;">${req.body.dim_x || "0"} x ${req.body.dim_y || "0"} x ${req.body.dim_z || "0"} mm</td>
                                    </tr>
                                    <tr style="border-top: 1px solid #e2e8f0;">
                                        <td style="padding: 12px 0; color: #64748b;">Délais souhaités</td>
                                        <td style="padding: 12px 0; font-weight: 700;">${req.body.date_livraison || "Non sélectionnée"}</td>
                                    </tr>
                                </tbody>
                            </table>

                            <div style="margin-bottom: 24px;">
                                <h2 style="margin: 0 0 12px; font-size: 18px; color: #0f4bb7;">Description</h2>
                                <p style="margin: 0; color: #475569;">${req.body.description ? req.body.description.replace(/\n/g, "<br>") : "Aucune description fournie."}</p>
                            </div>

                            <div style="margin-bottom: 24px;">
                                <h2 style="margin: 0 0 12px; font-size: 18px; color: #0f4bb7;">Fichiers joints</h2>
                                ${req.files.length ? `<ul style="margin: 0; padding-left: 20px; color: #475569;">${req.files.map((file) => `<li style="margin-bottom: 8px;">${file.originalname} (${Math.round(file.size / 1024)} Ko)</li>`).join("")}</ul>` : '<p style="margin: 0; color: #475569;">Aucun fichier joint.</p>'}
                            </div>

                            <p style="margin : 0; color: #94a3b8; font-size: 13px;">Cette demande de devis a été générée depuis le formulaire de contact du site.</p>
                        </div>
                    </div>
                </div>
            `,
        attachments: attachments,
      });

      req.files.forEach((file) => {
        fs.unlink(file.path, (err) => {
          if (err) console.error("Erreur suppression fichier temporaire:", err);
        });
      });

      res.render("confirmation_devis", {
        success: true,
        message: "Votre demande a été envoyée avec succès !",
        page_css1: "headerclient.css",
        page_css2: "devis.css",
      });
    } catch (err) {
      console.error("Erreur Nodemailer :", err);
      res.render("confirmation_devis", {
        success: false,
        message: "Désolé, une erreur technique est survenue.",
        page_css1: "headerclient.css",
        page_css2: "devis.css.css",
      });
    }
  },
);

/**
 * POST /modifier_infos_realisation
Traite le formulaire d'édition d'une réalisation (admin), gère l'image.
 */
app.post("/modifier_infos_realisation",uploadProduits.array("fichiers", 1),async function (req, res) {
    try {
      const { id_produit, nom_produit, description, categorie } = req.body;

      let requete =
        "UPDATE produits SET nom = ?, description = ?, categorie = ?";
      let values = [nom_produit, description, categorie];

      // 1. Gestion de la nouvelle image
      if (req.files && req.files.length > 0) {
        // --- LOGIQUE DE SUPPRESSION DE L'ANCIENNE IMAGE ---
        // On cherche l'ancien nom de fichier en BDD avant d'écraser la donnée
        const [ancienProduit] = await pool.query(
          "SELECT image FROM produits WHERE id = ?",
          [id_produit],
        );

        if (ancienProduit.length > 0 && ancienProduit[0].image) {
          // On extrait juste le nom du fichier (au cas où tu stockes le chemin complet)
          const nomFichierAncien = path.basename(ancienProduit[0].image);
          const cheminAncienneImage = path.join(
            "public/img/produits",
            nomFichierAncien,
          );

          // On vérifie si le fichier existe avant de tenter de le supprimer
          if (fs.existsSync(cheminAncienneImage)) {
            fs.unlink(cheminAncienneImage, (err) => {
              if (err)
                console.error(
                  "Erreur lors de la suppression de l'ancienne image :",
                  err,
                );
              else
                console.log(
                  "Ancienne image supprimée avec succès :",
                  nomFichierAncien,
                );
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
  },
);

/**
POST /envoyer-contact
Envoie un email de contact avec les informations fournies.
 */
app.post("/envoyer-contact", async function (req, res) {
  const { nom, entreprise, email, telephone, objet, message } = req.body;

  //console.log(message);

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"${nom}" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_DEST || "meca.cn@wanadoo.fr",
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
                <p>${message.replace(/\n/g, "<br>")}</p>
            `,
    });

    res.render("contact", {
      page_css1: "headerclient.css",
      page_css2: "contact.css",
      success: "Votre message a bien été envoyé !",
    });
  } catch (err) {
    console.error("Erreur Nodemailer :", err);
    res.render("contact", {
      page_css1: "headerclient.css",
      page_css2: "contact.css",
      error:
        "Désolé, une erreur est survenue. Veuillez nous contacter par téléphone.",
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
    const [rows] = await pool.query(
      "SELECT * FROM utilisateurs WHERE identifiant = ?",
      [id_user],
    );

    if (rows.length === 0) {
      return res.render("connexion", {
        page_css1: "connexion.css",
        page_css2: "headerclient.css",
        error: "Identifiant ou mot de passe incorrect",
      });
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

    return res.render("connexion", {
      page_css1: "connexion.css",
      page_css2: "headerclient.css",
      error: "Identifiant ou mot de passe incorrect",
    });
  } catch (err) {
    console.error("Erreur connexion :", err);
    res.render("connexion", {
      page_css1: "connexion.css",
      page_css2: "headerclient.css",
      error: "Erreur serveur, réessayez plus tard",
    });
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
});

app.listen(3000);
