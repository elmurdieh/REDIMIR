from django.urls import path
from .views import operadores_crud
urlpatterns = [path("", operadores_crud, name="operadores_crud")]