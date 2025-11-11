// Variables globales
let chartBarras = null;
let chartTorta = null;
let clienteSeleccionadoId = null;
let clienteSeleccionadoNombre = null;
let ultimosDatos = null; // Para sincronizar ambos gráficos

const mapaResiduos = {
  'plastico': 'Plástico',
  'carton': 'Cartón',
  'papel': 'Papel',
  'film': 'Films',
  'latas': 'Latas',
  'palets': 'Palets',
  'chatarra': 'Chatarra',
  'vidrio': 'Vidrio',
  'tetrapack': 'Tetrapack'
};

const coloresResiduos = {
  'Plástico': 'rgba(54, 162, 235, 0.7)',
  'Cartón': 'rgba(255, 206, 86, 0.7)',
  'Papel': 'rgba(201, 203, 207, 0.7)',
  'Films': 'rgba(153, 102, 255, 0.7)',
  'Latas': 'rgba(255, 159, 64, 0.7)',
  'Palets': 'rgba(75, 192, 192, 0.7)',
  'Chatarra': 'rgba(128, 128, 128, 0.7)',
  'Vidrio': 'rgba(0, 255, 127, 0.7)',
  'Tetrapack': 'rgba(255, 99, 132, 0.7)'
};

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', () => {
  console.log('[Gráficos] Inicializando...');
  
  const fechaActual = new Date();
  const mesActual = fechaActual.getMonth() + 1;
  const anioActual = fechaActual.getFullYear();
  
  document.getElementById('filtroMesGrafico').value = mesActual;
  document.getElementById('filtroAnioGrafico').value = anioActual;
  document.getElementById('filtroAnioGrafico').placeholder = `Año actual (${anioActual})`;
  
  actualizarGraficoBarras();
});
document.addEventListener('DOMContentLoaded', function() {
    cargarUltimoRegistro();
});

function cargarUltimoRegistro() {
    const tablaBody = document.getElementById('tabla-ultimo-registro');
    
    // ✅ CORRECCIÓN: La URL debe construirse correctamente
    const url = '/ajax/ultimo-registro/'; // URL hardcodeada
    // O si prefieres, puedes pasarla desde el HTML como data-attribute
    
    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('[AJAX] Datos recibidos:', data);
        
        if (data.success) {
            const registro = data.registro_basico;
            
            const nuevaFila = `
                <tr>
                    <td>${registro.operador}</td>
                    <td>${registro.cliente}</td>
                    <td>${registro.fecha_subida}</td>
                    <td>
                        <button 
                            type="button" 
                            class="btn btn-sm boton-principal" 
                            onclick='mostrarDetallesRegistro(${JSON.stringify(data.registro_detallado).replace(/'/g, "&#39;")})'
                            title="Ver detalles del registro ID: ${registro.id}"
                        >
                            Ver
                        </button>
                    </td>
                </tr>
            `;
            tablaBody.innerHTML = nuevaFila;
        } else {
            tablaBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Error: ${data.error}</td></tr>`;
        }
    })
    .catch(error => {
        console.error('[AJAX] Error al cargar el último registro:', error);
        tablaBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Error de conexión con el servidor.</td></tr>`;
    });
}

