from django.urls import path
from .views import registros_crud, eliminar_registro, obtener_ubicaciones


urlpatterns = [
    path("", registros_crud, name="registros_crud"),
    path('eliminar/<int:id>/',eliminar_registro, name='eliminar_registro'),
    path("ubicaciones/", obtener_ubicaciones, name="obtener_ubicaciones"),
]