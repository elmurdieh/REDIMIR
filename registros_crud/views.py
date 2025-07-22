# registros_crud/views.py
from django.shortcuts import render, redirect
from django.contrib import messages
from admin_panel.utils import admin_required
from django.http import FileResponse, JsonResponse
from .models import *
from clientes_crud.models import *
from operadores_crud.models import *
from .forms import *
from django.shortcuts import get_object_or_404


@admin_required
def registros_crud(request):
    registros_info = Residuos.objects.all().select_related('idOperador','idCliente','idUbicacion').order_by('-id')
    clientes_info = Cliente.objects.order_by('nombre')
    operadores_info = Operador.objects.order_by('nombre')
    ubicaciones_info = UbicacionCl.objects.order_by('calle')
    form_registro = registrosForm()
    
    if request.method == 'POST':
        if 'submit_registro' in request.POST:
            form_registro = registrosForm(request.POST, request.FILES)
            if form_registro.is_valid():
                form_registro.save()
                messages.success(request, 'Registro enlistado correctamente.')
                return redirect('registros_crud')
            else:
                messages.error(request, "Error al enlistar Registro.")
                print(form_registro.errors)
    
    return render(request, "registros_crud/registros.html", {
        "active": "registros",
        'registros_info': registros_info,
        'clientes_info': clientes_info,
        'operadores_info': operadores_info,
        'ubicaciones_info': ubicaciones_info,
        })

@admin_required
def eliminar_registro(request, id):
    registro = get_object_or_404(Residuos, id=id)
    if request.method == "POST":
        registro.delete()
        messages.success(request, "Registro eliminado correctamente.")
    return redirect('registros_crud')

@admin_required
def obtener_ubicaciones(request):
    cliente_id = request.GET.get("cliente_id")
    ubicaciones = UbicacionCl.objects.filter(idCliente_id=cliente_id).values("id", "calle", "numero")
    return JsonResponse(list(ubicaciones), safe=False)