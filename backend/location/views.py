from datetime import date
from django.db import connection
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Client,  Categorie, Voiture, Reservation,Paiement
from .serializers import ClientSerializer, CategorieSerializer, VoitureSerializer, ReservationSerializer, PaiementSerializer


class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer

class CategorieViewSet(viewsets.ModelViewSet):
    queryset = Categorie.objects.all()
    serializer_class = CategorieSerializer

class VoitureViewSet(viewsets.ModelViewSet):
    queryset = Voiture.objects.all()
    serializer_class = VoitureSerializer

class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all().order_by('-id_reservation')
    serializer_class = ReservationSerializer

class PaiementViewSet(viewsets.ModelViewSet):
    queryset = Paiement.objects.all().order_by('-id_paiement')
    serializer_class = PaiementSerializer


#ilay rcherche entre deux date

@api_view(['GET'])
def voitures_disponibles(request):
    debut = request.query_params.get('debut')
    fin = request.query_params.get('fin')

    if not debut or not fin:
        return Response(
            {"erreur": "Les paramètres 'debut' et 'fin' sont obligatoires."},
            status=400,
        )

    try:
        debut = date.fromisoformat(debut)
        fin = date.fromisoformat(fin)
    except ValueError:
        return Response(
            {"erreur": "Format de date invalide. Utilise AAAA-MM-JJ."},
            status=400,
        )

    if fin < debut:
        return Response(
            {"erreur": "La date de fin doit être après la date de début."},
            status=400,
        )

    occupees = Reservation.objects.filter(
        statut__in=['en_attente', 'confirmee'],
        date_debut__lt=fin,
        date_fin__gt=debut,
    ).values_list('voiture_id', flat=True)

    voitures = (
        Voiture.objects.exclude(statut='maintenance')
        .exclude(id_voiture__in=occupees)
    )

    serializer = VoitureSerializer(voitures, many=True)
    return Response(serializer.data)


#pour le tableau de bord
def lignes(cursor):
    colonnes = [c[0] for c in cursor.description]
    return [dict(zip(colonnes, ligne)) for ligne in cursor.fetchall()]


@api_view(['GET'])
def tableau_de_bord(request):
    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT statut, COUNT(*) AS nombre FROM voiture GROUP BY statut"
        )
        voitures = lignes(cursor)

        cursor.execute(
            "SELECT statut, COUNT(*) AS nombre FROM reservation GROUP BY statut"
        )
        reservations = lignes(cursor)

        cursor.execute(
            """
            SELECT COALESCE(SUM(montant_total), 0) AS total_facture,
                   COALESCE(SUM(total_paye), 0) AS total_encaisse,
                   COALESCE(SUM(reste_a_payer), 0) AS total_reste
            FROM v_reservation_solde
            WHERE statut <> 'annulee'
            """
        )
        finances = lignes(cursor)[0]

        cursor.execute(
            """
            SELECT marque, modele, immatriculation, nb_reservations, chiffre_affaires
            FROM v_voitures_plus_louees
            ORDER BY nb_reservations DESC, chiffre_affaires DESC
            LIMIT 5
            """
        )
        top_voitures = lignes(cursor)

    return Response({
        'voitures': voitures,
        'reservations': reservations,
        'finances': finances,
        'top_voitures': top_voitures,
    })