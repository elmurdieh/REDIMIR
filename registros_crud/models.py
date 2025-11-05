from django.db import models
from django.utils import timezone
from operadores_crud.models import Operador
from clientes_crud.models import Cliente, UbicacionCl
from admin_panel.models import Administrador

class Residuos(models.Model):
    idOperador = models.ForeignKey(Operador, on_delete=models.CASCADE)
    idCliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    idUbicacion = models.ForeignKey(UbicacionCl, on_delete=models.CASCADE)
    fechaRegistro = models.DateField()
    fechaCreacion = models.DateTimeField(auto_now_add=True)
    #Residuos
    plastico = models.DecimalField(null=True,blank=True, max_digits=3, decimal_places=1)
    papel = models.DecimalField(null=True,blank=True, max_digits=3, decimal_places=1)
    carton = models.DecimalField(null=True,blank=True, max_digits=3, decimal_places=1)
    film = models.DecimalField(null=True,blank=True, max_digits=3, decimal_places=1)
    #botellas = models.DecimalField( blank=True, max_digits=3, decimal_places=1) jskajskajksa como que "botellas"
    latas = models.DecimalField(null=True,blank=True, max_digits=3, decimal_places=1)
    palets = models.DecimalField(null=True,blank=True, max_digits=3, decimal_places=1)
    palets_cantidad = models.IntegerField(null=True,blank=True)
    chatarra = models.DecimalField(null=True,blank=True, max_digits=3, decimal_places=1)
    vidrio = models.DecimalField(null=True,blank=True, max_digits=3, decimal_places=1)
    tetrapack = models.DecimalField(null=True,blank=True, max_digits=3, decimal_places=1)

class ResiduosFoto(models.Model):
    residuo = models.ForeignKey(Residuos, related_name='fotos', on_delete=models.CASCADE)
    foto = models.ImageField(upload_to='img/fotos/')
    fecha_subida = models.DateTimeField(auto_now_add=True)

class Certificado(models.Model):
    idCliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    idAdministrador = models.ForeignKey(Administrador, on_delete=models.CASCADE)
    fechaCreacion = models.DateField()
    tipoCertificado = models.CharField(max_length=5)