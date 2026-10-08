from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClientViewSet , CategorieViewSet,tableau_de_bord, PaiementViewSet, ReservationViewSet, VoitureViewSet,ReservationViewSet, PaiementViewSet, voitures_disponibles

router = DefaultRouter()
router.register('clients', ClientViewSet)
router.register('categories', CategorieViewSet)
router.register('voitures', VoitureViewSet)
router.register('reservations', ReservationViewSet)
router.register('paiements', PaiementViewSet)

urlpatterns = [
    path('voitures-disponibles/', voitures_disponibles),
    path('tableau-de-bord/', tableau_de_bord),
    path('', include(router.urls)),
]