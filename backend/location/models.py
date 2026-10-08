from django.db import models
from datetime import date
class Client(models.Model):
    id_client = models.AutoField(primary_key=True)
    nom = models.CharField(max_length=50)
    prenom = models.CharField(max_length=50)
    telephone = models.CharField(max_length=20)
    email = models.CharField(max_length=100, null=True, blank=True)
    numero_permis = models.CharField(max_length=30)
    adresse = models.CharField(max_length=150, null=True, blank=True)

    class Meta:
        db_table = 'client'
        managed = False

    def __str__(self):
        return f"{self.nom} {self.prenom}"


class Categorie(models.Model):
    id_categorie = models.AutoField(primary_key=True)
    libelle = models.CharField(max_length=50)
    description = models.CharField(max_length=200, null=True, blank=True)
    tarif_base_jour = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'categorie'
        managed = False

    def __str__(self):
        return self.libelle


class Voiture(models.Model):
    id_voiture = models.AutoField(primary_key=True)
    immatriculation = models.CharField(max_length=20)
    marque = models.CharField(max_length=50)
    modele = models.CharField(max_length=50)
    annee = models.IntegerField(null=True, blank=True)
    couleur = models.CharField(max_length=30, null=True, blank=True)
    carburant = models.CharField(max_length=20)
    prix_jour = models.DecimalField(max_digits=10, decimal_places=2)
    statut = models.CharField(max_length=20, default='disponible')
    categorie = models.ForeignKey(
        Categorie, on_delete=models.PROTECT, db_column='id_categorie'
    )

    class Meta:
        db_table = 'voiture'
        managed = False

    def __str__(self):
        return f"{self.marque} {self.modele} ({self.immatriculation})"

class Reservation(models.Model):
    id_reservation = models.AutoField(primary_key=True)
    date_reservation = models.DateField(default=date.today)
    date_debut = models.DateField()
    date_fin = models.DateField()
    statut = models.CharField(max_length=20, default='en_attente')
    montant_total = models.DecimalField(max_digits=10, decimal_places=2)
    client = models.ForeignKey(
        Client, on_delete=models.PROTECT, db_column='id_client'
    )
    voiture = models.ForeignKey(
        Voiture, on_delete=models.PROTECT, db_column='id_voiture'
    )

    class Meta:
        db_table = 'reservation'
        managed = False

    def __str__(self):
        return f"Reservation {self.id_reservation}"

class Paiement(models.Model):
    id_paiement = models.AutoField(primary_key=True)
    date_paiement = models.DateField(default=date.today)
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    mode_paiement = models.CharField(max_length=20)
    reference = models.CharField(max_length=50, null=True, blank=True)
    reservation = models.ForeignKey(
        Reservation, on_delete=models.PROTECT, db_column='id_reservation'
    )

    class Meta:
        db_table = 'paiement'
        managed = False

    def __str__(self):
        return f"Paiement {self.id_paiement}"