DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(45) NOT NULL,
  `password` varchar(256) NOT NULL,
  `active` tinyint(4) NOT NULL DEFAULT '0',
  `phone` varchar(45) NOT NULL,
  `email` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `complete_name` text NOT NULL,
  `verification_token` varchar(45) NOT NULL,
  `reset_code` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username_UNIQUE` (`username`),
  UNIQUE KEY `phone_UNIQUE` (`phone`),
  UNIQUE KEY `email_UNIQUE` (`email`)
);


INSERT INTO `users` VALUES (
    NULL,
    'marcocastignoli',
    '$2y$10$u1p6h/rZ7S.BzTTjRWulGO2gFEXBCXckTNdRTbiaVX2e5hIAlZqy2',
    1,
    '+393342233123',
    'marco.castignoli@gmail.com',
    'via rossi, polena, italia',
    'Marco Castignoli',
    '023991',
    NULL
);