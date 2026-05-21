-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : jeu. 21 mai 2026 à 08:51
-- Version du serveur : 9.1.0
-- Version de PHP : 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `meca_cn`
--

-- --------------------------------------------------------

--
-- Structure de la table `abonnement`
--

DROP TABLE IF EXISTS `abonnement`;
CREATE TABLE IF NOT EXISTS `abonnement` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(191) NOT NULL,
  `date_abonnement` datetime DEFAULT CURRENT_TIMESTAMP,
  `actif` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `abonnement`
--

INSERT INTO `abonnement` (`id`, `email`, `date_abonnement`, `actif`) VALUES
(2, 'sebastienconfrere6@gmail.com', '2026-05-11 14:59:46', 0);

-- --------------------------------------------------------

--
-- Structure de la table `actualite`
--

DROP TABLE IF EXISTS `actualite`;
CREATE TABLE IF NOT EXISTS `actualite` (
  `id` int NOT NULL AUTO_INCREMENT,
  `contenu` text NOT NULL,
  `date_publication` datetime DEFAULT CURRENT_TIMESTAMP,
  `redacteur` varchar(100) NOT NULL,
  `titre` varchar(75) DEFAULT NULL,
  `baseline` varchar(255) DEFAULT NULL,
  `img_presentation` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `actualite`
--

INSERT INTO `actualite` (`id`, `contenu`, `date_publication`, `redacteur`, `titre`, `baseline`, `img_presentation`) VALUES
(46, '<h1 class=\"article-titre1\">MECA-CN investit dans une nouvelle machine de haute précision pour accélérer sa production</h1><div class=\"article-separateur\"></div><p class=\"article-paragraphe\"><em>Dans une volonté constante d’innovation et d’amélioration de ses performances industrielles, l’entreprise MECA-CN franchit une nouvelle étape avec l’arrivée d’une toute nouvelle machine de production à commande numérique. Cet investissement stratégique permettra d’augmenter la capacité de production, d’améliorer la précision des pièces usinées et de répondre plus efficacement aux demandes des clients.</em></p><img class=\"article-image\" src=\"/img/actus/tmp_1779261239344.png\" alt=\"\"><div class=\"article-separateur\"></div><h2 class=\"article-titre2\">Une machine pensée pour la performance industrielle</h2><p class=\"article-paragraphe\">Installée au sein de l\'atelier principal de l\'entreprise de l\'entreprise, cette nouvelle machine représente un investissement important pour MECA-CN. Conçue pour répondre aux exigences actuelles du secteur industriel, elle offre des capacités techniques supérieures aux équipements précédemment utilisés.</p><p class=\"article-paragraphe\">Grâce à ses technologies de dernière génération, la machine permet notamment :</p><ul class=\"article-liste-wrapper\"><li class=\"article-liste-puces\">une meilleure précision d\'usinage</li><li class=\"article-liste-puces\">une réduction du temps de production</li><li class=\"article-liste-puces\">une optimisation de la consommation énergetique</li><li class=\"article-liste-puces\">une amélioration globale de la qualité des pièces</li></ul><p class=\"article-paragraphe\">Cette modernisation s\'inscrit dans une démarche de développement durable et de compétitivité, essentielle dans un marché industriel toujours plus exigeant.</p><div class=\"article-separateur\"></div><h2 class=\"article-titre2\">Un gain de productivité pour l\'entreprise</h2><p class=\"article-paragraphe\">L\'arrivée de cet équipement marque une étape importante dans le développement de MECA-CN. En augmentant sa capacité de production, l\'entreprise pourra traiter davantage de commandes tout en réduisant les délais de fabrication.</p><p class=\"article-paragraphe\">Les équipes techniques ont suivi plusieurs jours de formation afin de maîtriser les nouvelles fonctionnalités de la machine et d\'assurer une mise en service rapide et efficace.</p><img class=\"article-image\" src=\"/img/actus/tmp_1779261811435.png\" alt=\"\"><div class=\"article-separateur\"></div><h2 class=\"article-titre2\">Une technologie de pointe au service des clients</h2><p class=\"article-paragraphe\">Avec cette acquisition, MECA-CN souhaite renforcer la qualité de ses prestations et proposer des solutions toujours plus précises à ses clients industriels.</p><blockquote class=\"article-citation\">\"Cet investissement représente une avancée majeure pour notre entreprise. Il nous permet non seulement d\'améliorer notre productivité, mais aussi de garantir un niveau de qualité encore plus élevé à nos clients<footer class=\"article-citation-auteur\">- Direction de MECA-CN</footer></blockquote><p class=\"article-paragraphe\">La machine est capable de produire des pièces complexes avec une grande régularité, tout en limitant les pertes de matière. Une évolution qui répond parfaitement aux besoins des secteurs exigeant comme l\'automobile ou encore le médical.</p><div class=\"article-separateur\"></div><h2 class=\"article-titre2\">Une ambition tournée vers l\'avenir</h2><p class=\"article-paragraphe\">À travers cette investissement, MECA-CN confirme sa volonté de poursuivre sa modernisation et de rester à la pointe des technologies industrielles.</p><p class=\"article-paragraphe\">L\'entreprise prévoit déjà d\'autres projets de développement dans les prochains mois, avec pour objectif de renforcer son savoir-faire et d\'accompagner durablement ses clients dans leurs projets industriels.</p><img class=\"article-image\" src=\"/img/actus/tmp_1779262482230.png\" alt=\"\"><div class=\"article-separateur\"></div><h2 class=\"article-titre2\">À propos de MECA-CN</h2><p class=\"article-paragraphe\"><em>MECA-CN est une entreprise spécialisée dans l\'usinage et les solutions mécaniques de précision. Grâce à son expertise et à ses équipements modernes, elle accompagne de nombreux professionnels dans la réalisation de pièces techniques et de projets industriels sur mesure.</em></p>', '2026-05-20 09:37:06', 'adminTest', 'Arrivée d\'une nouvelle machine chez MECA-CN !', 'MECA-CN investit dans une nouvelle machine de haute précision pour accélérer sa production', '/img/actus/Actu_main1779262625538.png'),
(4, '<h1 class=\"actu-title\">Nouveau système de gestion des stocks</h1>\r\n<p class=\"actu-texte\">Un nouveau système de gestion des stocks a été déployé afin de suivre plus efficacement les matières premières et limiter les ruptures dans l’atelier de production.</p>\r\n<img src=\"/img/placeholders/usinage1.png\" class=\"actu-img\">', '2025-06-22 10:00:00', 'Administration', 'Nouveau système de gestion des stocks', 'Mise en place d’un système de gestion des stocks permettant un meilleur suivi des matières premières et une réduction des ruptures en production.', '/img/placeholders/usinage2.jpg'),
(3, '<h1 class=\"actu-title\">Réorganisation de l’atelier CNC</h1>\r\n<p class=\"actu-texte\">Une nouvelle organisation de l’atelier CNC a été mise en place afin d’améliorer la circulation des pièces et d’optimiser l’efficacité des opérateurs.</p>\r\n<img src=\"/img/placeholders/usinage1.png\" class=\"actu-img\">', '2025-11-10 08:15:00', 'Chef d’atelier', 'Reorganisation de l’atelier CNC', 'Réorganisation des postes de travail dans l’atelier CNC afin d’optimiser les flux de production et réduire les temps de déplacement.', '/img/placeholders/usinage1.png'),
(1, '<h1 class=\"actu-title\">Certification ISO 9001:2015 obtenue</h1>\n<p class=\"actu-texte\">MECA-CN franchit une étape importante en obtenant la certification ISO 9001:2015. Cette reconnaissance atteste de la rigueur des processus de production et de la volonté constante d’améliorer la qualité des pièces usinées.</p>\n<img src=\"/img/placeholders/usinage1.png\" class=\"actu-img\">', '2026-04-15 09:00:00', 'Direction qualité', 'Certification ISO 9001:2015 obtenue', 'MECA-CN obtient la certification ISO 9001:2015, validant la conformité de son système qualité et son engagement dans l’amélioration continue des processus industriels.', '/img/placeholders/usinage4.jpeg'),
(2, '<h1 class=\"actu-title\">Arrivée d’une nouvelle machine 5 axes</h1>\r\n<p class=\"actu-texte\">L’atelier s’équipe d’une nouvelle machine de fraisage 5 axes, améliorant fortement la capacité de production sur des pièces complexes tout en réduisant les temps d’usinage.</p>\r\n<img src=\"/img/placeholders/usinage1.png\" class=\"actu-img\">', '2026-03-28 14:30:00', 'Responsable production', 'Arrivée d’une nouvelle machine 5 axes', 'Installation d’une machine de fraisage 5 axes de dernière génération permettant d’augmenter la précision et la complexité des pièces usinées.', '/img/placeholders/usinage3.jpg');

-- --------------------------------------------------------

--
-- Structure de la table `categories`
--

DROP TABLE IF EXISTS `categories`;
CREATE TABLE IF NOT EXISTS `categories` (
  `id_cat` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(50) NOT NULL,
  PRIMARY KEY (`id_cat`)
) ENGINE=MyISAM AUTO_INCREMENT=1000006 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `categories`
--

INSERT INTO `categories` (`id_cat`, `nom`) VALUES
(-2, 'Autres'),
(15, 'Automobile'),
(16, 'Médical'),
(17, 'Électronique'),
(18, 'Industrie'),
(19, 'Alimentaire');

-- --------------------------------------------------------

--
-- Structure de la table `machines`
--

DROP TABLE IF EXISTS `machines`;
CREATE TABLE IF NOT EXISTS `machines` (
  `id_machine` int NOT NULL AUTO_INCREMENT,
  `nom_machine` varchar(100) NOT NULL,
  `description_courte` varchar(255) DEFAULT NULL,
  `description_longue` text,
  `image_machine` varchar(255) DEFAULT NULL,
  `statistique1_nom` varchar(50) DEFAULT NULL,
  `statistique1_donnee` varchar(50) DEFAULT NULL,
  `statistique2_nom` varchar(50) DEFAULT NULL,
  `statistique2_donnee` varchar(50) DEFAULT NULL,
  `avantage_titre` varchar(100) DEFAULT NULL,
  `avantage_description` text,
  `d_x` decimal(10,2) DEFAULT NULL,
  `d_y` decimal(10,2) DEFAULT NULL,
  `d_z` decimal(10,2) DEFAULT NULL,
  `type` enum('tournage','fraisage') DEFAULT 'fraisage',
  `annee_entree` int DEFAULT NULL,
  `diametre_max` decimal(10,2) DEFAULT NULL,
  `longueur_max` decimal(10,2) DEFAULT NULL,
  `statistique3_nom` varchar(50) DEFAULT NULL,
  `statistique3_donnee` varchar(50) DEFAULT NULL,
  `statistique4_nom` varchar(50) DEFAULT NULL,
  `statistique4_donnee` varchar(50) DEFAULT NULL,
  `alesage` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id_machine`)
) ENGINE=MyISAM AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `machines`
--

INSERT INTO `machines` (`id_machine`, `nom_machine`, `description_courte`, `description_longue`, `image_machine`, `statistique1_nom`, `statistique1_donnee`, `statistique2_nom`, `statistique2_donnee`, `avantage_titre`, `avantage_description`, `d_x`, `d_y`, `d_z`, `type`, `annee_entree`, `diametre_max`, `longueur_max`, `statistique3_nom`, `statistique3_donnee`, `statistique4_nom`, `statistique4_donnee`, `alesage`) VALUES
(3, 'Mazak Quick Turn 250MSY', 'Tournage-fraisage haute productivité avec axe Y et contre-broche pour le concept Done-In-One.', 'Centre de tournage haute performance équipé d\'une broche de fraisage, d\'un axe Y et d\'une broche secondaire pour un usinage complet sans reprise manuelle.', '/img/machines/Mchn1776863314292.png', 'Diamètre de tournage max', '380 mm', 'Vitesse outils motorisés', '6.000 RPM', 'Productivité Intégrée', 'La présence de la contre-broche (S) et des outils motorisés permet de terminer la pièce entièrement sur une seule machine.', 375.00, 100.00, 2500.00, 'tournage', 2024, 450.00, 1200.00, 'test stat 3', '12mm', NULL, NULL, 125.00),
(4, 'alqigjmqkj', 'eslfigjarml j ameroifjamo fizmqeroijgm qokrjgaq', 'ersgliz jqmgljh rmlgjqerlmoghaqeromugha mqha qmlkjfham eqljkghanm l', '/img/machines/Mchn1776863323954.png', 'poids', '1100 Kg', 'qdfljh', '125mm', 'qre;fjhlkj', 'sfdlvkjsqfmlkjzjqmrkj', 500.00, 250.00, 1010.00, 'tournage', 2025, 400.00, 1300.00, NULL, NULL, NULL, NULL, 85.00),
(5, 'aqergzth', 'zzsth', 'zsthzqtfgztshs gzesrg', '/img/machines/Mchn1776863332222.png', 'qfgq', 'qerg', 'qergqrf', 'regaq', 'sgzety', 'zqrtaergsfgztgzdsfg', 500.00, 500.00, 500.00, 'tournage', 2026, 380.00, 1327.00, NULL, NULL, NULL, NULL, 150.00),
(6, 'erfr;gaq glkjhfl qjkf', 'zpoigj pmerough kqifjglzrbfaqlm ofhglq rufh lqfj', 'AQTA QRTzekfhagiigikyugloiqrejg mojgjlso k jmqlkrjglm zqjrhglmqjfhg mqorighl qrjk hn luqerhgol qhlfo qhrl oia h', '/img/machines/Mchn1776862379001.png', 'qlkjhlk', '500', 'kjhluh', '50', 'lkug', 'kquhflqiufhvmlqujhg', 500.00, 500.00, 500.00, 'tournage', 2026, 420.00, 950.00, NULL, NULL, NULL, NULL, 125.00),
(10, 'Machine test fraisage', 'Machine 5 axes (ou 6, on sait pas, faut être créatif)', 'Description longue de test Description longue de test Description longue de test Description longue de test Description longue de test Description longue de test ', '/img/machines/Mchn1779346496182.png', 'stat 1 test', '12.000 rpm', 'stat 2 test', '125mm', 'Productivité Intégrée', 'Productivité intégrée (je sais pas ce que ca veut dire AAAAAHHHHH)', NULL, NULL, NULL, 'fraisage', 2017, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(11, 'iaortg maltjkr', 'Machine 5 axes (ou 6, on sait pas, faut être créatif)', 'machine tournage test description longuemachine ge test description longue machine tournage test description longuemachine ge test description longue', '/img/machines/Mchn1779346618534.jpg', 'stat 1 test', '12.000 rpm', 'stat 2 test', '125mm', 'Productivité Intégrée', 'lqkfvmqkjfm oiarehfmoa qu rhgmaorhgù aoira;rjkgb larkjga loruhglz itughzoliutygae ouir ghljbhgm', 500.00, 450.00, 750.00, 'tournage', 2026, 250.00, 175.00, NULL, NULL, NULL, NULL, 45.00);

-- --------------------------------------------------------

--
-- Structure de la table `offres`
--

DROP TABLE IF EXISTS `offres`;
CREATE TABLE IF NOT EXISTS `offres` (
  `offre_id` int NOT NULL AUTO_INCREMENT,
  `intitule` varchar(100) NOT NULL,
  `type` enum('CDI','CDD','Stage','Alternance') NOT NULL,
  `localisation` varchar(100) NOT NULL,
  `salaire` varchar(100) DEFAULT NULL,
  `presentation` text NOT NULL,
  `missions` text NOT NULL,
  `competences` text NOT NULL,
  `avantages` text,
  `recrutement` text,
  `infos_complementaires` text,
  `date_creation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `mode_travail` enum('presentiel','hybride','remote') NOT NULL,
  `categorie` varchar(50) NOT NULL,
  `InfosEnable` tinyint(1) DEFAULT NULL,
  `SalaireEnable` tinyint(1) DEFAULT '1',
  `RecrutementEnable` tinyint(1) DEFAULT '1',
  `AvantageEnable` tinyint(1) DEFAULT '1',
  `MethodeEnable` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`offre_id`)
) ENGINE=MyISAM AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `offres`
--

