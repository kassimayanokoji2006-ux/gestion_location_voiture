from django.db.models import Sum
from rest_framework import serializers
from .models import Categorie, Client, Voiture, Reservation, Paiement


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'

class CategorieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categorie
        fields = '__all__'

class VoitureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Voiture
        fields = '__all__'

class ReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = '__all__'

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