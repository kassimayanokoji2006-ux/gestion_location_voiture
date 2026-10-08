from django.db import models

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