INSERT INTO `offres` (`offre_id`, `intitule`, `type`, `localisation`, `salaire`, `presentation`, `missions`, `competences`, `avantages`, `recrutement`, `infos_complementaires`, `date_creation`, `mode_travail`, `categorie`, `InfosEnable`, `SalaireEnable`, `RecrutementEnable`, `AvantageEnable`, `MethodeEnable`) VALUES
(1, 'Offre test intitule (pour voir s\'il continue après l\'auto increment)', 'CDI', 'Widehem', '22.000€/an', 'Agence digitale accompagnant ses clients dans la création de sites web et d’applications sur mesure. Vous intégrerez une équipe dynamique où l’apprentissage, la transmission de compétences et l’implication sur des projets concrets sont au cœur du fonctionnement.', 'Nous proposons énormément de missions', 'On recherche des compétences qui compètent', 'Pas d\'avantages ici, on travail au sec', '', 'beaucoup d\'infos supplémentaires', '2026-05-19 06:52:27', '', 'Assistant marketing', 1, 1, 1, 1, 0),
(3, 'Offre test intitule (pour voir s\'il continue après l\'auto increment)', 'Alternance', 'Widehem', 'Offre test salaire', 'Agence digitale accompagnant ses clients dans la création de sites web et d’applications sur mesure. Vous intégrerez une équipe dynamique où l’apprentissage, la transmission de compétences et l’implication sur des projets concrets sont au cœur du fonctionnement.', 'Offre test missions', 'Offre test compétences', 'Offre test avantages', 'Offre test process', 'Offre test complémentaire', '0000-00-00 00:00:00', 'hybride', 'fraiseur', 1, 1, 1, 1, 1),
(4, 'Fraiseur CN Junior', 'CDD', 'Guingamp, France', '22 000€ - 26 000€ brut/an', 'Agence digitale accompagnant ses clients dans la création de sites web et d’applications sur mesure. Vous intégrerez une équipe dynamique où l’apprentissage, la transmission de compétences et l’implication sur des projets concrets sont au cœur du fonctionnement.', 'Montage des outils et des pièces sur fraiseuses 3 axes, lancement des programmes d’usinage, ébavurage et vérification de la conformité des pièces produites par rapport au cahier des charges.', 'Bases en usinage, rigueur, esprit d’équipe, respect des consignes de sécurité', 'Possibilité d’évolution en CDI, mutuelle d’entreprise', 'Entretien avec le chef d’atelier → test de lecture de plan', 'Ouvert aux profils sortant de formation (Bac Pro ou BTS)', '2026-05-07 07:10:00', 'presentiel', 'fraiseur', 1, 1, 1, 1, 1),
(5, 'Assistant administratif et commercial', 'CDI', 'Lannion, France', '24 000€ - 28 000€ brut/an', 'Agence digitale accompagnant ses clients dans la création de sites web et d’applications sur mesure. Vous intégrerez une équipe dynamique où l’apprentissage, la transmission de compétences et l’implication sur des projets concrets sont au cœur du fonctionnement.', 'Accueil téléphonique, gestion des devis et de la facturation, suivi des commandes clients, organisation des déplacements et gestion des fournitures de bureau.', 'Maîtrise du Pack Office, excellentes capacités rédactionnelles, sens de l’organisation', 'Tickets restaurant, horaires flexibles le vendredi après-midi', 'Entretien RH → test de bureautique → entretien de motivation', 'Maîtrise de l’anglais est un plus', '2026-05-07 07:15:00', 'hybride', 'assistant administratif', 1, 1, 1, 1, 1),
(6, 'Tourneur Traditionnel / CN', 'Stage', 'Brest, France', 'Taux horaire selon profil', 'Agence digitale accompagnant ses clients dans la création de sites web et d’applications sur mesure. Vous intégrerez une équipe dynamique où l’apprentissage, la transmission de compétences et l’implication sur des projets concrets sont au cœur du fonctionnement.', 'Usinage de pièces unitaires pour la réparation de moteurs et de systèmes de transmission, adaptation sur machines conventionnelles et numériques selon le besoin.', 'Polyvalence traditionnel/CN, réactivité, autonomie sur le poste de travail', 'Indemnités de déplacement, majoration heures supplémentaires', 'Entretien téléphonique → visite de l’atelier', 'Mission de 6 mois renouvelable', '2026-05-07 07:20:00', 'presentiel', 'tourneur', 1, 1, 1, 1, 1),
(7, 'Fraiseur 5 axes expert', 'CDI', 'Saint-Brieuc, France', '36 000€ - 42 000€ brut/an', 'Agence digitale accompagnant ses clients dans la création de sites web et d’applications sur mesure. Vous intégrerez une équipe dynamique où l’apprentissage, la transmission de compétences et l’implication sur des projets concrets sont au cœur du fonctionnement.', 'Programmation FAO, optimisation des trajectoires d’outils sur centres d’usinage 5 axes, réalisation de prototypes et de pièces à haute valeur ajoutée.', 'Logiciels FAO (Mastercam ou TopSolid), métrologie avancée, connaissance des matériaux durs', 'Participation aux bénéfices, Plan Épargne Entreprise, comité d’entreprise actif', 'Entretien technique approfondi → test de programmation → entretien direction', 'Environnement de travail climatisé et moderne', '2026-05-07 07:25:00', 'presentiel', 'fraiseur', 1, 1, 1, 1, 1),
(8, 'Apprenti Tourneur', 'Alternance', 'Lannion, France', 'Selon grille légale', 'Agence digitale accompagnant ses clients dans la création de sites web et d’applications sur mesure. Vous intégrerez une équipe dynamique où l’apprentissage, la transmission de compétences et l’implication sur des projets concrets sont au cœur du fonctionnement.', 'Apprentissage du réglage machine, aide à la préparation des postes de travail, découverte des différentes étapes de fabrication d’une pièce de révolution.', 'Motivation, ponctualité, curiosité pour le secteur industriel', 'Aide au permis de conduire, tutorat dédié', 'Entretien de motivation', 'Démarrage dès que possible', '2026-05-07 07:30:00', 'presentiel', 'tourneur', 1, 1, 1, 1, 1),
(9, 'Opérateur Fraiseur de nuit', 'CDI', 'Morlaix, France', '30 000€ - 38 000€ (primes incluses)', 'Agence digitale accompagnant ses clients dans la création de sites web et d’applications sur mesure. Vous intégrerez une équipe dynamique où l’apprentissage, la transmission de compétences et l’implication sur des projets concrets sont au cœur du fonctionnement.', 'Surveillance de plusieurs centres d’usinage en simultané, changement des plaquettes, contrôle qualité en cours de production et remplissage des fiches de suivi.', 'Capacité à travailler en autonomie, vigilance, connaissance des bases de l’usinage', 'Majoration de nuit de 25%, prime d’équipe, repos compensateurs', 'Entretien RH → test d’aptitude → visite médicale', 'Horaires fixes de nuit', '2026-05-07 07:35:00', 'presentiel', 'fraiseur', 1, 1, 1, 1, 1),
(10, 'Offre test intitule (pour voir s\'il continue après l\'auto increment)', 'Alternance', 'Widehem', 'Offre test salaire', 'Agence digitale accompagnant ses clients dans la création de sites web et d’applications sur mesure. Vous intégrerez une équipe dynamique où l’apprentissage, la transmission de compétences et l’implication sur des projets concrets sont au cœur du fonctionnement.', 'Offre test missions', 'Offre test compétences', 'Offre test avantages', 'Offre test process', 'Offre test complémentaire', '0000-00-00 00:00:00', 'presentiel', 'fraiseur', 1, 0, 1, 0, 1),
(11, 'Offre test intitule (pour voir s\'il continue après l\'auto increment)', 'Alternance', 'Widehem', 'Offre test salaire', 'Agence digitale accompagnant ses clients dans la création de sites web et d’applications sur mesure. Vous intégrerez une équipe dynamique où l’apprentissage, la transmission de compétences et l’implication sur des projets concrets sont au cœur du fonctionnement.', 'Offre test missions', 'Offre test compétences', 'Offre test avantages', 'Offre test process', 'Offre test complémentaire', '0000-00-00 00:00:00', '', 'fraiseur', 0, 0, 1, 0, 1),
(12, 'Offre test intitule (pour voir s\'il continue après l\'auto increment)', 'Alternance', 'Widehem', 'Offre test salaire', 'Agence digitale accompagnant ses clients dans la création de sites web et d’applications sur mesure. Vous intégrerez une équipe dynamique où l’apprentissage, la transmission de compétences et l’implication sur des projets concrets sont au cœur du fonctionnement.', 'Offre test missions', 'Offre test compétences', 'Offre test avantages', 'Offre test process', 'Offre test complémentaire', '0000-00-00 00:00:00', '', 'fraiseur', 1, 0, 1, 1, 0),
(14, 'Offre pour date', 'Alternance', 'Widehem', 'Offre test salaire', 'Agence digitale accompagnant ses clients dans la création de sites web et d’applications sur mesure. Vous intégrerez une équipe dynamique où l’apprentissage, la transmission de compétences et l’implication sur des projets concrets sont au cœur du fonctionnement.', 'Offre test missions', 'Offre test compétences', 'Offre test avantages', 'Offre test process', 'Offre test complémentaire', '2026-05-07 13:29:40', '', 'fraiseur', 1, 1, 1, 1, 1);

