from django.shortcuts import render, redirect
from django.contrib import messages
from functools import wraps
from registros_crud.models import *
from clientes_crud.models import *
from operadores_crud.models import *
from django.http import FileResponse
from registros_crud.forms import *
import json

# Decorador para requerir sesión operador
def operador_required(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if not request.session.get("operador_id"):
            return redirect("login")
        return view_func(request, *args, **kwargs)
    return _wrapped_view

@operador_required
def operador_panel(request):
    operador_id = request.session.get("operador_id")
    operador_nombre = request.session.get("operador_nombre")

    registros_info = Residuos.objects.all().select_related('idOperador', 'idCliente', 'idUbicacion').order_by('-id')
    clientes_info = Cliente.objects.order_by('nombre')
    operadores_info = Operador.objects.order_by('nombre')
    ubicaciones_info = []
    for ubicacion in UbicacionCl.objects.select_related('idCliente').order_by('calle'):
        ubicaciones_info.append({
            'id': ubicacion.id,
            'clienteId': ubicacion.idCliente.id,
            'calle': ubicacion.calle,
            'numero': ubicacion.numero
        })

    return render(request, "operador_panel/operador_panel.html", {
        'operador_id': operador_id,
        'operador_nombre': operador_nombre,
        'registros_info': registros_info,
        'clientes_info': clientes_info,
        'operadores_info': operadores_info,
        'ubicaciones_info': json.dumps(ubicaciones_info),
    })

def operador_logout(request):
    request.session.flush()
    return redirect("inicio_sesion")

@operador_required
def generar_registro(request):
    if request.method == "POST":
        try:
            operador_id = request.POST.get("idOperador")
            cliente_id = request.POST.get("idCliente")
            ubicacion_id = request.POST.get("idUbicacion")
            fecha_registro = request.POST.get("fechaRegistro")

            # 1️⃣ Crear el registro principal de residuos
            residuo = Residuos.objects.create(
                idOperador_id=operador_id,
                idCliente_id=cliente_id,
                idUbicacion_id=ubicacion_id,
                fechaRegistro=fecha_registro,
                plastico=request.POST.get("plastico") or None,
                papel=request.POST.get("papel") or None,
                carton=request.POST.get("carton") or None,
                film=request.POST.get("film") or None,
                latas=request.POST.get("latas") or None,
                palets=request.POST.get("palets") or None,
                palets_cantidad=request.POST.get("palets_cantidad") or None,
                chatarra=request.POST.get("chatarra") or None,
                vidrio=request.POST.get("vidrio") or None,
                tetrapack=request.POST.get("tetrapack") or None,
            )

            
            fotos = request.FILES.getlist("fotos")
            for foto in fotos:
                if foto.content_type not in ["image/jpeg", "image/png"]:
                    messages.error(request, f"Archivo no permitido: {foto.name}")
                    continue
                ResiduosFoto.objects.create(residuo=residuo, foto=foto)

            messages.success(request, "Registro y fotos guardados correctamente.")
            return redirect("operador_panel")

        except Exception as e:
            messages.error(request, f"Error al guardar: {str(e)}")
            return redirect("operador_panel")

    # Si no es POST, redirigir al panel
    return redirect("operador_panel")