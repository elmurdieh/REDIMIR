from django import forms
from .models import *

class registrosForm(forms.ModelForm):
    class Meta:
        model = Residuos
        fields = '__all__'