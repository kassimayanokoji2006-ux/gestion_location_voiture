from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClientViewSet , CategorieViewSet, VoitureViewSet, ReservationViewSet

router = DefaultRouter()
router.register('clients', ClientViewSet)
router.register('categories', CategorieViewSet)
router.register('voitures', VoitureViewSet)
router.register('reservations', ReservationViewSet)

urlpatterns = [
    path('', include(router.urls)),
]