function mostrarDetallesRegistro(detalles) {
    console.log('[MODAL] Datos detallados:', detalles);
    
    // Crear el HTML del modal con mejor estructura
    let residuosHTML = '';
    let tieneResiduos = false;
    
    const etiquetas = {
        'plastico': 'Plástico',
        'papel': 'Papel',
        'carton': 'Cartón',
        'film': 'Films',
        'latas': 'Latas',
        'palets': 'Palets',
        'palets_cantidad': 'Palets (Cantidad)',
        'chatarra': 'Chatarra',
        'vidrio': 'Vidrio',
        'tetrapack': 'Tetrapack'
    };
    
    for (const [key, value] of Object.entries(detalles.residuos)) {
        const valorNum = parseFloat(value);
        if (valorNum > 0) {
            tieneResiduos = true;
            const unidad = key === 'palets_cantidad' ? 'unidades' : 'Kg';
            residuosHTML += `
                <li class="d-flex justify-content-between align-items-center">
                    <span><strong>${etiquetas[key] || key}:</strong></span>
                    <span class="badge bg-success">${valorNum.toFixed(1)} ${unidad}</span>
                </li>
            `;
        }
    }
    
    if (!tieneResiduos) {
        residuosHTML = '<li class="text-center text-muted py-3">No hay residuos registrados</li>';
    }
    
    // ✅ NUEVO: Crear galería de fotos
    let fotosHTML = '';
    if (detalles.fotos && detalles.fotos.length > 0) {
        fotosHTML = `
            <hr>
            <div class="fotos-section">
                <h6 class="mb-3">
                    <i class="bi bi-camera-fill me-2"></i>
                    Evidencia Fotográfica (${detalles.fotos.length})
                </h6>
                <div class="row g-2">
        `;
        
        detalles.fotos.forEach((fotoUrl, index) => {
            fotosHTML += `
                <div class="col-md-4 col-6">
                    <div class="foto-item">
                        <img 
                            src="${fotoUrl}" 
                            alt="Foto ${index + 1}" 
                            class="img-thumbnail foto-thumbnail"
                            onclick="ampliarFoto('${fotoUrl}')"
                            style="cursor: pointer; width: 100%; height: 150px; object-fit: cover;"
                        >
                    </div>
                </div>
            `;
        });
        
        fotosHTML += `
                </div>
            </div>
        `;
    }
    
    const modalContent = `
        <div class="row g-3">
            <div class="col-md-6">
                <div class="info-item">
                    <small class="text-muted">ID del Registro</small>
                    <h6 class="mb-0">${detalles.id}</h6>
                </div>
            </div>
            <div class="col-md-6">
                <div class="info-item">
                    <small class="text-muted">Operador</small>
                    <h6 class="mb-0">${detalles.operador}</h6>
                </div>
            </div>
            <div class="col-md-6">
                <div class="info-item">
                    <small class="text-muted">Cliente</small>
                    <h6 class="mb-0">${detalles.cliente}</h6>
                </div>
            </div>
            <div class="col-md-6">
                <div class="info-item">
                    <small class="text-muted">Ubicación</small>
                    <h6 class="mb-0">${detalles.ubicacion}</h6>
                </div>
            </div>
            <div class="col-md-6">
                <div class="info-item">
                    <small class="text-muted">Fecha de Registro</small>
                    <h6 class="mb-0">${detalles.fecha_registro_manual}</h6>
                </div>
            </div>
            <div class="col-md-6">
                <div class="info-item">
                    <small class="text-muted">Fecha de Creación</small>
                    <h6 class="mb-0">${detalles.fecha_creacion}</h6>
                </div>
            </div>
        </div>
        
        <hr>
        
        <div class="residuos-section">
            <h6 class="mb-3">
                <i class="bi bi-recycle me-2"></i>
                Residuos Recolectados
            </h6>
            <ul class="list-unstyled">${residuosHTML}</ul>
        </div>
        
        ${fotosHTML}
    `;
    
    document.getElementById('modalDetalleContenido').innerHTML = modalContent;
    
    // Mostrar el modal usando Bootstrap
    const modalElement = document.getElementById('modalDetalleRegistro');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}

