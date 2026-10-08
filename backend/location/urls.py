from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClientViewSet , CategorieViewSet, PaiementViewSet, ReservationViewSet, VoitureViewSet,ReservationViewSet, PaiementViewSet

router = DefaultRouter()
router.register('clients', ClientViewSet)
router.register('categories', CategorieViewSet)
router.register('voitures', VoitureViewSet)
router.register('reservations', ReservationViewSet)
router.register('paiements', PaiementViewSet)

urlpatterns = [
    path('', include(router.urls)),
]