from django.urls import path
from .views import clientes_crud, eliminar_cliente, cambiar_estado

urlpatterns = [
    path("", clientes_crud, name="clientes_crud"),
    path("eliminar/<int:cliente_id>/", eliminar_cliente, name="cliente_eliminar"),
    path("cambiar_estado/<int:cliente_id>/", cambiar_estado, name="cambiar_estado",)
]