// Obtener el token CSRF desde las cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');


function cambiarEstado(idCliente) {
    fetch(`/clientes/cambiar_estado/${idCliente}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const btn = document.querySelector(`#btn-estado-${idCliente}`);
            if (btn) {
                btn.textContent = data.estado ? 'Activo' : 'Bloqueado';
                btn.classList.toggle('btn-success', data.estado);
                btn.classList.toggle('btn-danger', !data.estado);
            }
        } else {
            alert("No se pudo cambiar el estado.");
        }
    })
    .catch(error => alert("Error en la petición."));
}