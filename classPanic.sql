-- phpMyAdmin SQL Dump
-- version 4.8.3
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost
-- Généré le :  mer. 03 oct. 2018 à 21:34
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
-- Structure de la table `courses`
--

CREATE TABLE `courses` (
  `id` int(11) NOT NULL,
  `name` varchar(55) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ownerID` int(11) NOT NULL,
  `commentaire` text COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `courses`
--

INSERT INTO `courses` (`id`, `name`, `ownerID`, `commentaire`) VALUES
(1, 'C++', 1, 'Le cours de C++'),
(4, 'c0', 1, 'Je rajoute un commentaire');

-- --------------------------------------------------------

--
-- Structure de la table `poll`
--

CREATE TABLE `poll` (
  `id` int(11) NOT NULL,
  `pseudo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `response` int(11) NOT NULL,
  `last_activity` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `roomID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `poll`
--

INSERT INTO `poll` (`id`, `pseudo`, `response`, `last_activity`, `roomID`) VALUES
(67, 'eleve', -1, '2018-10-03 19:20:35', 2);

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

-- --------------------------------------------------------

--
-- Structure de la table `rooms`
--

CREATE TABLE `rooms` (
  `id` int(11) NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_currentQuestion` int(11) NOT NULL,
  `questionSet` int(11) NOT NULL,
  `ownerID` int(50) NOT NULL,
  `status` enum('pending','revealed') COLLATE utf8mb4_unicode_ci NOT NULL,
  `question` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `courseID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `rooms`
--

INSERT INTO `rooms` (`id`, `name`, `id_currentQuestion`, `questionSet`, `ownerID`, `status`, `question`, `courseID`) VALUES
(2, 'Test room', 52, 19, 1, 'pending', '{\"reponses\":[{\"reponse\":\"La question qui tue ?\",\"validity\":false},{\"reponse\":\"Quel est la couleur du cheval blanc d\'Henry IV ?\",\"validity\":false},{\"reponse\":\"La question D ?\",\"validity\":false}],\"enonce\":\"La question qui tue $a+b$ ??\"}', 1),
(4, 'dede2', 51, 18, 1, 'revealed', '{\"id\":51,\"enonce\":\"EQZFQZERF\",\"indexSet\":0,\"class\":18,\"owner\":1,\"reponses\":[{\"reponse\":\"QZE\",\"validity\":false}],\"correct\":0}', 1),
(6, '3ème salle de classe', 51, 18, 1, 'pending', '{\"id\":51,\"enonce\":\"EQZFQZERF\",\"indexSet\":0,\"class\":18,\"owner\":1,\"reponses\":[{\"reponse\":\"QZE\",\"validity\":false}],\"correct\":0}', 1),
(7, '4ème salle de cours', 55, 16, 1, 'pending', '{\"id\":55,\"enonce\":\" Que vaut $\\\\Sigma_{n\\\\in\\\\omega}2^{-n}$ ?\",\"indexSet\":1,\"class\":16,\"owner\":1,\"reponses\":[{\"reponse\":\"\\\\(N=2\\\\)\"},{\"reponse\":\"\\\\(N=1\\\\)\"}],\"correct\":0,\"description\":\"On demande de trouver la valeur de $N$, où $N$ vaut :\\r\\n$$\\\\Sigma_{n\\\\in\\\\omega}2^{-n}$$\\r\\nque l\'on peut calculer avec:\\r\\n```ocaml\\r\\nlet rec sum n =\\r\\n   n + sum (n+1)\\r\\n```\\r\\n\"}', 1),
(8, '666ème salle de classe', 49, 16, 1, 'pending', '{\"id\":49,\"enonce\":\"P\",\"indexSet\":0,\"class\":16,\"owner\":1,\"reponses\":[{\"reponse\":\"A\",\"validity\":false},{\"reponse\":\"b\",\"validity\":false},{\"reponse\":\"c\",\"validity\":false}],\"correct\":0}', 1),
(10, 'encore', 49, 16, 1, 'pending', '{\"id\":49,\"enonce\":\"P\",\"indexSet\":0,\"class\":16,\"owner\":1,\"reponses\":[{\"reponse\":\"A\",\"validity\":false},{\"reponse\":\"b\",\"validity\":false},{\"reponse\":\"c\",\"validity\":false}],\"correct\":0}', 1),
(13, 'La salle d\'attente', 53, 19, 1, 'pending', '{\"reponses\":[{\"reponse\":\"Enfin plutôt du MathJax\",\"validity\":false},{\"reponse\":\"C\'est pas tt à fait pareil ?\",\"validity\":false}],\"correct\":0,\"enonce\":\"Ici on pourra mettre du latex\"}', 4);

-- --------------------------------------------------------

--
-- Structure de la table `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) UNSIGNED NOT NULL,
  `data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `sessions`
--

INSERT INTO `sessions` (`session_id`, `expires`, `data`) VALUES
('ori-Fh2FlF3gvkUqPemdvrGVdYhNGS7W', 1538598737, '{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"user\":{\"id\":2,\"pseudo\":\"eleve\",\"password\":\"$2b$10$3tqnKFF5KwfGBGZw2C.Kf.st/ZJFXjqver/hgvACILt890TNfcoU2\",\"email\":\"\",\"isAdmin\":0,\"fullName\":\"Anne O\'neam\",\"promotion\":2018,\"studentNumber\":565645,\"institution\":\"IUT\"}}'),
('x42S9-xpBowaUEdnbma0rbDJ8SZLKIHG', 1538688061, '{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"user\":{\"id\":1,\"pseudo\":\"peada\",\"password\":\"$2b$10$iNkfKpsFGkNXpx7on31sauLEOovMhOHzc.sY2zEoaUPCIsZV9ecj2\",\"email\":\"\",\"isAdmin\":1,\"fullName\":\"Paul-Elliot Anglès d\'Auriac\",\"promotion\":2018,\"studentNumber\":755645,\"institution\":\"IUT\"}}');

-- --------------------------------------------------------

--
-- Structure de la table `setDeQuestion`
--

CREATE TABLE `setDeQuestion` (
  `id` int(11) NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `setDeQuestion`
--

INSERT INTO `setDeQuestion` (`id`, `name`, `owner`) VALUES
(19, 'le vrai set', 1),
(17, 'qdwsef', 1),
(18, 'test du set 3', 1),
(16, 'Test set', 1);

-- --------------------------------------------------------

--
-- Structure de la table `stats`
--

CREATE TABLE `stats` (
  `id` int(11) NOT NULL,
  `userID` int(11) NOT NULL,
  `roomID` int(11) NOT NULL,
  `roomName` varchar(55) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `setID` int(11) DEFAULT NULL,
  `setName` varchar(55) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `correct` enum('juste','faux','NSPP') COLLATE utf8mb4_unicode_ci NOT NULL,
  `questionID` int(11) NOT NULL,
  `questionType` enum('custom','set') COLLATE utf8mb4_unicode_ci DEFAULT 'set',
  `question` text COLLATE utf8mb4_unicode_ci,
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `stats`
--

INSERT INTO `stats` (`id`, `userID`, `roomID`, `roomName`, `setID`, `setName`, `correct`, `questionID`, `questionType`, `question`, `time`) VALUES
(11, 2, 2, '{\"id\":2,\"name\":\"Test room\",\"id_currentQuestion\":50,\"que', 17, '{\"id\":17,\"name\":\"qdwsef\",\"owner\":1}', 'juste', 0, 'set', '{\"id\":50,\"enonce\":\"<sd\",\"indexSet\":0,\"class\":17,\"owner\":1,\"reponses\":[{\"reponse\":\"<sdw\",\"validity\":false}],\"correct\":0}', '2018-09-29 23:08:39'),
(12, 2, 2, '{\"id\":2,\"name\":\"Test room\",\"id_currentQuestion\":50,\"que', 17, '{\"id\":17,\"name\":\"qdwsef\",\"owner\":1}', 'juste', 0, 'set', '{\"reponses\":[{\"reponse\":\"La première des deux réponses\",\"validity\":false},{\"reponse\":\"La seconde qui est la bonne\",\"validity\":false}],\"correct\":1,\"enonce\":\"Ma propre question avec deux réponses\"}', '2018-09-29 23:10:07'),
(13, 2, 2, '{\"id\":2,\"name\":\"Test room\",\"id_currentQuestion\":53,\"que', 19, '{\"id\":19,\"name\":\"le vrai set\",\"owner\":1}', 'juste', 0, 'set', '{\"reponses\":[{\"reponse\":\"La question qui tue ?\",\"validity\":false},{\"reponse\":\"Le snowboard en force\",\"validity\":false},{\"reponse\":\"La grande question du pourquoi\",\"validity\":false}],\"correct\":1,\"enonce\":\"La question qui vit ???\"}', '2018-10-03 10:09:58');

-- --------------------------------------------------------

--
-- Structure de la table `subscription`
--

CREATE TABLE `subscription` (
  `userID` int(11) NOT NULL,
  `courseID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `subscription`
