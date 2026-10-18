from django.db import migrations


def creer_declencheurs_postgresql(apps, schema_editor):
    if schema_editor.connection.vendor != "postgresql":
        return

    commandes = [
        """
        CREATE OR REPLACE FUNCTION location_reservation_apres_insert()
        RETURNS trigger AS $$
        BEGIN
            IF NEW.statut = 'confirmee' THEN
                UPDATE voiture
                SET statut = 'loue'
                WHERE id_voiture = NEW.id_voiture
                  AND statut = 'disponible';
            END IF;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql
        """,
        """
        CREATE TRIGGER trg_reservation_apres_insert
        AFTER INSERT ON reservation
        FOR EACH ROW EXECUTE FUNCTION location_reservation_apres_insert()
        """,
        """
        CREATE OR REPLACE FUNCTION location_reservation_apres_update()
        RETURNS trigger AS $$
        BEGIN
            IF NEW.statut = 'confirmee' AND OLD.statut <> 'confirmee' THEN
                UPDATE voiture
                SET statut = 'loue'
                WHERE id_voiture = NEW.id_voiture
                  AND statut = 'disponible';
            ELSIF NEW.statut IN ('terminee', 'annulee')
                  AND OLD.statut = 'confirmee' THEN
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
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql
        """,
        """
        CREATE TRIGGER trg_reservation_apres_update
        AFTER UPDATE ON reservation
        FOR EACH ROW EXECUTE FUNCTION location_reservation_apres_update()
        """,
    ]

    with schema_editor.connection.cursor() as curseur:
        for commande in commandes:
            curseur.execute(commande)


class Migration(migrations.Migration):
    dependencies = [("location", "0001_initial")]

    operations = [
        migrations.RunPython(
            creer_declencheurs_postgresql,
            migrations.RunPython.noop,
        ),
    ]
