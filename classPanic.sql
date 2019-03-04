-- phpMyAdmin SQL Dump
-- version 4.8.5
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost
-- Généré le :  lun. 04 mars 2019 à 14:20
-- Version du serveur :  10.3.12-MariaDB
-- Version de PHP :  7.3.2

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
-- Structure de la table `courses`
--

CREATE TABLE `courses` (
  `id` int(11) NOT NULL,
  `name` varchar(55) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ownerID` int(11) NOT NULL,
  `commentaire` text COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `documents`
--

CREATE TABLE `documents` (
  `id` int(11) NOT NULL,
  `courseID` int(11) NOT NULL,
  `ownerID` int(11) NOT NULL,
  `filesInfo` text COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `flatStats`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `flatStats` (
`time` timestamp
,`strategy` enum('manual','all_or_0','QCM','computed')
,`statsID` int(11)
,`setID` int(11)
,`setText` text
,`roomID` int(11)
,`roomText` text
,`questionID` int(11)
,`questionText` text
,`courseID` int(11)
,`courseText` text
,`blocID` int(11)
,`customQuestion` text
,`userID` int(11)
,`correct` text
,`response` text
);

-- --------------------------------------------------------

--
-- Structure de la table `poll`
--

CREATE TABLE `poll` (
  `id` int(11) NOT NULL,
  `pseudo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `response` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `responseText` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `roomID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('mono','multi') COLLATE utf8mb4_unicode_ci NOT NULL,
  `strategy` enum('manual','all_or_0','QCM') COLLATE utf8mb4_unicode_ci NOT NULL,
  `coef` int(11) NOT NULL DEFAULT 5
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `rooms`
--

CREATE TABLE `rooms` (
  `id` int(11) NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_currentQuestion` int(11) DEFAULT NULL,
  `questionSet` int(11) NOT NULL,
  `ownerID` int(50) NOT NULL,
  `status` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `question` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `courseID` int(11) NOT NULL,
  `type` enum('live','cc') COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) UNSIGNED NOT NULL,
  `data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `setDeQuestion`
--

CREATE TABLE `setDeQuestion` (
  `id` int(11) NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` int(11) NOT NULL,
  `courseID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `stats`
--

CREATE TABLE `stats` (
  `id` int(11) NOT NULL,
  `userID` int(11) NOT NULL,
  `correct` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `blocID` int(11) DEFAULT NULL,
  `response` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `strategy` enum('manual','all_or_0','QCM','computed') COLLATE utf8mb4_unicode_ci NOT NULL,
  `customQuestion` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `time` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `statsBloc`
--

CREATE TABLE `statsBloc` (
  `id` int(11) NOT NULL,
  `setID` int(11) NOT NULL,
  `setText` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `roomID` int(11) NOT NULL,
  `roomText` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `questionID` int(11) DEFAULT NULL,
  `questionText` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `courseID` int(11) NOT NULL,
  `courseText` text COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `subscription`
--

CREATE TABLE `subscription` (
  `userID` int(11) NOT NULL,
  `courseID` int(11) NOT NULL,
  `isTDMan` tinyint(1) NOT NULL,
  `canRoomCreate` tinyint(1) NOT NULL,
  `canRoomUpdate` tinyint(1) NOT NULL,
  `canRoomDelete` tinyint(1) NOT NULL,
  `canSetUpdate` tinyint(1) NOT NULL,
  `canSetCreate` tinyint(1) NOT NULL,
  `canSetDelete` tinyint(1) NOT NULL,
  `canSubscribe` tinyint(1) NOT NULL,
  `canOwnRoom` tinyint(1) NOT NULL,
  `canAllRoom` tinyint(1) NOT NULL,
  `canOwnSet` tinyint(1) NOT NULL,
  `canAllSet` tinyint(1) NOT NULL,
  `canAddDocs` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `pseudo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(110) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(55) COLLATE utf8mb4_unicode_ci NOT NULL,
  `isAdmin` tinyint(1) NOT NULL DEFAULT 0,
  `fullName` varchar(55) COLLATE utf8mb4_unicode_ci NOT NULL,
  `promotion` int(11) NOT NULL,
  `studentNumber` int(11) NOT NULL,
  `institution` enum('IUT','FAC') COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la vue `flatStats`
