from django.db import models
from django.contrib.auth.hashers import make_password

class Operador(models.Model):
    nombre = models.CharField(max_length=50)
    rut = models.CharField(max_length=10, unique=True)
    email = models.EmailField(unique=True)
    contraseña = models.CharField(max_length=130)
    estado = models.BooleanField(default=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.contraseña.startswith('pbkdf2_'):
            self.contraseña = make_password(self.contraseña)
        super().save(*args, **kwargs)
