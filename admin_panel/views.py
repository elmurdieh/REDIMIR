from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.hashers import check_password
from django.http import FileResponse
from .models import Administrador
from registros_crud.models import *
from clientes_crud.models import *
from operadores_crud.models import *
from .utils import admin_required

from django.utils import timezone
from datetime import datetime
import locale
from django.conf import settings
from docx import Document
from docx.shared import Pt
from docx.oxml.ns import qn
import os, time, threading
from docx2pdf import convert


def index(request):
    if request.session.get("admin_id"):
        return redirect("admin_panel")
    if request.method == "POST":
        rut = request.POST.get("rut", "").strip()
        pwd = request.POST.get("password", "")
        try:
            admin = Administrador.objects.get(rut=rut)
            if check_password(pwd, admin.contraseña):
                request.session["admin_id"] = admin.id
                request.session["admin_nombre"] = admin.nombre
                return redirect("admin_panel")
        except Administrador.DoesNotExist:
            pass
        messages.error(request, "RUT o contraseña incorrecta")
    return render(request, "admin_panel/inicio_sesion.html")

@admin_required
def admin_panel(request):
    registros_info = Residuos.objects.all().select_related('idOperador','idCliente','idUbicacion').order_by('-id')
    clientes_info = Cliente.objects.order_by('nombre')
    operadores_info = Operador.objects.order_by('nombre')
    ubicaciones_info = UbicacionCl.objects.order_by('calle')
    return render(request, "admin_panel/admin_panel.html",{
        "active": "panel",
        'registros_info': registros_info,
        'clientes_info': clientes_info,
        'operadores_info': operadores_info,
        'ubicaciones_info': ubicaciones_info,
    })

def logout_admin(request):
    request.session.flush()
    return redirect("inicio_sesion")

@admin_required
def generar_certificado(request):
    clientes_info = Cliente.objects.order_by('nombre')
    return render(request, "admin_panel/generar_certificado.html",{
        'clientes_info': clientes_info,
    })


