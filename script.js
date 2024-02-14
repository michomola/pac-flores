document.addEventListener("DOMContentLoaded", function () {
    // Obtener referencias a elementos del DOM
    const numeroPlantasSelect = document.getElementById("numeroPlantas");
    const iniciarBtn = document.getElementById("iniciarBtn");
    const replantarBtn = document.getElementById("replantarBtn");
    const invernadero = document.getElementById("invernadero");
    const techoInvernadero = document.querySelector(".techoInvernadero");
    let posicionesIniciales = [];
    let ordenTable;
    let florFavorita;

    // Evento de cambio en el número de plantas seleccionadas
    numeroPlantasSelect.addEventListener("change", function () {
        const numeroPlantas = parseInt(numeroPlantasSelect.value, 10);
        mostrarBotones(numeroPlantas);
        cargarImagenesSincronas(numeroPlantas);

        // Habilitar o deshabilitar el botón "Iniciar" según la selección
        if (numeroPlantas >= 1 && numeroPlantas <= 6) {
            habilitarBotonIniciar();
        } else {
            deshabilitarBotonIniciar();
        }
    });

    // Evento al hacer clic en el botón "Iniciar"
    iniciarBtn.addEventListener("click", function () {
        deshabilitarSelector();
        deshabilitarBotonIniciar();
        guardarPosicionesIniciales();
        moverPlantasArriba().then(() => {
            mostrarTablaOrdenLlegada();
            mostrarFlorFavorita();
            iniciarBtn.style.display = "none";
            replantarBtn.style.display = "inline-block";
        });
    });

    // Evento al hacer clic en el botón "Replantar"
    replantarBtn.addEventListener("click", function () {
        replantarFlores();
        restablecerPosicionTallo();
        ocultarTablaOrdenLlegada();
        ocultarFlorFavorita();
        habilitarSelector(); // Habilitar el selector al hacer clic en "Replantar"
        deshabilitarBotonIniciar(); // Deshabilitar el botón "Iniciar"
    });
    

    // Función para mostrar u ocultar botones según el número de plantas seleccionadas
    function mostrarBotones(numeroPlantas) {
        if (numeroPlantas > 0) {
            iniciarBtn.style.display = "inline-block";
            replantarBtn.style.display = "none";
        } else {
            iniciarBtn.style.display = "none";
            replantarBtn.style.display = "none";
        }
    }

    // Función para cargar imágenes de manera síncrona y mostrar las plantas
    function cargarImagenesSincronas(numeroPlantas) {
        const imagenes = [
            "img/flores/Cactus suculenta.png",
            "img/flores/Flor animada.png",
            "img/flores/Flor sencilla.png",
            "img/flores/Florecita infantil.png",
            "img/flores/Mini aloe vera.png",
            "img/flores/Una flor sonriente.png"
        ];

        const imagenesAleatorias = shuffleArray(imagenes);
        const imagenesMacetas = [
            "img/maceta/maceta.png",
            "img/maceta/maceta.png",
            "img/maceta/maceta.png",
            "img/maceta/maceta.png",
            "img/maceta/maceta.png",
            "img/maceta/maceta.png"
        ];

        // Cargar las imágenes de manera síncrona
        return Promise.all(imagenesAleatorias.map(url => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = (error) => reject(error);
                img.src = url;
            });
        })).then(imagenesCargadas => {
            // Mostrar las plantas con las imágenes cargadas
            mostrarPlantas(numeroPlantas, imagenesCargadas, imagenesMacetas);
        });
    }

    // Función para mostrar las plantas en el invernadero
    function mostrarPlantas(numeroPlantas, imagenesCargadas, imagenesMacetas) {
        invernadero.innerHTML = "";

        for (let i = 1; i <= numeroPlantas; i++) {
            const plantaContainer = document.createElement("div");
            plantaContainer.className = "planta-container";

            const plantaImg = document.createElement("img");
            const imagenAleatoria = imagenesCargadas.shift();

            // Agregar tallo verde a la planta
            const tallo = document.createElement("div");
            tallo.className = "tallo";
            tallo.style.background = "green";
            plantaContainer.appendChild(tallo);

            plantaImg.src = imagenAleatoria.src;
            plantaImg.alt = `Planta ${i}`;
            plantaImg.className = "planta";

            const macetaImg = document.createElement("img");
            const imagenMaceta = imagenesMacetas.shift();
            macetaImg.src = imagenMaceta;
            macetaImg.alt = `Maceta ${i}`;
            macetaImg.className = "maceta";

            plantaContainer.appendChild(plantaImg);
            plantaContainer.appendChild(macetaImg);

            invernadero.appendChild(plantaContainer);
        }
    }

    // Función para animar las plantas hacia arriba
    function moverPlantasArriba() {
        const plantas = invernadero.querySelectorAll(".planta-container");
        let animaciones = [];

        for (let i = 0; i < plantas.length; i++) {
            const plantaContainer = plantas[i];
            const plantaImg = plantaContainer.querySelector("img");
            const tallo = plantaContainer.querySelector(".tallo"); // Obtener referencia al tallo
            const finalPosition = window.innerHeight - 100;
            const velocidad = Math.floor(Math.random() * 10) + 1;
            const duracion = 10000 / velocidad;
            const techoPosition = techoInvernadero.getBoundingClientRect().top;
            const plantaTopPosition = plantaImg.getBoundingClientRect().top;

            if (plantaTopPosition > techoPosition) {
                const distanciaRestante = plantaTopPosition - techoPosition;
                const tiempoRestante = (duracion * distanciaRestante) / finalPosition;

                // Animar la planta y el tallo
                const animacionPlanta = plantaImg.animate(
                    [
                        { transform: "translateY(0)" },
                        { transform: `translateY(-${distanciaRestante}px)` }
                    ],
                    {
                        duration: tiempoRestante,
                        easing: "ease-out",
                        fill: "forwards"
                    }
                );

                const animacionTallo = tallo.animate(
                    [
                        { height: 0 },
                        { height: `${distanciaRestante}px` }
                    ],
                    {
                        duration: tiempoRestante,
                        easing: "ease-out",
                        fill: "forwards"
                    }
                );

                animaciones.push(animacionPlanta, animacionTallo);
            }
        }

        // Devuelve una Promesa que se resolverá cuando todas las animaciones hayan terminado
        return Promise.all(animaciones.map(animacion => animacion.finished));
    }

    // Función para replantar las flores y configurar el botón "Iniciar"
    function replantarFlores() {
        // Vuelvo a mostrar el botón "Iniciar" y ocultar "Replantar"
        iniciarBtn.style.display = "inline-block";
        replantarBtn.style.display = "none";

        // Ocultar los tallos
        ocultarTallos();
    
        // Muevo las plantas a sus posiciones iniciales
        const plantas = invernadero.querySelectorAll(".planta-container");
        for (let i = 0; i < plantas.length; i++) {
            const plantaContainer = plantas[i];
            const plantaImg = plantaContainer.querySelector("img");
            const plantaTopPosition = posicionesIniciales[i];

            // Función animate
            plantaImg.animate(
                [
                    { transform: `translateY(-${plantaTopPosition}px)` },
                    { transform: "translateY(0)" }
                ],
                {
                    duration: 500,
                    easing: "ease-out",
                    fill: "forwards"
                }
            );
        }
        numeroPlantasSelect.value = "seleccionar";
        habilitarBotonIniciar(); // Habilitar el botón "Iniciar" después de replantar
    }
    
    function ocultarTallos() {
        const tallos = invernadero.querySelectorAll(".tallo");
        tallos.forEach(tallo => {
            tallo.style.display = "none";
        });
    }
    

    // Guarda las posiciones iniciales de las plantas
    function guardarPosicionesIniciales() {
        posicionesIniciales = [];

        const plantas = invernadero.querySelectorAll(".planta-container");
        for (let i = 0; i < plantas.length; i++) {
            const plantaContainer = plantas[i];
            const plantaImg = plantaContainer.querySelector("img");
            const plantaTopPosition = plantaImg.getBoundingClientRect().top;
            posicionesIniciales.push(plantaTopPosition);
        }
    }

   // Baraja los elementos de un array de forma aleatoria
    function shuffleArray(array) {
        let currentIndex = array.length,
            randomIndex;

        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }

        return array;
    }

    // Eliminar la tabla anterior si existe
    function mostrarTablaOrdenLlegada() {
        ocultarTablaOrdenLlegada();

    // Crea tabla de orden de llegada
        ordenTable = document.createElement("table");
        ordenTable.id = "ordenTable";
        const headerRow = ordenTable.insertRow(0);
        const headerCell1 = headerRow.insertCell(0);
        headerCell1.textContent = "Orden de Llegada";
        const headerCell2 = headerRow.insertCell(1);
        headerCell2.textContent = "Nombre de la Planta";
        const headerCell3 = headerRow.insertCell(2);
        headerCell3.textContent = "Velocidad";

    // Ordena plantas por su posición inicial
        const plantasOrdenadas = [];
        for (let i = 0; i < posicionesIniciales.length; i++) {
            plantasOrdenadas.push({
                nombre: `Planta ${i + 1}`,
                velocidad: Math.floor(Math.random() * 10) + 1,
                orden: i + 1
            });
        }
        plantasOrdenadas.sort((a, b) => a.orden - b.orden);

    // Llena la tabla con la información de las plantas
        for (let i = 0; i < plantasOrdenadas.length; i++) {
            const planta = plantasOrdenadas[i];
            const row = ordenTable.insertRow(i + 1);
            const cell1 = row.insertCell(0);
            cell1.textContent = planta.orden;
            const cell2 = row.insertCell(1);
            cell2.textContent = planta.nombre;
            const cell3 = row.insertCell(2);
            cell3.textContent = planta.velocidad;

        // Agrega estilos de recuadro a las columnas
            cell1.style.border = "1px solid #000";
            cell2.style.border = "1px solid #000";
            cell3.style.border = "1px solid #000";
            cell1.style.borderRadius = "10px";
            cell2.style.borderRadius = "10px";
            cell3.style.borderRadius = "10px";
        }

        // Establece estilos de recuadro a la tabla emergente
        ordenTable.style.position = "fixed";
        ordenTable.style.top = "50%";
        ordenTable.style.left = "50%";
        ordenTable.style.transform = "translate(-50%, -50%)";
        ordenTable.style.width = "400px";
        ordenTable.style.background = "white";
        ordenTable.style.border = "2px solid #000";
        ordenTable.style.borderRadius = "10px";
        ordenTable.style.overflow = "hidden";

    // Agrega la tabla al cuerpo del documento
        document.body.appendChild(ordenTable);
    }

    // Función para ocultar la tabla de orden de llegada
    function ocultarTablaOrdenLlegada() {
        // Eliminar la tabla anterior si existe
        if (ordenTable) {
            ordenTable.remove();
        }
    }

    // Encuentra la flor favorita (la primera en llegar)
    function mostrarFlorFavorita() {
        florFavorita = document.createElement("div");
        florFavorita.textContent = `FLOR FAVORITA: Planta 1`;
        florFavorita.style.position = "fixed";
        florFavorita.style.top = "50px"; // Cambiado a una posición fija de 50 px desde la parte superior
        florFavorita.style.left = "50%";
        florFavorita.style.transform = "translateX(-50%)";
        florFavorita.style.width = "400px";
        florFavorita.style.background = "white";
        florFavorita.style.border = "2px solid #000";
        florFavorita.style.borderRadius = "10px";
        florFavorita.style.textAlign = "center";
        florFavorita.style.padding = "10px";
        florFavorita.style.fontSize = "16px";
        florFavorita.style.zIndex = "999";
        document.body.appendChild(florFavorita);
    }

    // Elimina la flor favorita anterior si existe
    function ocultarFlorFavorita() {
        if (florFavorita) {
            florFavorita.remove();
        }
    }

    function restablecerPosicionTallo() {
        const tallos = invernadero.querySelectorAll(".tallo");
        tallos.forEach(tallo => {
            tallo.style.transform = "translateX(-160%)";
        });
    }

    // Habilita el selector de número de plantas
    function habilitarSelector() {
        numeroPlantasSelect.removeAttribute("disabled");
    }

    // Deshabilita el selector de número de plantas
    function deshabilitarSelector() {
        numeroPlantasSelect.setAttribute("disabled", "disabled");
    }

    // Habilita el botón "Iniciar"
    function habilitarBotonIniciar() {
        iniciarBtn.removeAttribute("disabled");
    }

    // Función para deshabilitar el botón de iniciar
    function deshabilitarBotonIniciar() {
        iniciarBtn.setAttribute("disabled", "disabled");
    }
});