-- --------------------------------------------------------

--
-- Structure de la table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `mail` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `code` char(6) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `password_reset_tokens`
--

INSERT INTO `password_reset_tokens` (`id`, `mail`, `token`, `code`, `expires_at`, `used`, `created_at`) VALUES
(13, 'confreresebastien6@gmail.com', '90f6aa2813717bb31f7929fcc81e4a4f754ef2d20284993ee71a32808965f9c2', '493433', '2026-05-13 09:48:42', 1, '2026-05-13 11:33:42'),
(12, 'confreresebastien6@gmail.com', 'cf96300cd10d8598bfdb86600c8a0347ed2368e8fef6fe1ea0b97ae117d12d74', '953826', '2026-05-13 09:48:00', 1, '2026-05-13 11:33:00'),
(11, 'confreresebastien6@gmail.com', '5b68790931d0f5ba2336a79b7f7d678e68543bd56b8ad200e75baa2c7bef4a8c', '121513', '2026-05-13 09:46:56', 1, '2026-05-13 11:31:56'),
(14, 'confreresebastien6@gmail.com', 'eae207cde9919860254c00e18b9620e74f20d76b9c6bc639372964849aadb482', '433340', '2026-05-20 09:22:06', 0, '2026-05-20 11:07:06');

-- --------------------------------------------------------

