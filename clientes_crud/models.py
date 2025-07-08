from django.db import models

class Cliente(models.Model):
    nombre = models.CharField(max_length=30)
    correo = models.EmailField(unique=True)
    telefono = models.IntegerField()
    estado = models.BooleanField(default=True, blank=True)
    imagen = models.ImageField(
        upload_to='img/cliente/',
        blank=True,
        null=True,
        default='img/cliente/default.png')

class UbicacionCl(models.Model):
    idCliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    numero = models.IntegerField()
    calle = models.CharField(max_length=30)
