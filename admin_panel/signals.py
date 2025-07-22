from django.db.models.signals import post_migrate
from django.dispatch import receiver
from django.contrib.auth.hashers import make_password
from .models import Administrador

@receiver(post_migrate)
def crear_admin_por_defecto(sender, **kwargs):
    if sender.name == 'admin_panel':  # solo ejecutar cuando se migra esta app
        rut = "12345678-9"
        if not Administrador.objects.filter(rut=rut).exists():
            Administrador.objects.create(
                nombre="Administrador General",
                rol="Administrador",
                rut=rut,
                email="admin@redimir.cl",
                contraseña=make_password("123")
            )
            print("✅ Usuario administrador por defecto creado.")