--
-- Structure de la table `produits`
--

DROP TABLE IF EXISTS `produits`;
CREATE TABLE IF NOT EXISTS `produits` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `description` text,
  `categorie` int NOT NULL,
  `image` text,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `produits`
--

INSERT INTO `produits` (`id`, `nom`, `description`, `categorie`, `image`) VALUES
(1, 'Engrenage Hélicoïcal de Transmission 2', 'Usinage haute précision de pignons pour boîtes de vitesses. Une finition de surface optimisée pour réduire les frottements et les bruits de roulement.', 15, '/img/produits/produit1.png'),
(3, 'Pignon de Précision à Droit', 'Fabrication de composants de transmission mécanique standard. Un contrôle rigoureux des tolérances pour assurer une longévité maximale en milieu industriel.', 18, '/img/produits/produit3.png');

-- --------------------------------------------------------

--
-- Structure de la table `utilisateurs`
--

DROP TABLE IF EXISTS `utilisateurs`;
CREATE TABLE IF NOT EXISTS `utilisateurs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `identifiant` varchar(50) NOT NULL,
  `mail` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `role` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `identifiant` (`identifiant`),
  UNIQUE KEY `mail` (`mail`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `utilisateurs`
--

INSERT INTO `utilisateurs` (`id`, `identifiant`, `mail`, `password`, `telephone`, `role`) VALUES
(1, 'adminTest', 'confreresebastien6@gmail.com', '879f55a45c127d69f033965e1229393f64c7af2693c1e0ed8b1db61f88dc1302', '0782950362', 'admin');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
