from django.urls import path
from . import views

urlpatterns = [
    path('', views.operador_panel, name="operador_panel"),
    path("cerrar_sesion/", views.operador_logout, name='operador_logout'),
    path("generar_registro/", views.generar_registro, name="generar_registro")
]