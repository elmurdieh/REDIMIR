from django import forms
from .models import *

class ClienteForm(forms.ModelForm):
    class Meta:
        model = Cliente
        exclude = ['estado']


class UbicacionForm(forms.ModelForm):
    class Meta:
        model = UbicacionCl
        fields = '__all__'