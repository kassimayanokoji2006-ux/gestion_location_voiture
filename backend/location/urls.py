from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClientViewSet , CategorieViewSet

router = DefaultRouter()
router.register('clients', ClientViewSet)
router.register('categories', CategorieViewSet)

urlpatterns = [
    path('', include(router.urls)),
]