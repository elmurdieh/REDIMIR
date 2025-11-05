from django.urls import path
from .views import operadores_crud, eliminar_operador, cambiar_estado, operador_perfil

urlpatterns = [
    path("", operadores_crud, name="operadores_crud"),
    path("eliminar/<int:operador_id>/", eliminar_operador, name="operador_eliminar"),
    path("cambiar_estado/<int:operador_id>/", cambiar_estado, name="cambiar_estado"),
    path("perfil_operador/<int:operador_id>/", operador_perfil, name='operador_perfil'),
    ]