def generarCertificado(request):
    if not request.session.get('admin_id'):
        messages.warning(request, "Debes iniciar sesión para generar certificados.")
        return redirect('admin_panel')

    if request.method == 'POST':
        cliente_id = request.POST.get('cliente_id')
        anio = request.POST.get('anio')
        mes = request.POST.get('mes')
        tipo = request.POST.get('tipo_certificado')

        if not all([cliente_id, anio, mes, tipo]):
            messages.error(request, "Completa todos los campos para generar el certificado.")
            return redirect('generar_certificado')

        try:
            cliente_id = int(cliente_id)
            anio = int(anio)
            mes = int(mes)
        except ValueError:
            messages.error(request, "Datos de cliente, año o mes inválidos.")
            return redirect('generar_certificado')
        if tipo == "2":
            residuos = Residuos.objects.filter(
                idCliente_id=cliente_id,
                fechaRegistro__year=anio,
                fechaRegistro__month=mes
                )

            eco_tipos = {
                'pallet1': 'palets',
                'carton1': 'carton',
                'papel1': 'papel',
                'plastico1': 'plastico',
                'aluminio1': 'latas',
                'tetrapak1': 'tetrapack'
            }

            totales = {clave: 0.0 for clave in eco_tipos.keys()}

            for r in residuos:
                for clave, campo in eco_tipos.items():
                    valor = getattr(r, campo)
                    if valor:
                        totales[clave] += float(valor)

            total_eco = sum(totales.values())

            cliente = Cliente.objects.get(id=cliente_id)
            try:
                locale.setlocale(locale.LC_TIME, 'es_CL.utf8')
            except locale.Error:
                try:
                    locale.setlocale(locale.LC_TIME, 'Spanish_Chile.1252')
                except locale.Error:
                    locale.setlocale(locale.LC_TIME, '')
            fecha_actual = datetime.now().strftime("%A, %d DE %B %Y").upper()
            nombre_mes = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"][mes - 1]

            ruta_plantilla = os.path.join(settings.MEDIA_ROOT, 'plantillas', 'plantillaEco.docx')
            try:
                doc = Document(ruta_plantilla)
            except Exception as e:
                messages.error(request, f"Error al cargar la plantilla: {e}")
                return redirect('generar_certificado')

            for tabla in doc.tables:
                for fila in tabla.rows:
                    for celda in fila.cells:
                        for clave, valor in totales.items():
                            if clave in celda.text:
                                celda.text = celda.text.replace(clave, f"{valor:.1f}")
                        if "Total1" in celda.text:
                            celda.text = celda.text.replace("Total1", f"{total_eco:.1f}")
                        if "Cliente1" in celda.text:
                            celda.text = celda.text.replace("Cliente1", cliente.nombre)
                        if "Mes1" in celda.text:
                            celda.text = celda.text.replace("Mes1", nombre_mes)

            for p in doc.paragraphs:
                if "FechaCreacion" in p.text:
                    p.text = p.text.replace("FechaCreacion", fecha_actual)

            temp_dir = os.path.join(settings.BASE_DIR, 'temp_certs')
            os.makedirs(temp_dir, exist_ok=True)

            nombre_docx = f"TEMP_ECO_{cliente_id}_{anio}_{mes}_{timezone.now().timestamp()}.docx"
            ruta_docx = os.path.join(temp_dir, nombre_docx)
            doc.save(ruta_docx)

            nombre_pdf = f"Certificado_Eco_{cliente_id}_{anio}_{mes}.pdf"
            ruta_pdf = os.path.join(temp_dir, nombre_pdf)

            try:
                convert(ruta_docx, ruta_pdf)
            except Exception as e:
                messages.error(request, f"Error al convertir a PDF: {e}")
                return redirect('generar_certificado')

            def borrar_temporales():
                time.sleep(10)
                for f in [ruta_docx, ruta_pdf]:
                    try:
                        os.remove(f)
                    except Exception:
                        pass

            try:
                pdf = open(ruta_pdf, 'rb')
                response = FileResponse(pdf, content_type='application/pdf')
                response['Content-Disposition'] = f'attachment; filename="{nombre_pdf}"'
                threading.Thread(target=borrar_temporales).start()
                return response
            except Exception as e:
                messages.error(request, f"Error inesperado: {e}")
                return redirect('generar_certificado')
        try:
            cliente_id = int(cliente_id)
            anio = int(anio)
            mes = int(mes)
        except ValueError:
            messages.error(request, "Datos de cliente, año o mes inválidos.")
            return redirect('generar_certificado')

        residuos = Residuos.objects.filter(
            idCliente_id=cliente_id,
            fechaRegistro__year=anio,
            fechaRegistro__month=mes
        )

        tipos_residuos = ["plastico", "papel", "carton", "film", "botellas", "latas", "palets", "chatarra", "vidrio", "tetrapack"]
        totales = {tipo: 0.0 for tipo in tipos_residuos}

        for r in residuos:
            for tipo in tipos_residuos:
                valor = getattr(r, tipo)
                if valor:
                    totales[tipo] += float(valor)

        resumen = [f"{tipo.capitalize()}: {totales[tipo]:.1f}" for tipo in tipos_residuos if totales[tipo] > 0]
        if not resumen:
            messages.warning(request, "No se encontraron registros para el cliente y mes seleccionado.")
            return redirect('generar_certificado')

        texto = "\n".join(resumen)
        total_kg = sum(totales.values())

        cliente = Cliente.objects.get(id=cliente_id)
        try:
            locale.setlocale(locale.LC_TIME, 'es_CL.utf8')  # Linux/Mac
        except locale.Error:
            try:
                locale.setlocale(locale.LC_TIME, 'Spanish_Chile.1252')  # Windows
            except locale.Error:
                locale.setlocale(locale.LC_TIME, '')
        fecha_actual = datetime.now().strftime("%A, %d DE %B %Y").upper()
        nombre_mes = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"][mes - 1]

        ruta_plantilla = os.path.join(settings.MEDIA_ROOT, 'plantillas', 'plantillaCttr.docx')
        try:
            doc = Document(ruta_plantilla)
        except Exception as e:
            messages.error(request, f"Error al cargar la plantilla: {e}")
            return redirect('generar_certificado')

        fuente = "Carmen Sans SemiBold"
        for tabla in doc.tables:
            for fila in tabla.rows:
                for celda in fila.cells:
                    if "Residuos1" in celda.text:
                        celda.text = ""
                        p = celda.paragraphs[0]
                        run = p.add_run(texto)
                        run.font.name = fuente
                        run.font.size = Pt(8)
                        run._element.rPr.rFonts.set(qn('w:eastAsia'), fuente)
                    elif "Total1" in celda.text:
                        celda.text = ""
                        p = celda.paragraphs[0]
                        run = p.add_run(f"{total_kg:.1f} kg")
                        run.font.name = fuente
                        run.font.size = Pt(8)
                        run._element.rPr.rFonts.set(qn('w:eastAsia'), fuente)
                    elif "Cliente1" in celda.text:
                        celda.text = ""
                        p = celda.paragraphs[0]
                        run = p.add_run(cliente.nombre)
                        run.font.name = fuente
                        run.font.size = Pt(8)
                        run._element.rPr.rFonts.set(qn('w:eastAsia'), fuente)

        # Reemplazar fuera de las tablas
        for p in doc.paragraphs:
            if "FechaCreacion" in p.text:
                p.text = p.text.replace("FechaCreacion", fecha_actual)
            if "Mes1" in p.text:
                p.text = p.text.replace("Mes1", nombre_mes)
            if "Anio1" in p.text:
                p.text = p.text.replace("Anio1", str(anio))

        temp_dir = os.path.join(settings.BASE_DIR, 'temp_certs')
        os.makedirs(temp_dir, exist_ok=True)

        nombre_docx = f"TEMP_CTTR_{cliente_id}_{anio}_{mes}_{timezone.now().timestamp()}.docx"
        ruta_docx = os.path.join(temp_dir, nombre_docx)
        doc.save(ruta_docx)
        nombre_pdf = f"Certificado_CTTR_{cliente_id}_{anio}_{mes}.pdf"
        ruta_pdf = os.path.join(temp_dir, nombre_pdf)

        try:
            convert(ruta_docx, ruta_pdf)
        except Exception as e:
            messages.error(request, f"Error al convertir a PDF: {e}")
            return redirect('generar_certificado')

        def borrar_temporales():
            time.sleep(10)
            for f in [ruta_docx, ruta_pdf]:
                try:
                    os.remove(f)
                except Exception:
                    pass

        try:
            pdf = open(ruta_pdf, 'rb')
            response = FileResponse(pdf, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="{nombre_pdf}"'
            threading.Thread(target=borrar_temporales).start()
            return response
        except Exception as e:
            messages.error(request, f"Error inesperado: {e}")
            return redirect('generar_certificado')

    messages.error(request, "Método no permitido.")
    return redirect('generar_certificado')