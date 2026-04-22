-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : mer. 22 avr. 2026 à 07:48
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
-- Structure de la table `categories`
--

DROP TABLE IF EXISTS `categories`;
CREATE TABLE IF NOT EXISTS `categories` (
  `id_cat` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(50) NOT NULL,
  PRIMARY KEY (`id_cat`)
) ENGINE=MyISAM AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `categories`
--

INSERT INTO `categories` (`id_cat`, `nom`) VALUES
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
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `machines`
--

INSERT INTO `machines` (`id_machine`, `nom_machine`, `description_courte`, `description_longue`, `image_machine`, `statistique1_nom`, `statistique1_donnee`, `statistique2_nom`, `statistique2_donnee`, `avantage_titre`, `avantage_description`, `d_x`, `d_y`, `d_z`, `type`, `annee_entree`) VALUES
(1, 'Mazak VCN-530C', 'Usinage intégral de pièces complexes par la fusion du tournage et du fraisage (Concept Done-In-One).', 'Centre d\'usinage vertical haute performance, idéal pour l\'usinage de pièces de grande précision avec une broche haute vitesse.', '/img/machines/Mazak1', 'Vitesse brosse fraisage', '12.000 RPM', 'Magasin d’outils', '36 à 72 postes', 'Polyvalence Haute Technologie', 'Idéal pour les géométries complexes nécessitant un fraisage de précision et un tournage intensif sur une seule machine.', 1050.00, 530.00, 510.00, 'fraisage', 2016),
(2, 'Mazak VTC-800/30SR', 'Grande capacité longitudinale et tête pivotante pour un usinage multi-faces haute précision.', 'Centre d\'usinage à colonne mobile doté d\'une tête pivotante (axe B), permettant l\'usinage de surfaces complexes et de grandes pièces avec une flexibilité totale.', '/img/machines/Mazak2', 'Vitesse broche', '18.000 RPM', 'Nombre d\'axes', '5 axes simultanés', 'Usinage Grande Dimension', 'Sa table fixe de 3,5 mètres permet d\'usiner des pièces volumineuses ou de travailler en pendulaire (deux zones de travail).', 3000.00, 800.00, 720.00, 'fraisage', 2010),
(3, 'Mazak Quick Turn 250MSY', 'Tournage-fraisage haute productivité avec axe Y et contre-broche pour le concept Done-In-One.', 'Centre de tournage haute performance équipé d\'une broche de fraisage, d\'un axe Y et d\'une broche secondaire pour un usinage complet sans reprise manuelle.', '/img/machines/Mazak3', 'Diamètre de tournage max', '380 mm', 'Vitesse outils motorisés', '6.000 RPM', 'Productivité Intégrée', 'La présence de la contre-broche (S) et des outils motorisés permet de terminer la pièce entièrement sur une seule machine.', 375.00, 100.00, 541.00, 'tournage', 2024);

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
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `produits`
--

INSERT INTO `produits` (`id`, `nom`, `description`, `categorie`, `image`) VALUES
(1, 'Engrenage Hélicoïcal de Transmission', 'Usinage haute précision de pignons pour boîtes de vitesses. Une finition de surface optimisée pour réduire les frottements et les bruits de roulement.', 15, '/img/produits/produit1.png'),
(2, 'Arbre de Transmission Cannelé ', 'Réalisation d\'arbres de transmission avec cannelures de force. Conçus pour supporter des couples élevés dans les machines agricoles ou de manutention.', 17, '/img/produits/Prdt1776784346166.png'),
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
(1, 'adminTest', 'sebastienconfrere6@gmail.com', '6b35d7ac0fc8f9d9d11344091645f33949b781224976045b9934c357c7594749', '0707070707', 'admin');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
