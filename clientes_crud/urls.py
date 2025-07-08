from django.urls import path
from .views import clientes_crud

urlpatterns = [path("", clientes_crud, name="clientes_crud")]