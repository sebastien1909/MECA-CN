-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : lun. 11 mai 2026 à 15:00
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
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `abonnement`
--

INSERT INTO `abonnement` (`id`, `email`, `date_abonnement`, `actif`) VALUES
(2, 'sebastienconfrere6@gmail.com', '2026-05-11 14:59:46', 1);

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
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `actualite`
--

INSERT INTO `actualite` (`id`, `contenu`, `date_publication`, `redacteur`, `titre`, `baseline`, `img_presentation`) VALUES
(1, '<h1 class=\"actu-title\">Certification ISO 9001:2015 obtenue</h1>\r\n<p class=\"actu-texte\">MECA-CN franchit une étape importante en obtenant la certification ISO 9001:2015. Cette reconnaissance atteste de la rigueur des processus de production et de la volonté constante d’améliorer la qualité des pièces usinées.</p>\r\n<img src=\"/img/placeholders/usinage1.png\" class=\"actu-img\">', '2026-04-15 09:00:00', 'Direction qualité', 'Certification ISO 9001:2015 obtenue', 'MECA-CN obtient la certification ISO 9001:2015, validant la conformité de son système qualité et son engagement dans l’amélioration continue des processus industriels.', '/img/placeholders/iso9001.jpg'),
(2, '<h1 class=\"actu-title\">Arrivée d’une nouvelle machine 5 axes</h1>\r\n<p class=\"actu-texte\">L’atelier s’équipe d’une nouvelle machine de fraisage 5 axes, améliorant fortement la capacité de production sur des pièces complexes tout en réduisant les temps d’usinage.</p>\r\n<img src=\"/img/placeholders/usinage1.png\" class=\"actu-img\">', '2026-03-28 14:30:00', 'Responsable production', 'Arrivée d’une nouvelle machine 5 axes', 'Installation d’une machine de fraisage 5 axes de dernière génération permettant d’augmenter la précision et la complexité des pièces usinées.', '/img/placeholders/machine5axes.jpg'),
(3, '<h1 class=\"actu-title\">Réorganisation de l’atelier CNC</h1>\r\n<p class=\"actu-texte\">Une nouvelle organisation de l’atelier CNC a été mise en place afin d’améliorer la circulation des pièces et d’optimiser l’efficacité des opérateurs.</p>\r\n<img src=\"/img/placeholders/usinage1.png\" class=\"actu-img\">', '2025-11-10 08:15:00', 'Chef d’atelier', 'Reorganisation de l’atelier CNC', 'Réorganisation des postes de travail dans l’atelier CNC afin d’optimiser les flux de production et réduire les temps de déplacement.', '/img/placeholders/atelier_cnc.jpg'),
(4, '<h1 class=\"actu-title\">Nouveau système de gestion des stocks</h1>\r\n<p class=\"actu-texte\">Un nouveau système de gestion des stocks a été déployé afin de suivre plus efficacement les matières premières et limiter les ruptures dans l’atelier de production.</p>\r\n<img src=\"/img/placeholders/usinage1.png\" class=\"actu-img\">', '2025-06-22 10:00:00', 'Administration', 'Nouveau système de gestion des stocks', 'Mise en place d’un système de gestion des stocks permettant un meilleur suivi des matières premières et une réduction des ruptures en production.', '/img/placeholders/stock_system.jpg');

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
(1000005, 'catégorie test 5'),
(1000004, 'catégorie test 4'),
(1000003, 'catégorie test 3'),
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
  PRIMARY KEY (`id_machine`)
) ENGINE=MyISAM AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `machines`
--

