from django.db.models import Sum
from rest_framework import serializers
from .models import Client, Categorie, Voiture, Reservation, Paiement


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'


class CategorieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categorie
        fields = '__all__'


class VoitureSerializer(serializers.ModelSerializer):
    categorie_libelle = serializers.CharField(source='categorie.libelle', read_only=True)

    class Meta:
        model = Voiture
        fields = '__all__'


class ReservationSerializer(serializers.ModelSerializer):
    montant_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    client_nom = serializers.SerializerMethodField()
    voiture_nom = serializers.SerializerMethodField()

    class Meta:
        model = Reservation
        fields = '__all__'

    def get_client_nom(self, obj):
        return str(obj.client)

    def get_voiture_nom(self, obj):
        return str(obj.voiture)

    def validate(self, data):
        debut = data.get('date_debut', getattr(self.instance, 'date_debut', None))
        fin = data.get('date_fin', getattr(self.instance, 'date_fin', None))
        voiture = data.get('voiture', getattr(self.instance, 'voiture', None))

        if fin < debut:
            raise serializers.ValidationError(
                "La date de fin doit être après la date de début."
            )

        chevauche = Reservation.objects.filter(
            voiture=voiture,
            statut__in=['en_attente', 'confirmee'],
            date_debut__lt=fin,
            date_fin__gt=debut,
        )
        if self.instance:
            chevauche = chevauche.exclude(pk=self.instance.pk)
        if chevauche.exists():
            raise serializers.ValidationError(
                "Cette voiture est déjà réservée sur cette période."
            )

        jours = max(1, (fin - debut).days)
        data['montant_total'] = jours * voiture.prix_jour
        return data


class PaiementSerializer(serializers.ModelSerializer):
    reservation_info = serializers.SerializerMethodField()

    class Meta:
        model = Paiement
        fields = '__all__'

    def get_reservation_info(self, obj):
        r = obj.reservation
        return f"#{r.id_reservation} - {r.client} - {r.voiture}"

    def validate(self, data):
        montant = data.get('montant', getattr(self.instance, 'montant', None))
        reservation = data.get('reservation', getattr(self.instance, 'reservation', None))

        if montant <= 0:
            raise serializers.ValidationError("Le montant doit être supérieur à 0.")

        autres = Paiement.objects.filter(reservation=reservation)
        if self.instance:
            autres = autres.exclude(pk=self.instance.pk)
        deja_paye = autres.aggregate(total=Sum('montant'))['total'] or 0

        if deja_paye + montant > reservation.montant_total:
            reste = reservation.montant_total - deja_paye
            raise serializers.ValidationError(
                f"Le total des paiements dépasserait le montant de la réservation. Reste à payer : {reste}"
            )

        return data