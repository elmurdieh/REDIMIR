from django.shortcuts import render, redirect
from django.contrib import messages
from functools import wraps
from registros_crud.models import *
from clientes_crud.models import *
from operadores_crud.models import *
from django.http import FileResponse
from registros_crud.forms import *

# Decorador para requerir sesión operador
def operador_required(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if not request.session.get("operador_id"):
            return redirect("login")  # el mismo login que admin
        return view_func(request, *args, **kwargs)
    return _wrapped_view

@operador_required
def operador_panel(request):
    operador_id = request.session.get("operador_id")
    operador_nombre = request.session.get("operador_nombre")

    registros_info = Residuos.objects.all().select_related('idOperador', 'idCliente', 'idUbicacion').order_by('-id')
    clientes_info = Cliente.objects.order_by('nombre')
    operadores_info = Operador.objects.order_by('nombre')
    ubicaciones_info = UbicacionCl.objects.order_by('calle')
    if request.method == 'POST':
        if 'submit_registro' in request.POST:
            form_registro = registrosForm(request.POST, request.FILES)
            if form_registro.is_valid():
                form_registro.save()
                messages.success(request, 'Registro enlistado correctamente.')
                return redirect('operador_panel')
            else:
                messages.error(request, "Error al enlistar Registro.")
                print(form_registro.errors)

    return render(request, "operador_panel/operador_panel.html", {
        'operador_id': operador_id,
        'operador_nombre': operador_nombre,
        'registros_info': registros_info,
        'clientes_info': clientes_info,
        'operadores_info': operadores_info,
        'ubicaciones_info': ubicaciones_info,
    })

def logout_operador(request):
    request.session.flush()
    return redirect("inicio_sesion")

@operador_required
def operador_registros(request):
    operador_id = request.session.get("operador_id")
    operador_nombre = request.session.get("operador_nombre")

    registros_info = Residuos.objects.all().select_related('idOperador', 'idCliente', 'idUbicacion').order_by('-id')
    clientes_info = Cliente.objects.order_by('nombre')
    operadores_info = Operador.objects.order_by('nombre')
    ubicaciones_info = UbicacionCl.objects.order_by('calle')
    return render(request, "operador_panel/operador_registros.html",{
        'operador_id': operador_id,
        'operador_nombre': operador_nombre,
        'registros_info': registros_info,
        'clientes_info': clientes_info,
        'operadores_info': operadores_info,
        'ubicaciones_info': ubicaciones_info,
    })