INSERT INTO `machines` (`id_machine`, `nom_machine`, `description_courte`, `description_longue`, `image_machine`, `statistique1_nom`, `statistique1_donnee`, `statistique2_nom`, `statistique2_donnee`, `avantage_titre`, `avantage_description`, `d_x`, `d_y`, `d_z`, `type`, `annee_entree`) VALUES
(3, 'Mazak Quick Turn 250MSY', 'Tournage-fraisage haute productivité avec axe Y et contre-broche pour le concept Done-In-One.', 'Centre de tournage haute performance équipé d\'une broche de fraisage, d\'un axe Y et d\'une broche secondaire pour un usinage complet sans reprise manuelle.', '/img/machines/Mchn1776863314292.png', 'Diamètre de tournage max', '380 mm', 'Vitesse outils motorisés', '6.000 RPM', 'Productivité Intégrée', 'La présence de la contre-broche (S) et des outils motorisés permet de terminer la pièce entièrement sur une seule machine.', 375.00, 100.00, 2500.00, 'tournage', 2024),
(4, 'alqigjmqkj', 'eslfigjarml j ameroifjamo fizmqeroijgm qokrjgaq', 'ersgliz jqmgljh rmlgjqerlmoghaqeromugha mqha qmlkjfham eqljkghanm l', '/img/machines/Mchn1776863323954.png', 'poids', '1100 Kg', 'qdfljh', '125mm', 'qre;fjhlkj', 'sfdlvkjsqfmlkjzjqmrkj', 500.00, 250.00, 1010.00, 'tournage', 2025),
(5, 'aqergzth', 'zzsth', 'zsthzqtfgztshs gzesrg', '/img/machines/Mchn1776863332222.png', 'qfgq', 'qerg', 'qergqrf', 'regaq', 'sgzety', 'zqrtaergsfgztgzdsfg', 500.00, 500.00, 500.00, 'tournage', 2026),
(6, 'erfr;gaq glkjhfl qjkf', 'zpoigj pmerough kqifjglzrbfaqlm ofhglq rufh lqfj', 'AQTA QRTzekfhagiigikyugloiqrejg mojgjlso k jmqlkrjglm zqjrhglmqjfhg mqorighl qrjk hn luqerhgol qhlfo qhrl oia h', '/img/machines/Mchn1776862379001.png', 'qlkjhlk', '500', 'kjhluh', '50', 'lkug', 'kquhflqiufhvmlqujhg', 500.00, 500.00, 500.00, 'tournage', 2026),
(7, 'iuioliuh', 'liugliuyoiu', 'oiuoiuhzrloiguhlqrhuaemrqlfhqleighze oughzerogha zpqerogia ezroighzerpo gh e', '/img/machines/Mchn1776862452722.png', 'bqzjg', '500', 'kysfglkvuih', '25', 'qkiuhlqiudh ', 'lzujujfhlqkfhl ijamprig zmeroi', 500.00, 500.00, 500.00, 'tournage', 2026);

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
(1, 'Offre test intitule (pour voir s\'il continue après l\'auto increment)', 'Alternance', 'Widehem', 'Offre test salaire', 'Agence digitale accompagnant ses clients dans la création de sites web et d’applications sur mesure. Vous intégrerez une équipe dynamique où l’apprentissage, la transmission de compétences et l’implication sur des projets concrets sont au cœur du fonctionnement.', 'Offre test missions', 'Offre test compétences', 'Offre test avantages', 'Offre test process', 'Offre test complémentaire', '0000-00-00 00:00:00', 'hybride', 'fraiseur', 1, 1, 1, 1, 1),
(2, 'Alternant Développeur Web Front-End', 'Alternance', 'Paris, France', 'Selon grille légale', 'Agence digitale accompagnant ses clients dans la création de sites web et d’applications sur mesure. Vous intégrerez une équipe dynamique où l’apprentissage, la transmission de compétences et l’implication sur des projets concrets sont au cœur du fonctionnement.', '<p>Encadré par un développeur expérimenté, vous participerez à l’intégration d’interfaces web, au développement de nouvelles fonctionnalités et à la correction de bugs. Vous serez également amené à collaborer avec les designers pour garantir la qualité visuelle et ergonomique des projets.</p>', '<p>Ceci n\'est qu\'un test</p><ul><li>Test 1</li><li>Test 2</li></ul><ol><li>Test 3</li></ol><p><strong>Test gras</strong></p>', '<p>Encadrement personnalisé, ambiance bienveillante, projets variés, possibilité d’embauche</p>', '<p>Test 2</p>', '<p>Contrat de 12 mois, démarrage en septembre</p>', '2026-05-05 05:21:30', 'presentiel', 'fraiseur', 1, 1, 1, 1, 1),
(3, 'Offre test intitule (pour voir s\'il continue après l\'auto increment)', 'Alternance', 'Widehem', 'Offre test salaire', 'Agence digitale accompagnant ses clients dans la création de sites web et d’applications sur mesure. Vous intégrerez une équipe dynamique où l’apprentissage, la transmission de compétences et l’implication sur des projets concrets sont au cœur du fonctionnement.', 'Offre test missions', 'Offre test compétences', 'Offre test avantages', 'Offre test process', 'Offre test complémentaire', '0000-00-00 00:00:00', 'hybride', 'fraiseur', 1, 1, 1, 1, 1),
(4, 'Fraiseur CN Junior', 'CDD', 'Guingamp, France', '22 000€ - 26 000€ brut/an', 'PME dynamique spécialisée dans la sous-traitance industrielle. Nous accompagnons nos jeunes recrues pour les faire monter en compétences sur des projets variés.', 'Montage des outils et des pièces sur fraiseuses 3 axes, lancement des programmes d’usinage, ébavurage et vérification de la conformité des pièces produites par rapport au cahier des charges.', 'Bases en usinage, rigueur, esprit d’équipe, respect des consignes de sécurité', 'Possibilité d’évolution en CDI, mutuelle d’entreprise', 'Entretien avec le chef d’atelier → test de lecture de plan', 'Ouvert aux profils sortant de formation (Bac Pro ou BTS)', '2026-05-07 07:10:00', 'presentiel', 'fraiseur', 1, 1, 1, 1, 1),
(5, 'Assistant administratif et commercial', 'CDI', 'Lannion, France', '24 000€ - 28 000€ brut/an', 'Structure à taille humaine assurant le lien entre la production et les clients finaux. L’organisation et la fluidité de l’information sont au cœur de nos préoccupations.', 'Accueil téléphonique, gestion des devis et de la facturation, suivi des commandes clients, organisation des déplacements et gestion des fournitures de bureau.', 'Maîtrise du Pack Office, excellentes capacités rédactionnelles, sens de l’organisation', 'Tickets restaurant, horaires flexibles le vendredi après-midi', 'Entretien RH → test de bureautique → entretien de motivation', 'Maîtrise de l’anglais est un plus', '2026-05-07 07:15:00', 'hybride', 'assistant administratif', 1, 1, 1, 1, 1),
(6, 'Tourneur Traditionnel / CN', 'Stage', 'Brest, France', 'Taux horaire selon profil', 'Société de maintenance industrielle intervenant sur des équipements navals de grande envergure.', 'Usinage de pièces unitaires pour la réparation de moteurs et de systèmes de transmission, adaptation sur machines conventionnelles et numériques selon le besoin.', 'Polyvalence traditionnel/CN, réactivité, autonomie sur le poste de travail', 'Indemnités de déplacement, majoration heures supplémentaires', 'Entretien téléphonique → visite de l’atelier', 'Mission de 6 mois renouvelable', '2026-05-07 07:20:00', 'presentiel', 'tourneur', 1, 1, 1, 1, 1),
(7, 'Fraiseur 5 axes expert', 'CDI', 'Saint-Brieuc, France', '36 000€ - 42 000€ brut/an', 'Leader régional dans l’usinage de haute précision pour le secteur médical et l’énergie.', 'Programmation FAO, optimisation des trajectoires d’outils sur centres d’usinage 5 axes, réalisation de prototypes et de pièces à haute valeur ajoutée.', 'Logiciels FAO (Mastercam ou TopSolid), métrologie avancée, connaissance des matériaux durs', 'Participation aux bénéfices, Plan Épargne Entreprise, comité d’entreprise actif', 'Entretien technique approfondi → test de programmation → entretien direction', 'Environnement de travail climatisé et moderne', '2026-05-07 07:25:00', 'presentiel', 'fraiseur', 1, 1, 1, 1, 1),
(8, 'Apprenti Tourneur', 'Alternance', 'Lannion, France', 'Selon grille légale', 'Entreprise familiale axée sur la transmission du métier de tourneur de père en fils, alliant méthodes traditionnelles et nouvelles technologies.', 'Apprentissage du réglage machine, aide à la préparation des postes de travail, découverte des différentes étapes de fabrication d’une pièce de révolution.', 'Motivation, ponctualité, curiosité pour le secteur industriel', 'Aide au permis de conduire, tutorat dédié', 'Entretien de motivation', 'Démarrage dès que possible', '2026-05-07 07:30:00', 'presentiel', 'tourneur', 1, 1, 1, 1, 1),
(9, 'Opérateur Fraiseur de nuit', 'CDI', 'Morlaix, France', '30 000€ - 38 000€ (primes incluses)', 'Unité de production automatisée fonctionnant en continu pour répondre à une forte demande internationale.', 'Surveillance de plusieurs centres d’usinage en simultané, changement des plaquettes, contrôle qualité en cours de production et remplissage des fiches de suivi.', 'Capacité à travailler en autonomie, vigilance, connaissance des bases de l’usinage', 'Majoration de nuit de 25%, prime d’équipe, repos compensateurs', 'Entretien RH → test d’aptitude → visite médicale', 'Horaires fixes de nuit', '2026-05-07 07:35:00', 'presentiel', 'fraiseur', 1, 1, 1, 1, 1),
(10, 'Offre test intitule (pour voir s\'il continue après l\'auto increment)', 'Alternance', 'Widehem', 'Offre test salaire', 'Agence digitale accompagnant ses clients dans la création de sites web et d’applications sur mesure. Vous intégrerez une équipe dynamique où l’apprentissage, la transmission de compétences et l’implication sur des projets concrets sont au cœur du fonctionnement.', 'Offre test missions', 'Offre test compétences', 'Offre test avantages', 'Offre test process', 'Offre test complémentaire', '0000-00-00 00:00:00', 'presentiel', 'fraiseur', 1, 0, 1, 0, 1),
(11, 'Offre test intitule (pour voir s\'il continue après l\'auto increment)', 'Alternance', 'Widehem', 'Offre test salaire', 'Agence digitale accompagnant ses clients dans la création de sites web et d’applications sur mesure. Vous intégrerez une équipe dynamique où l’apprentissage, la transmission de compétences et l’implication sur des projets concrets sont au cœur du fonctionnement.', 'Offre test missions', 'Offre test compétences', 'Offre test avantages', 'Offre test process', 'Offre test complémentaire', '0000-00-00 00:00:00', '', 'fraiseur', 0, 0, 1, 0, 1),
(12, 'Offre test intitule (pour voir s\'il continue après l\'auto increment)', 'Alternance', 'Widehem', 'Offre test salaire', 'Agence digitale accompagnant ses clients dans la création de sites web et d’applications sur mesure. Vous intégrerez une équipe dynamique où l’apprentissage, la transmission de compétences et l’implication sur des projets concrets sont au cœur du fonctionnement.', 'Offre test missions', 'Offre test compétences', 'Offre test avantages', 'Offre test process', 'Offre test complémentaire', '0000-00-00 00:00:00', '', 'fraiseur', 1, 0, 1, 1, 0),
(14, 'Offre pour date', 'Alternance', 'Widehem', 'Offre test salaire', 'Agence digitale accompagnant ses clients dans la création de sites web et d’applications sur mesure. Vous intégrerez une équipe dynamique où l’apprentissage, la transmission de compétences et l’implication sur des projets concrets sont au cœur du fonctionnement.', 'Offre test missions', 'Offre test compétences', 'Offre test avantages', 'Offre test process', 'Offre test complémentaire', '2026-05-07 13:29:40', '', 'fraiseur', 1, 1, 1, 1, 1);

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
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `produits`
--

INSERT INTO `produits` (`id`, `nom`, `description`, `categorie`, `image`) VALUES
(1, 'Engrenage Hélicoïcal de Transmission 2', 'Usinage haute précision de pignons pour boîtes de vitesses. Une finition de surface optimisée pour réduire les frottements et les bruits de roulement.', 15, '/img/produits/produit1.png'),
(2, 'Arbre de Transmission Cannelé 2', 'Réalisation d\'arbres de transmission avec cannelures de force. Conçus pour supporter des couples élevés dans les machines agricoles ou de manutention.', -2, '/img/produits/Prdt1777014597318.png'),
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
(1, 'adminTest', 'confreresebastien6@gmail.com', '6b35d7ac0fc8f9d9d11344091645f33949b781224976045b9934c357c7594749', '0782950362', 'admin');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
