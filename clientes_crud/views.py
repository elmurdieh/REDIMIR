from django.shortcuts import render, redirect
from django.contrib import messages
from admin_panel.utils import admin_required
from django.http import FileResponse
from .models import *
from .forms import *

@admin_required
def clientes_crud(request):
    clientes_info = Cliente.objects.order_by('nombre')
    form_cliente = ClienteForm()
    form_ubicacion = UbicacionForm()

    if request.method == 'POST':
        if 'submit_cliente' in request.POST:
            form_cliente = ClienteForm(request.POST, request.FILES)
            if form_cliente.is_valid():
                form_cliente.save()
                messages.success(request,f'Cliente “{Cliente.nombre}” generado correctamente.')
                return redirect('clientes_crud')
            else:
                print("Error al generar cliente.")
                messages.error(request, "Error al generar cliente.")
                print(form_cliente.errors)
        
        elif 'submit_ubicacion' in request.POST:
            form_ubicacion = UbicacionForm(request.POST)
            if form_ubicacion.is_valid():
                form_ubicacion.save()
                messages.success(request,f'Ubicacion “{UbicacionCl.calle}” generado correctamente.')
                return redirect('clientes_crud')
            else:
                messages.error(request, "Error al generar ubicacion.")
                print(form_ubicacion.errors)

    return render(request, "clientes_crud/clientes.html", {
        "active": "clientes",
        'clientes_info': clientes_info, 
        })