// ✅ NUEVA FUNCIÓN: Ampliar foto en modal
function ampliarFoto(fotoUrl) {
    const modalHTML = `
        <div class="modal fade" id="modalFotoAmpliada" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-xl">
                <div class="modal-content bg-dark">
                    <div class="modal-header border-0">
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center p-0">
                        <img src="${fotoUrl}" class="img-fluid" style="max-height: 80vh; width: auto;">
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Eliminar modal anterior si existe
    const modalAnterior = document.getElementById('modalFotoAmpliada');
    if (modalAnterior) modalAnterior.remove();
    
    // Agregar nuevo modal al body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('modalFotoAmpliada'));
    modal.show();
    
    // Eliminar del DOM cuando se cierre
    document.getElementById('modalFotoAmpliada').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}
// ==================== SELECCIÓN DE CLIENTE ====================
function seleccionarClienteGrafico(clienteId, clienteNombre) {
  console.log('[Gráficos] Cliente seleccionado:', clienteId, clienteNombre);
  
  clienteSeleccionadoId = clienteId;
  clienteSeleccionadoNombre = clienteNombre;
  
  const contenedor = document.getElementById('contenedorClienteGrafico');
  contenedor.innerHTML = `
    <div class="alert alert-info mb-0 d-flex justify-content-between align-items-center">
      <span><i class="bi bi-check-circle-fill"></i> <strong>${clienteNombre}</strong></span>
      <button type="button" class="btn btn-sm btn-outline-primary" data-bs-toggle="modal" data-bs-target="#modalClienteGrafico">
        Cambiar
      </button>
    </div>
    <small class="text-muted d-block mt-2">Mostrando solo este cliente</small>
  `;
  
  const modalCliente = bootstrap.Modal.getInstance(document.getElementById('modalClienteGrafico'));
  if (modalCliente) modalCliente.hide();
  
  setTimeout(() => {
    const modalConfig = new bootstrap.Modal(document.getElementById('modalConfigGrafico'));
    modalConfig.show();
  }, 300);
}

// ==================== LIMPIAR FILTROS ====================
function limpiarFiltrosGrafico() {
  console.log('[Gráficos] Limpiando filtros...');
  
  clienteSeleccionadoId = null;
  clienteSeleccionadoNombre = null;
  
  const contenedor = document.getElementById('contenedorClienteGrafico');
  contenedor.innerHTML = `
    <button type="button" class="btn btn-outline-primary w-100" data-bs-toggle="modal" data-bs-target="#modalClienteGrafico">
      <i class="bi bi-building"></i> Seleccionar Cliente Específico
    </button>
    <small class="text-muted d-block mt-2">Por defecto muestra todos los clientes</small>
  `;
  
  const fechaActual = new Date();
  const mesActual = fechaActual.getMonth() + 1;
  const anioActual = fechaActual.getFullYear();
  
  document.getElementById('filtroMesGrafico').value = mesActual;
  document.getElementById('filtroAnioGrafico').value = anioActual;
  
  document.getElementById('checkTodos').checked = true;
  document.querySelectorAll('.checkbox-residuo').forEach(cb => cb.checked = true);
  
  actualizarGraficoBarras();
  
  const modalConfig = bootstrap.Modal.getInstance(document.getElementById('modalConfigGrafico'));
  if (modalConfig) modalConfig.hide();
}

// ==================== APLICAR CONFIGURACIÓN ====================
function aplicarConfiguracion() {
  console.log('[Gráficos] Aplicando configuración...');
  actualizarGraficoBarras();
  
  const modal = bootstrap.Modal.getInstance(document.getElementById('modalConfigGrafico'));
  if (modal) modal.hide();
}

// ==================== CHECKBOXES ====================
function toggleTodosCheckbox() {
  const checkTodos = document.getElementById('checkTodos');
  const checkboxes = document.querySelectorAll('.checkbox-residuo');
  checkboxes.forEach(checkbox => checkbox.checked = checkTodos.checked);
}

function actualizarCheckTodos() {
  const checkboxes = document.querySelectorAll('.checkbox-residuo');
  const checkTodos = document.getElementById('checkTodos');
  const todosChecked = Array.from(checkboxes).every(cb => cb.checked);
  checkTodos.checked = todosChecked;
}

function obtenerResiduosSeleccionados() {
  const checkboxes = document.querySelectorAll('.checkbox-residuo:checked');
  return Array.from(checkboxes).map(cb => cb.value);
}

// ==================== ACTUALIZAR GRÁFICOS ====================
async function actualizarGraficoBarras() {
  console.log('[Gráficos] Actualizando gráficos...');
  
  const anio = document.getElementById('filtroAnioGrafico').value || new Date().getFullYear();
  const mes = document.getElementById('filtroMesGrafico').value;
  const residuosSeleccionados = obtenerResiduosSeleccionados();
  
  if (residuosSeleccionados.length === 0) {
    console.warn('[Gráficos] No hay residuos seleccionados');
    alert('Debes seleccionar al menos un tipo de residuo');
    return;
  }
  
  const params = new URLSearchParams({
    anio: anio,
    residuos: residuosSeleccionados.join(',')
  });
  
  if (mes) params.append('mes', mes);
  if (clienteSeleccionadoId) params.append('cliente_id', clienteSeleccionadoId);
  
  try {
    const response = await fetch(`/api/grafico-barras/?${params}`);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const datos = await response.json();
    console.log('[Gráficos] Datos recibidos:', datos);
    
    // Guardar datos para el gráfico de torta
    ultimosDatos = datos;
    
    // Renderizar ambos gráficos
    renderizarGraficoBarras(datos);
    console.log('[DEBUG PRINCIPAL] Llamando a renderizarGraficoTorta con datos:', datos);
    renderizarGraficoTorta(datos);
    
  } catch (error) {
    console.error('[Gráficos] Error al cargar datos:', error);
    alert('Error al cargar los gráficos. Por favor, intenta nuevamente.');
  }
}

// ==================== RENDERIZAR GRÁFICO DE BARRAS ====================
function renderizarGraficoBarras(datos) {
  const ctx = document.getElementById('graficoBarras').getContext('2d');
  
  if (chartBarras) chartBarras.destroy();
  
  const coloresArray = datos.labels.map(label => coloresResiduos[label] || 'rgba(100, 100, 100, 0.7)');
  
  chartBarras = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: datos.labels,
      datasets: [{
        label: 'Kilogramos (Kg)',
        data: datos.values,
        backgroundColor: coloresArray,
        borderColor: coloresArray.map(c => c.replace('0.7', '1')),
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: datos.titulo || 'Total de Residuos por Tipo',
          font: { size: 16, weight: 'bold' }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.parsed.y.toFixed(1)} Kg`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Kilogramos (Kg)',
            font: { size: 14, weight: 'bold' }
          },
          ticks: {
            callback: function(value) {
              return value.toFixed(1) + ' Kg';
            }
          }
        },
        x: {
          title: {
            display: true,
            text: 'Tipo de Residuo',
            font: { size: 14, weight: 'bold' }
          }
        }
      },
      animation: { duration: 800, easing: 'easeInOutQuart' }
    }
  });
  
  console.log('[Gráficos] Gráfico de barras renderizado');
}

