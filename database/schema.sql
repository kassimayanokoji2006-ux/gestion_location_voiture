CREATE DATABASE gestion_location_voiture
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE gestion_location_voiture;

CREATE TABLE client (
    id_client INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    prenom VARCHAR(50) NOT NULL,
    telephone VARCHAR(20) NOT NULL,
    email VARCHAR(100) UNIQUE,
    numero_permis VARCHAR(30) NOT NULL UNIQUE,
    adresse VARCHAR(150)
);

CREATE TABLE categorie (
    id_categorie INT AUTO_INCREMENT PRIMARY KEY,
    libelle VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(200),
    tarif_base_jour DECIMAL(10,2) NOT NULL
);

CREATE TABLE voiture (
    id_voiture INT AUTO_INCREMENT PRIMARY KEY,
    immatriculation VARCHAR(20) NOT NULL UNIQUE,
    marque VARCHAR(50) NOT NULL,
    modele VARCHAR(50) NOT NULL,
    annee INT,
    couleur VARCHAR(30),
    carburant ENUM('Essence', 'Diesel', 'Hybride', 'Electrique') NOT NULL,
    prix_jour DECIMAL(10,2) NOT NULL,
    statut ENUM('disponible', 'loue', 'maintenance') NOT NULL DEFAULT 'disponible',
    id_categorie INT NOT NULL,
    FOREIGN KEY (id_categorie) REFERENCES categorie(id_categorie)
);

CREATE TABLE reservation (
    id_reservation INT AUTO_INCREMENT PRIMARY KEY,
    date_reservation DATE NOT NULL DEFAULT (CURRENT_DATE),
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    statut ENUM('en_attente', 'confirmee', 'terminee', 'annulee') NOT NULL DEFAULT 'en_attente',
    montant_total DECIMAL(10,2) NOT NULL,
    id_client INT NOT NULL,
    id_voiture INT NOT NULL,
    FOREIGN KEY (id_client) REFERENCES client(id_client),
    FOREIGN KEY (id_voiture) REFERENCES voiture(id_voiture),
    CHECK (date_fin >= date_debut)
);

CREATE TABLE paiement (
    id_paiement INT AUTO_INCREMENT PRIMARY KEY,
    date_paiement DATE NOT NULL DEFAULT (CURRENT_DATE),
    montant DECIMAL(10,2) NOT NULL,
    mode_paiement ENUM('especes', 'mobile_money', 'carte', 'virement') NOT NULL,
    reference VARCHAR(50),
    id_reservation INT NOT NULL,
    FOREIGN KEY (id_reservation) REFERENCES reservation(id_reservation),
    CHECK (montant > 0)
);


USE gestion_location_voiture;

DELIMITER $$

CREATE TRIGGER trg_reservation_apres_insert
AFTER INSERT ON reservation
FOR EACH ROW
BEGIN
    IF NEW.statut = 'confirmee' THEN
        UPDATE voiture
        SET statut = 'loue'
        WHERE id_voiture = NEW.id_voiture
          AND statut = 'disponible';
    END IF;
END$$

CREATE TRIGGER trg_reservation_apres_update
AFTER UPDATE ON reservation
FOR EACH ROW
BEGIN
    IF NEW.statut = 'confirmee' AND OLD.statut <> 'confirmee' THEN
        UPDATE voiture
        SET statut = 'loue'
        WHERE id_voiture = NEW.id_voiture
          AND statut = 'disponible';

    ELSEIF NEW.statut IN ('terminee', 'annulee') AND OLD.statut = 'confirmee' THEN
        IF NOT EXISTS (
            SELECT 1 FROM reservation
            WHERE id_voiture = NEW.id_voiture
              AND statut = 'confirmee'
              AND id_reservation <> NEW.id_reservation
        ) THEN
            UPDATE voiture
            SET statut = 'disponible'
            WHERE id_voiture = NEW.id_voiture
              AND statut = 'loue';
        END IF;
    END IF;
END$$

DELIMITER ;