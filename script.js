document.addEventListener("DOMContentLoaded", () => {
    const $botonEnviarPDF = document.querySelector("#btnCrearPdf");
    const $canvas = document.querySelector("#canvas"),
        $btnLimpiar = document.querySelector("#btnLimpiar"),
        $id = document.querySelector("#id"),
        $nombre = document.querySelector("#nombre"),
        $apellido = document.querySelector("#apellido"),
        $direccion = document.querySelector("#direccion");
    const contexto = $canvas.getContext("2d");
    const COLOR_PINCEL = "black";
    const COLOR_FONDO = "white";
    const GROSOR = 2;
    const $ocultables = [$botonEnviarPDF, $btnLimpiar];
    $botonEnviarPDF.addEventListener("click", async () => {
        for (const $input of [$id, $nombre, $apellido, $direccion]) {
            if (!$input.value) {
                return alert("Rellena todos los campos");
            }
        }
        $ocultables.forEach($ocultable => {
            $ocultable.style.display = "none";
        })
        const $elementoParaConvertir = document.body; // <-- Aquí puedes elegir cualquier elemento del DOM
        const pdfComoBlob = await html2pdf()
            .set({
                margin: 1,
                filename: 'documento.pdf',
                image: {
                    type: 'jpeg',
                    quality: 0.98
                },
                html2canvas: {
                    scale: 3, // A mayor escala, mejores gráficos, pero más peso
                    letterRendering: true,
                },
                jsPDF: {
                    unit: "in",
                    format: "a3",
                    orientation: 'portrait' // landscape o portrait
                }
            })
            .from($elementoParaConvertir)
            .output("blob");
        const formData = new FormData();
        formData.append("pdf", pdfComoBlob);
        formData.append("id", $id.value);
        formData.append("nombre", $nombre.nombre);
        formData.append("apellido", $apellido.apellido);
        formData.append("direccion", $direccion.direccion);
        //formData.append("otraVariable", "otroValor"); // En PHP la recuperamos como $_POST["otraVariable"]
        const respuestaHttp = await fetch("./recibir.php", {
            body: formData,
            method: "POST",
        });
        const respuestaDelServidor = await respuestaHttp.text();
        $ocultables.forEach($ocultable => {
            $ocultable.style.display = "inline";
        })
        alert("El servidor dice: " + respuestaDelServidor)
    });

    let xAnterior = 0, yAnterior = 0, xActual = 0, yActual = 0;
    const obtenerXReal = (clientX) => clientX - $canvas.getBoundingClientRect().left;
    const obtenerYReal = (clientY) => clientY - $canvas.getBoundingClientRect().top;
    let haComenzadoDibujo = false; // Bandera que indica si el usuario está presionando el botón del mouse sin soltarlo
    const limpiarCanvas = () => {
        // Colocar color blanco en fondo de canvas
        contexto.fillStyle = COLOR_FONDO;
        contexto.fillRect(0, 0, $canvas.width, $canvas.height);
    };
    limpiarCanvas();
    $btnLimpiar.onclick = limpiarCanvas;
    // Escuchar clic del botón para descargar el canvas

    const onClicOToqueIniciado = evento => {
        // En este evento solo se ha iniciado el clic, así que dibujamos un punto
        xAnterior = xActual;
        yAnterior = yActual;
        xActual = obtenerXReal(evento.clientX);
        yActual = obtenerYReal(evento.clientY);
        contexto.beginPath();
        contexto.fillStyle = COLOR_PINCEL;
        contexto.fillRect(xActual, yActual, GROSOR, GROSOR);
        contexto.closePath();
        // Y establecemos la bandera
        haComenzadoDibujo = true;
    }

    const onMouseODedoMovido = evento => {
        evento.preventDefault(); // Prevenir scroll en móviles
        if (!haComenzadoDibujo) {
            return;
        }
        // El mouse se está moviendo y el usuario está presionando el botón, así que dibujamos todo
        let target = evento;
        if (evento.type.includes("touch")) {
            target = evento.touches[0];
        }
        xAnterior = xActual;
        yAnterior = yActual;
        xActual = obtenerXReal(target.clientX);
        yActual = obtenerYReal(target.clientY);
        contexto.beginPath();
        contexto.moveTo(xAnterior, yAnterior);
        contexto.lineTo(xActual, yActual);
        contexto.strokeStyle = COLOR_PINCEL;
        contexto.lineWidth = GROSOR;
        contexto.stroke();
        contexto.closePath();
    }
    const onMouseODedoLevantado = () => {
        haComenzadoDibujo = false;
    };

    ["mousedown", "touchstart"].forEach(nombreDeEvento => {
        $canvas.addEventListener(nombreDeEvento, onClicOToqueIniciado);
    });

    ["mousemove", "touchmove"].forEach(nombreDeEvento => {
        $canvas.addEventListener(nombreDeEvento, onMouseODedoMovido);
    });
    ["mouseup", "touchend"].forEach(nombreDeEvento => {
        $canvas.addEventListener(nombreDeEvento, onMouseODedoLevantado);
    });
});