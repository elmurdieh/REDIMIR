from django.db import models
from operadores_crud.models import Operador
from clientes_crud.models import Cliente, UbicacionCl
from admin_panel.models import Administrador

class Residuos(models.Model):
    idOperador = models.ForeignKey(Operador, on_delete=models.CASCADE)
    idCliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    idUbicacion = models.ForeignKey(UbicacionCl, on_delete=models.CASCADE)
    fechaRegistro = models.DateField()
    #Residuos
    plastico = models.DecimalField(null=True,blank=True, max_digits=3, decimal_places=1)
    papel = models.DecimalField(null=True,blank=True, max_digits=3, decimal_places=1)
    carton = models.DecimalField(null=True,blank=True, max_digits=3, decimal_places=1)
    film = models.DecimalField(null=True,blank=True, max_digits=3, decimal_places=1)
    #botellas = models.DecimalField( blank=True, max_digits=3, decimal_places=1)
    latas = models.DecimalField(null=True,blank=True, max_digits=3, decimal_places=1)
    palets = models.DecimalField(null=True,blank=True, max_digits=3, decimal_places=1)
    palets_cantidad = models.IntegerField(null=True,blank=True)
    chatarra = models.DecimalField(null=True,blank=True, max_digits=3, decimal_places=1)
    vidrio = models.DecimalField(null=True,blank=True, max_digits=3, decimal_places=1)
    tetrapack = models.DecimalField(null=True,blank=True, max_digits=3, decimal_places=1)
    foto = models.ImageField(upload_to='img/fotos/', null=True, blank=True)

class Certificado(models.Model):
    idcliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    idAdministrador = models.ForeignKey(Administrador, on_delete=models.CASCADE)
    fechaCreacion = models.DateTimeField(auto_now_add=True)
    tipo = models.CharField(max_length=4)

class Conforma(models.Model):
    idResiduo = models.ForeignKey(Residuos, on_delete=models.CASCADE)
    idCertificado = models.ForeignKey(Certificado, on_delete=models.CASCADE)
