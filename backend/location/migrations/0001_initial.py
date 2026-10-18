import datetime

from django.db import migrations, models
import django.db.models.deletion


def creer_vues_postgresql(apps, schema_editor):
    if schema_editor.connection.vendor != "postgresql":
        return

    commandes = [
        """
        CREATE OR REPLACE VIEW v_reservation_solde AS
        SELECT r.id_reservation,
               r.id_client,
               r.id_voiture,
               r.statut,
               r.montant_total,
               COALESCE(SUM(p.montant), 0) AS total_paye,
               r.montant_total - COALESCE(SUM(p.montant), 0) AS reste_a_payer
        FROM reservation r
        LEFT JOIN paiement p ON p.id_reservation = r.id_reservation
        GROUP BY r.id_reservation, r.id_client, r.id_voiture, r.statut, r.montant_total
        """,
        """
        CREATE OR REPLACE VIEW v_voitures_plus_louees AS
        SELECT v.id_voiture,
               v.marque,
               v.modele,
               v.immatriculation,
               COUNT(r.id_reservation) AS nb_reservations,
               COALESCE(SUM(r.montant_total), 0) AS chiffre_affaires
        FROM voiture v
        LEFT JOIN reservation r
               ON r.id_voiture = v.id_voiture AND r.statut <> 'annulee'
        GROUP BY v.id_voiture, v.marque, v.modele, v.immatriculation
        """,
        "ALTER TABLE voiture ALTER COLUMN statut SET DEFAULT 'disponible'",
        "ALTER TABLE reservation ALTER COLUMN date_reservation SET DEFAULT CURRENT_DATE",
        "ALTER TABLE reservation ALTER COLUMN statut SET DEFAULT 'en_attente'",
        "ALTER TABLE paiement ALTER COLUMN date_paiement SET DEFAULT CURRENT_DATE",
    ]

    with schema_editor.connection.cursor() as curseur:
        for commande in commandes:
            curseur.execute(commande)


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Categorie",
            fields=[
                ("id_categorie", models.AutoField(primary_key=True, serialize=False)),
                ("libelle", models.CharField(max_length=50, unique=True)),
                ("description", models.CharField(blank=True, max_length=200, null=True)),
                ("tarif_base_jour", models.DecimalField(decimal_places=2, max_digits=10)),
            ],
            options={"db_table": "categorie"},
        ),
        migrations.CreateModel(
            name="Client",
            fields=[
                ("id_client", models.AutoField(primary_key=True, serialize=False)),
                ("nom", models.CharField(max_length=50)),
                ("prenom", models.CharField(max_length=50)),
                ("telephone", models.CharField(max_length=20)),
                ("email", models.CharField(blank=True, max_length=100, null=True, unique=True)),
                ("numero_permis", models.CharField(max_length=30, unique=True)),
                ("adresse", models.CharField(blank=True, max_length=150, null=True)),
            ],
            options={"db_table": "client"},
        ),
        migrations.CreateModel(
            name="Voiture",
            fields=[
                ("id_voiture", models.AutoField(primary_key=True, serialize=False)),
                ("immatriculation", models.CharField(max_length=20, unique=True)),
                ("marque", models.CharField(max_length=50)),
                ("modele", models.CharField(max_length=50)),
                ("annee", models.IntegerField(blank=True, null=True)),
                ("couleur", models.CharField(blank=True, max_length=30, null=True)),
                ("carburant", models.CharField(max_length=20)),
                ("prix_jour", models.DecimalField(decimal_places=2, max_digits=10)),
                ("statut", models.CharField(default="disponible", max_length=20)),
                (
                    "categorie",
                    models.ForeignKey(
                        db_column="id_categorie",
                        on_delete=django.db.models.deletion.PROTECT,
                        to="location.categorie",
                    ),
                ),
            ],
            options={
                "db_table": "voiture",
                "constraints": [
                    models.CheckConstraint(
                        check=models.Q(carburant__in=["Essence", "Diesel", "Hybride", "Electrique"]),
                        name="voiture_carburant_valide",
                    ),
                    models.CheckConstraint(
                        check=models.Q(statut__in=["disponible", "loue", "maintenance"]),
                        name="voiture_statut_valide",
                    ),
                ],
            },
        ),
        migrations.CreateModel(
            name="Reservation",
            fields=[
                ("id_reservation", models.AutoField(primary_key=True, serialize=False)),
                ("date_reservation", models.DateField(default=datetime.date.today)),
                ("date_debut", models.DateField()),
                ("date_fin", models.DateField()),
                ("statut", models.CharField(default="en_attente", max_length=20)),
                ("montant_total", models.DecimalField(decimal_places=2, max_digits=10)),
                (
                    "client",
                    models.ForeignKey(
                        db_column="id_client",
                        on_delete=django.db.models.deletion.PROTECT,
                        to="location.client",
                    ),
                ),
                (
                    "voiture",
                    models.ForeignKey(
                        db_column="id_voiture",
                        on_delete=django.db.models.deletion.PROTECT,
                        to="location.voiture",
                    ),
                ),
            ],
            options={
                "db_table": "reservation",
                "constraints": [
                    models.CheckConstraint(
                        check=models.Q(statut__in=["en_attente", "confirmee", "terminee", "annulee"]),
                        name="reservation_statut_valide",
                    ),
                    models.CheckConstraint(
                        check=models.Q(date_fin__gte=models.F("date_debut")),
                        name="reservation_dates_valides",
                    ),
                ],
            },
        ),
        migrations.CreateModel(
            name="Paiement",
            fields=[
                ("id_paiement", models.AutoField(primary_key=True, serialize=False)),
                ("date_paiement", models.DateField(default=datetime.date.today)),
                ("montant", models.DecimalField(decimal_places=2, max_digits=10)),
                ("mode_paiement", models.CharField(max_length=20)),
                ("reference", models.CharField(blank=True, max_length=50, null=True)),
                (
                    "reservation",
                    models.ForeignKey(
                        db_column="id_reservation",
                        on_delete=django.db.models.deletion.PROTECT,
                        to="location.reservation",
                    ),
                ),
            ],
            options={
                "db_table": "paiement",
                "constraints": [
                    models.CheckConstraint(
                        check=models.Q(mode_paiement__in=["especes", "mobile_money", "carte", "virement"]),
                        name="paiement_mode_valide",
                    ),
                    models.CheckConstraint(
                        check=models.Q(montant__gt=0),
                        name="paiement_montant_positif",
                    ),
                ],
            },
        ),
        migrations.RunPython(creer_vues_postgresql, migrations.RunPython.noop),
    ]