--

INSERT INTO `subscription` (`userID`, `courseID`) VALUES
(1, 1),
(1, 2),
(1, 3),
(2, 1),
(2, 3);

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `pseudo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(110) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(55) COLLATE utf8mb4_unicode_ci NOT NULL,
  `isAdmin` tinyint(1) NOT NULL DEFAULT '0',
  `fullName` varchar(55) COLLATE utf8mb4_unicode_ci NOT NULL,
  `promotion` int(11) NOT NULL,
  `studentNumber` int(11) NOT NULL,
  `institution` enum('IUT','FAC') COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `pseudo`, `password`, `email`, `isAdmin`, `fullName`, `promotion`, `studentNumber`, `institution`) VALUES
(1, 'peada', '$2b$10$iNkfKpsFGkNXpx7on31sauLEOovMhOHzc.sY2zEoaUPCIsZV9ecj2', '', 1, 'Paul-Elliot Anglès d\'Auriac', 2018, 755645, 'IUT'),
(2, 'eleve', '$2b$10$3tqnKFF5KwfGBGZw2C.Kf.st/ZJFXjqver/hgvACILt890TNfcoU2', '', 0, 'Anne O\'neam', 2018, 565645, 'IUT');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `courses`
--
ALTER TABLE `courses`
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
  ADD KEY `rooms_ibfk_1` (`id_currentQuestion`),
  ADD KEY `ownerID` (`ownerID`),
  ADD KEY `courseID` (`courseID`);

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
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `subscription`
--
ALTER TABLE `subscription`
  ADD PRIMARY KEY (`userID`,`courseID`) USING BTREE;

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
-- AUTO_INCREMENT pour la table `poll`
--
ALTER TABLE `poll`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=96;

--
-- AUTO_INCREMENT pour la table `questions`
--
ALTER TABLE `questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT pour la table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT pour la table `setDeQuestion`
--
ALTER TABLE `setDeQuestion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT pour la table `stats`
--
ALTER TABLE `stats`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

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
  ADD CONSTRAINT `rooms_ibfk_1` FOREIGN KEY (`id_currentQuestion`) REFERENCES `questions` (`id`),
  ADD CONSTRAINT `rooms_ibfk_2` FOREIGN KEY (`ownerID`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `rooms_ibfk_3` FOREIGN KEY (`courseID`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `setDeQuestion`
--
ALTER TABLE `setDeQuestion`
  ADD CONSTRAINT `idOwner` FOREIGN KEY (`owner`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
