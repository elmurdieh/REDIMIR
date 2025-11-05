// Variables globales
let chartBarras = null;
let clienteSeleccionadoId = null;
let clienteSeleccionadoNombre = null;
let chartBarrasAmpliado = null;

function descargarGrafico() {
  console.log('[Gráficos] Descargando gráfico...');
  
  if (!chartBarras) {
    alert('No hay gráfico para descargar');
    return;
  }
  
  const canvas = document.getElementById('graficoBarras');
  const url = canvas.toDataURL('image/png');
  
  const ahora = new Date();
  const fecha = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`;
  const hora = `${String(ahora.getHours()).padStart(2, '0')}-${String(ahora.getMinutes()).padStart(2, '0')}`;
  const nombreArchivo = `grafico-residuos_${fecha}_${hora}.png`;
  
  const link = document.createElement('a');
  link.download = nombreArchivo;
  link.href = url;
  link.click();
  
  console.log('[Gráficos] Gráfico descargado:', nombreArchivo);
}

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
  if (modalCliente) {
    modalCliente.hide();
  }
  
  setTimeout(() => {
    const modalConfig = new bootstrap.Modal(document.getElementById('modalConfigGrafico'));
    modalConfig.show();
  }, 300);
}
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

function aplicarConfiguracion() {
  console.log('[Gráficos] Aplicando configuración...');
  
  
  actualizarGraficoBarras();
  
  const modal = bootstrap.Modal.getInstance(document.getElementById('modalConfigGrafico'));
  if (modal) {
    modal.hide();
  }
}

function toggleTodosCheckbox() {
  const checkTodos = document.getElementById('checkTodos');
  const checkboxes = document.querySelectorAll('.checkbox-residuo');
  
  checkboxes.forEach(checkbox => {
    checkbox.checked = checkTodos.checked;
  });
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

async function actualizarGraficoBarras() {
  console.log('[Gráficos] Actualizando gráfico de barras...');
  
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
  
  console.log('[Gráficos] Parámetros:', params.toString());
  
  try {
    const response = await fetch(`/api/grafico-barras/?${params}`);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const datos = await response.json();
    console.log('[Gráficos] Datos recibidos:', datos);
    
    renderizarGraficoBarras(datos);
    
  } catch (error) {
    console.error('[Gráficos] Error al cargar datos:', error);
    alert('Error al cargar el gráfico. Por favor, intenta nuevamente.');
  }
}

function renderizarGraficoBarras(datos) {
  const ctx = document.getElementById('graficoBarras').getContext('2d');
  
  if (chartBarras) {
    chartBarras.destroy();
  }
  
  const colores = {
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
  
  const coloresArray = datos.labels.map(label => colores[label] || 'rgba(100, 100, 100, 0.7)');
  
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
        legend: {
          display: false
        },
        title: {
          display: true,
          text: datos.titulo || 'Total de Residuos por Tipo',
          font: {
            size: 16,
            weight: 'bold'
          }
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
            font: {
              size: 14,
              weight: 'bold'
            }
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
            font: {
              size: 14,
              weight: 'bold'
            }
          }
        }
      },
      animation: {
        duration: 800,
        easing: 'easeInOutQuart'
      }
    }
  });
  
  console.log('[Gráficos] Gráfico renderizado exitosamente');
}
function ampliarGrafico() {
  console.log('[Gráficos] Ampliando gráfico...');
  
  if (!chartBarras) {
    alert('No hay gráfico para ampliar');
    return;
  }
  
  const modal = new bootstrap.Modal(document.getElementById('modalAmpliarGrafico'));
  modal.show();
  
  document.getElementById('modalAmpliarGrafico').addEventListener('shown.bs.modal', function () {
    renderizarGraficoAmpliado();
  }, { once: true });
}
function renderizarGraficoAmpliado() {
  const ctx = document.getElementById('graficoBarrasAmpliado').getContext('2d');
  if (chartBarrasAmpliado) {
    chartBarrasAmpliado.destroy();
  }
  const datosOriginales = chartBarras.data;
  const opcionesOriginales = chartBarras.options;
  chartBarrasAmpliado = new Chart(ctx, {
    type: 'bar',
    data: JSON.parse(JSON.stringify(datosOriginales)),
    options: {
      ...opcionesOriginales,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        ...opcionesOriginales.plugins,
        title: {
          ...opcionesOriginales.plugins.title,
          font: {
            size: 24,
            weight: 'bold'
          }
        },
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          ...opcionesOriginales.scales.y,
          title: {
            display: true,
            text: 'Kilogramos (Kg)',
            font: {
              size: 18,
              weight: 'bold'
            }
          },
          ticks: {
            font: {
              size: 14
            },
            callback: function(value) {
              return value.toFixed(1) + ' Kg';
            }
          }
        },
        x: {
          ...opcionesOriginales.scales.x,
          title: {
            display: true,
            text: 'Tipo de Residuo',
            font: {
              size: 18,
              weight: 'bold'
            }
          },
          ticks: {
            font: {
              size: 14
            }
          }
        }
      }
    }
  });
  
  console.log('[Gráficos] Gráfico ampliado renderizado');
}

//funciones globales HTML
window.seleccionarClienteGrafico = seleccionarClienteGrafico;
window.limpiarFiltrosGrafico = limpiarFiltrosGrafico;
window.aplicarConfiguracion = aplicarConfiguracion;
window.toggleTodosCheckbox = toggleTodosCheckbox;
window.actualizarCheckTodos = actualizarCheckTodos;
window.ampliarGrafico = ampliarGrafico;
window.descargarGrafico = descargarGrafico;