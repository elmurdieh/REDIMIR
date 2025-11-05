
function seleccionarCliente(clienteId, clienteNombre) {
    let inputHidden = document.querySelector('input[name="idCliente"]');
    if (!inputHidden) {
        inputHidden = document.createElement('input');
        inputHidden.type = 'hidden';
        inputHidden.name = 'idCliente';
        document.querySelector('form').appendChild(inputHidden);
    }
    inputHidden.value = clienteId;
    
    const contenedorCliente = document.querySelector('[data-bs-target="#clienteModal"]').parentElement;
    contenedorCliente.innerHTML = `
        <div class="d-flex align-items-center gap-2">
            <input type="text" class="form-control form-control-custom" value="${clienteNombre}" disabled>
            <button type="button" class="btn btn-enviar" data-bs-toggle="modal" data-bs-target="#clienteModal">
                Cambiar
            </button>
        </div>
    `;

    bootstrap.Modal.getInstance(document.getElementById('clienteModal')).hide();
    
    actualizarUbicaciones(clienteId);
}

function actualizarUbicaciones(clienteId) {
    const selectUbicaciones = document.querySelector('select[name="idUbicacion"]');
    selectUbicaciones.innerHTML = '<option value="">Seleccionar ubicación...</option>';
    
    const ubicacionesCliente = window.ubicacionesData.filter(ubicacion => 
        ubicacion.clienteId == clienteId
    );
    
    ubicacionesCliente.forEach(ubicacion => {
        const option = document.createElement('option');
        option.value = ubicacion.id;
        option.textContent = `${ubicacion.calle} ${ubicacion.numero}`;
        selectUbicaciones.appendChild(option);
    });
}


let almacenarFotos = [];

// Esperar que el DOM esté cargado
document.addEventListener("DOMContentLoaded", () => {
  console.log("[Fotos] DOM cargado, inicializando eventos...");
  verificarFotos();

  const inputFile = document.getElementById("modalFileInput");
  if (!inputFile) {
    console.error("[Fotos] No se encontró el input con id modalFileInput");
    return;
  }

  // Listener: cuando se seleccionan nuevas fotos
  inputFile.addEventListener("change", (e) => {
    console.log("[Fotos] Evento change detectado en input file.");
    console.log("[Fotos] Estado antes de agregar:", almacenarFotos);

    const nuevasFotos = Array.from(e.target.files || []);
    console.log("[Fotos] Nuevas fotos seleccionadas:", nuevasFotos.map(f => f.name));

    almacenarFotos.push(...nuevasFotos); // acumula fotos
    console.log("[Fotos] Estado después de agregar:", almacenarFotos);

    e.target.value = ""; // limpiar input (permite reusar cámara)
    verificarFotos(); // actualizar modal
  });
});

// 🔹 Actualiza el modal dependiendo si hay fotos o no
function verificarFotos() {
  console.log("[Fotos] Ejecutando verificarFotos(). Cantidad actual:", almacenarFotos.length);

  const modalBody = document.getElementById("modalBody");
  const modalFooter = document.getElementById("modalFooter");

  if (!modalBody || !modalFooter) {
    console.error("[Fotos] No se encontró modalBody o modalFooter en el DOM");
    return;
  }

  // Si no hay fotos
  if (almacenarFotos.length === 0) {
    console.log("[Fotos] No hay fotos, mostrando vista inicial.");
    modalBody.innerHTML = `
      <p class="modal-announcement">
        ¡Casi terminamos, solo debes agregar la evidencia de los residuos que estás recogiendo!
      </p>
      <div class="camera-icon-container">
        <i class="bi bi-camera camera-icon" onclick="abrirCamara()"></i>
      </div>
    `;

    modalFooter.innerHTML = `
      <button type="button" class="btn btn-secondary btn-modal-custom" data-bs-dismiss="modal">Cerrar</button>
      <button type="submit" class="btn btn-secondary btn-modal-custom" data-bs-dismiss="modal">Terminar Registro</button>
    `;
  }

  // Si hay fotos
  else {
  console.log("[Fotos] Renderizando vista con fotos.");
  
  // ✅ TRANSFERIR FOTOS AL INPUT FILE
  const inputFile = document.getElementById("modalFileInput");
  const dataTransfer = new DataTransfer();
  almacenarFotos.forEach(file => {
    dataTransfer.items.add(file);
  });
  inputFile.files = dataTransfer.files;
  
  const previews = almacenarFotos.map((file, index) => {
    const imgURL = URL.createObjectURL(file);
    return `
      <div class="foto-preview" style="position:relative; display:inline-block; margin:10px;">
        <img src="${imgURL}" alt="Foto ${index + 1}" class="img-thumbnail" style="width:200px;height:250px;object-fit:cover;">
        <button type="button" class="btn-eliminar-foto" onclick="eliminarFoto(${index})" style="position:absolute; top:8px; left:8px; background:red; color:white; border:none; border-radius:50%; width:25px; height:25px; padding:0; font-size:16px; cursor:pointer; line-height:1; font-weight:bold;">×</button>
      </div>
    `;
  }).join('');

  modalBody.innerHTML = `
    <p class="modal-announcement">Evidencias registradas:</p>
    <div class="d-flex flex-wrap justify-content-center">
      ${previews}
    </div>
  `;

  modalFooter.innerHTML = `
    <button type="button" class="btn btn-secondary btn-modal-custom" data-bs-dismiss="modal">Cerrar</button>
    <button type="button" class="btn btn-secondary btn-modal-custom" onclick="abrirCamara()">Agregar Fotos</button>
    <button type="submit" class="btn btn-secondary btn-modal-custom" data-bs-dismiss="modal">Terminar Registro</button>
  `;
}
}

function eliminarFoto(index) {
  console.log("[Fotos] Intentando eliminar foto en índice:", index);
  console.log("[Fotos] Estado antes de eliminar:", almacenarFotos.map(f => f.name));
  
  if (index >= 0 && index < almacenarFotos.length) {
    const fotoEliminada = almacenarFotos.splice(index, 1);
    console.log("[Fotos] Foto eliminada:", fotoEliminada[0].name);
    console.log("[Fotos] Estado después de eliminar:", almacenarFotos.map(f => f.name));
    console.log("[Fotos] Cantidad restante:", almacenarFotos.length);
    
    verificarFotos(); // Re-renderizar modal
  } else {
    console.error("[Fotos] Índice inválido para eliminar:", index);
  }
}

// 🔹 Abrir cámara o selector de archivos
function abrirCamara() {
  console.log("[Fotos] abrirCamara() ejecutado, disparando input click.");
  const input = document.getElementById("modalFileInput");
  if (input) input.click();
  else console.error("[Fotos] No se encontró el input modalFileInput.");
}