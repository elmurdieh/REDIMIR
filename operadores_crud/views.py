from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.contrib import messages
from django.db.models import Count
from admin_panel.utils import admin_required
from .models import *
from registros_crud.models import *
from .forms import *

@admin_required
def operadores_crud(request):
    operadores_info = Operador.objects.order_by("nombre")
    total_operadores = operadores_info.count()
    form_operador = OperadorForm()
    operador_top = (
    Residuos.objects
    .values('idOperador__id', 'idOperador__nombre')  # agrupar por operador
    .annotate(total=Count('idOperador'))  # contar registros por operador
    .order_by('-total')  # orden descendente
    .first())

    if request.method == 'POST':
        if 'submit_operador' in request.POST:
            form_operador = OperadorForm(request.POST)
            if form_operador.is_valid():
                form_operador.save()
                messages.success(
                request,
                'Operador generado correctamente.'
            )
                return redirect('operadores_crud')  
            else:
                messages.error(request, "Error al generar operador.")
                print(form_operador.errors)
    
    return render(request, "operadores_crud/operadores.html",
                  {"active": "operadores",
                   'operadores_info':operadores_info,
                   'total_operadores': total_operadores,
                   'operador_top_registros': operador_top,
                   }
                   )

@admin_required
def eliminar_operador(request, operador_id):
    operador = get_object_or_404(Operador, id=operador_id)
    operador.delete()
    return redirect('operadores_crud')

@admin_required
def cambiar_estado(request, operador_id):
    if request.method == 'POST':
        operador = get_object_or_404(Operador, id=operador_id)
        operador.estado = not operador.estado
        operador.save()
        return JsonResponse({
            'success': True,
            'id': operador.id,
            'nombre': operador.nombre,
            'rut': operador.rut,
            'email': operador.email,
            'estado': operador.estado
        })
    return JsonResponse({'success': False}, status=405)

@admin_required
def operador_perfil(request, operador_id):
    operador = get_object_or_404(Operador, id=operador_id)
    return render(request, "operadores_crud/operador.html",
                  {"active": "operadores",
                   'operador_info':operador,
                   })