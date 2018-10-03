-- phpMyAdmin SQL Dump
-- version 4.8.3
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost
-- Généré le :  mer. 03 oct. 2018 à 21:31
-- Version du serveur :  10.1.36-MariaDB
-- Version de PHP :  7.2.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données :  `Projet`
--

-- --------------------------------------------------------

--
-- Structure de la table `questions`
--

CREATE TABLE `questions` (
  `id` int(11) NOT NULL,
  `enonce` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `indexSet` int(11) NOT NULL,
  `class` int(11) NOT NULL,
  `owner` int(11) NOT NULL,
  `reponses` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `correct` int(11) NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `questions`
--

INSERT INTO `questions` (`id`, `enonce`, `indexSet`, `class`, `owner`, `reponses`, `correct`, `description`) VALUES
(49, 'P', 0, 16, 1, '[{\"reponse\":\"A\",\"validity\":false},{\"reponse\":\"b\",\"validity\":false},{\"reponse\":\"c\",\"validity\":false}]', 0, ''),
(50, '<sd', 0, 17, 1, '[{\"reponse\":\"<sdw\",\"validity\":false}]', 0, ''),
(51, 'EQZFQZERF', 0, 18, 1, '[{\"reponse\":\"QZE\",\"validity\":false}]', 0, ''),
(52, 'La question qui tue ??', 0, 19, 1, '[{\"reponse\":\"La question qui tue ?\",\"validity\":false},{\"reponse\":\"Quel est la couleur du cheval blanc d\'Henry IV ?\",\"validity\":false},{\"reponse\":\"La question D ?\",\"validity\":false}]', 0, ''),
(53, 'La question qui vie ???', 1, 19, 1, '[{\"reponse\":\"La question qui tue ?\",\"validity\":false},{\"reponse\":\"Le snowboard\",\"validity\":false},{\"reponse\":\"La grande question du pourquoi\",\"validity\":false}]', 1, ''),
(55, ' Que vaut $\\Sigma_{n\\in\\omega}2^{-n}$ ?', 1, 16, 1, '[{\"reponse\":\"\\\\(N=2\\\\)\",\"validity\":false},{\"reponse\":\"\\\\(N=1\\\\)\",\"validity\":false}]', 0, 'On demande de trouver la valeur de $N$, où $N$ vaut :\r\n$$\\Sigma_{n\\in\\omega}2^{-n}$$\r\nque l\'on peut calculer avec:\r\n```ocaml\r\nlet rec sum n =\r\n   n + sum (n+1)\r\n```\r\n');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `questions`
--
ALTER TABLE `questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `appartenance class` (`class`),
  ADD KEY `owner` (`owner`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `questions`
--
ALTER TABLE `questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `questions`
--
ALTER TABLE `questions`
  ADD CONSTRAINT `appartenance class` FOREIGN KEY (`class`) REFERENCES `setDeQuestion` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `owner` FOREIGN KEY (`owner`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
