from rest_framework import viewsets
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