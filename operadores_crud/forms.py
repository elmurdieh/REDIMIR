from django import forms
from .models import *

class OperadorForm(forms.ModelForm):
    class Meta:
        model = Operador
        exclude = ['estado']