from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="inicio_sesion"),
    path("panel/", views.admin_panel, name="admin_panel"),
    path("logout/", views.logout_admin, name='logout_admin'),
    path("panel/generar/", views.generar_certificado, name="generar_certificado"),
    path("panel/generar_certificado/", views.generarCertificado, name="generarCertificado"),
    # Rutas Api graficos
    path('api/grafico-barras/', views.api_grafico_barras, name='api_grafico_barras'),
]