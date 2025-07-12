from django.urls import path
from . import views

urlpatterns = [
    path('', views.operador_panel, name="operador_panel"),
    path("logout_operador/", views.logout_operador, name='logout_operador'),
    path('operador_registros/', views.operador_registros, name="operador_registros")
]