// ==================== RENDERIZAR GRÁFICO DE TORTA ====================
function renderizarGraficoTorta(datos) {
  console.log('[TORTA DEBUG] ===== INICIO renderizarGraficoTorta =====');
  console.log('[TORTA DEBUG] Datos recibidos:', datos);
  
  const canvasElement = document.getElementById('graficoTorta');
  console.log('[TORTA DEBUG] Canvas encontrado:', canvasElement);
  
  if (!canvasElement) {
    console.error('[TORTA DEBUG] ❌ No se encontró el canvas con id "graficoTorta"');
    return;
  }
  
  const ctx = canvasElement.getContext('2d');
  console.log('[TORTA DEBUG] Contexto 2D obtenido:', ctx);
  
  if (chartTorta) {
    console.log('[TORTA DEBUG] Destruyendo gráfico anterior...');
    chartTorta.destroy();
  }
  
  // Calcular porcentajes
  const total = datos.values.reduce((sum, val) => sum + val, 0);
  console.log('[TORTA DEBUG] Total de valores:', total);
  
  const porcentajes = datos.values.map(val => total > 0 ? ((val / total) * 100) : 0);
  console.log('[TORTA DEBUG] Porcentajes calculados:', porcentajes);
  
  const coloresArray = datos.labels.map(label => coloresResiduos[label] || 'rgba(100, 100, 100, 0.7)');
  console.log('[TORTA DEBUG] Colores asignados:', coloresArray);
  console.log('[TORTA DEBUG] Labels:', datos.labels);
  
  const configGrafico = {
    type: 'pie',
    data: {
      labels: datos.labels,
      datasets: [{
        data: porcentajes,
        backgroundColor: coloresArray,
        borderColor: coloresArray.map(c => c.replace('0.7', '1')),
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'right',
          labels: {
            boxWidth: 15,
            padding: 10,
            font: { size: 11 }
          }
        },
        title: {
          display: true,
          text: datos.titulo || 'Distribución de Residuos',
          font: { size: 14, weight: 'bold' }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed || 0;
              const kg = datos.values[context.dataIndex].toFixed(1);
              return `${label}: ${value.toFixed(1)}% (${kg} Kg)`;
            }
          }
        }
      },
      animation: { duration: 800, easing: 'easeInOutQuart' }
    }
  };
  
  console.log('[TORTA DEBUG] Configuración del gráfico:', configGrafico);
  
  try {
    chartTorta = new Chart(ctx, configGrafico);
    console.log('[TORTA DEBUG] ✅ Gráfico de torta creado exitosamente:', chartTorta);
    console.log('[TORTA DEBUG] ===== FIN renderizarGraficoTorta =====');
  } catch (error) {
    console.error('[TORTA DEBUG] ❌ ERROR al crear gráfico:', error);
    console.error('[TORTA DEBUG] Stack trace:', error.stack);
  }
}

// ==================== DESCARGAR GRÁFICOS ====================
function descargarGrafico() {
  if (!chartBarras) {
    alert('No hay gráfico para descargar');
    return;
  }
  
  const canvas = document.getElementById('graficoBarras');
  const url = canvas.toDataURL('image/png');
  descargarImagen(url, 'grafico-barras');
}

function descargarGraficoTorta() {
  if (!chartTorta) {
    alert('No hay gráfico para descargar');
    return;
  }
  
  const canvas = document.getElementById('graficoTorta');
  const url = canvas.toDataURL('image/png');
  descargarImagen(url, 'grafico-torta');
}

function descargarImagen(url, tipo) {
  const ahora = new Date();
  const fecha = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`;
  const hora = `${String(ahora.getHours()).padStart(2, '0')}-${String(ahora.getMinutes()).padStart(2, '0')}`;
  const nombreArchivo = `${tipo}_${fecha}_${hora}.png`;
  
  const link = document.createElement('a');
  link.download = nombreArchivo;
  link.href = url;
  link.click();
  
  console.log(`[Gráficos] Descargado: ${nombreArchivo}`);
}

// ==================== FUNCIONES GLOBALES ====================
window.seleccionarClienteGrafico = seleccionarClienteGrafico;
window.limpiarFiltrosGrafico = limpiarFiltrosGrafico;
window.aplicarConfiguracion = aplicarConfiguracion;
window.toggleTodosCheckbox = toggleTodosCheckbox;
window.actualizarCheckTodos = actualizarCheckTodos;
window.descargarGrafico = descargarGrafico;
window.descargarGraficoTorta = descargarGraficoTorta;
window.ampliarFoto = ampliarFoto;