--
DROP TABLE IF EXISTS `flatStats`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `flatStats`  AS  select `stats`.`time` AS `time`,`stats`.`strategy` AS `strategy`,`stats`.`id` AS `statsID`,`statsBloc`.`setID` AS `setID`,`statsBloc`.`setText` AS `setText`,`statsBloc`.`roomID` AS `roomID`,`statsBloc`.`roomText` AS `roomText`,`statsBloc`.`questionID` AS `questionID`,`statsBloc`.`questionText` AS `questionText`,`statsBloc`.`courseID` AS `courseID`,`statsBloc`.`courseText` AS `courseText`,`stats`.`blocID` AS `blocID`,`stats`.`customQuestion` AS `customQuestion`,`stats`.`userID` AS `userID`,`stats`.`correct` AS `correct`,`stats`.`response` AS `response` from (`statsBloc` join `stats` on(`statsBloc`.`id` = `stats`.`blocID`)) ;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `poll`
--
ALTER TABLE `poll`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `pseudo and room` (`pseudo`,`roomID`);

--
-- Index pour la table `questions`
--
ALTER TABLE `questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `appartenance class` (`class`),
  ADD KEY `owner` (`owner`);

--
-- Index pour la table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `ownerID` (`ownerID`),
  ADD KEY `courseID` (`courseID`),
  ADD KEY `id_currentQuestion` (`id_currentQuestion`);

--
-- Index pour la table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- Index pour la table `setDeQuestion`
--
ALTER TABLE `setDeQuestion`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name and owner` (`name`,`owner`) USING BTREE,
  ADD KEY `idOwner` (`owner`);

--
-- Index pour la table `stats`
--
ALTER TABLE `stats`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user` (`userID`),
  ADD KEY `bloc` (`blocID`);

--
-- Index pour la table `statsBloc`
--
ALTER TABLE `statsBloc`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `subscription`
--
ALTER TABLE `subscription`
  ADD PRIMARY KEY (`userID`,`courseID`) USING BTREE,
  ADD KEY `user subs` (`userID`),
  ADD KEY `course subs` (`courseID`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `pseudo` (`pseudo`),
  ADD UNIQUE KEY `numero etudiant unique` (`studentNumber`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `documents`
--
ALTER TABLE `documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `poll`
--
ALTER TABLE `poll`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `questions`
--
ALTER TABLE `questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=86;

--
-- AUTO_INCREMENT pour la table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `setDeQuestion`
--
ALTER TABLE `setDeQuestion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT pour la table `stats`
--
ALTER TABLE `stats`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `statsBloc`
--
ALTER TABLE `statsBloc`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9065;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `poll`
--
ALTER TABLE `poll`
  ADD CONSTRAINT `poll_ibfk_1` FOREIGN KEY (`pseudo`) REFERENCES `users` (`pseudo`);

--
-- Contraintes pour la table `questions`
--
ALTER TABLE `questions`
  ADD CONSTRAINT `appartenance class` FOREIGN KEY (`class`) REFERENCES `setDeQuestion` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `owner` FOREIGN KEY (`owner`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `rooms`
--
ALTER TABLE `rooms`
  ADD CONSTRAINT `rooms_ibfk_2` FOREIGN KEY (`ownerID`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `rooms_ibfk_3` FOREIGN KEY (`courseID`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `rooms_ibfk_4` FOREIGN KEY (`id_currentQuestion`) REFERENCES `questions` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `setDeQuestion`
--
ALTER TABLE `setDeQuestion`
  ADD CONSTRAINT `idOwner` FOREIGN KEY (`owner`) REFERENCES `users` (`id`);

--
-- Contraintes pour la table `stats`
--
ALTER TABLE `stats`
  ADD CONSTRAINT `bloclog` FOREIGN KEY (`blocID`) REFERENCES `statsBloc` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `userlog` FOREIGN KEY (`userID`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Contraintes pour la table `subscription`
--
ALTER TABLE `subscription`
  ADD CONSTRAINT `subscription_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `subscription_ibfk_2` FOREIGN KEY (`courseID`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
