// Base de datos de selecciones con tus estadísticas reales
const catalogoPaises = {
  "AR": { nombre: "Argentina", vb: 3.0,  va: 0.40, bandera: "🇦🇷" },
  "CV": { nombre: "Cabo Verde", vb: 4.5, va: 0.20, bandera: "🇨🇻" },
  "ES": { nombre: "España",     vb: 4.0,  va: 0.30, bandera: "🇪🇸" },
  "MX": { nombre: "México",     vb: 3.0,  va: 0.45, bandera: "🇲🇽" },
  "UY": { nombre: "Uruguay",    vb: 3.5,  va: 0.40, bandera: "🇺🇾" },
  "FR": { nombre: "Francia",    vb: 5.0,  va: 0.30, bandera: "🇫🇷" }
};

let miPais = null;
let miRival = null;
let score = 0;
let detenidos = 0;
let highScore = localStorage.getItem("highScoreYY") || 0;

// Estado físico del juego
let porteroX = 180;
let direccionPortero = 1;
let velocidadPortero = 0;
let balonEnMovimiento = false;
let balonX = 185;
let balonY = 330;

// Inicializar menús de selección utilizando los iconos del catálogo
function iniciarMenus() {
  const divMiPais = document.getElementById("lista-tu-pais");
  const divRival = document.getElementById("lista-rival");

  Object.keys(catalogoPaises).forEach(id => {
    let p = catalogoPaises[id];
    
    // Botón para mi país
    let b1 = document.createElement("button");
    b1.className = "btn-pais"; b1.innerHTML = p.bandera;
    b1.onclick = () => { MI_SELECCION(id, "miPais", divMiPais, b1); };
    divMiPais.appendChild(b1);

    // Botón para el rival
    let b2 = document.createElement("button");
    b2.className = "btn-pais"; b2.innerHTML = p.bandera;
    b2.onclick = () => { MI_SELECCION(id, "miRival", divRival, b2); };
    divRival.appendChild(b2);
  });
}

function MI_SELECCION(id, tipo, contenedor, boton) {
  contenedor.querySelectorAll(".btn-pais").forEach(b => b.classList.remove("seleccionado"));
  boton.classList.add("seleccionado");
  if(tipo === "miPais") miPais = id;
  else miRival = id;
  document.getElementById("btn-jugar").disabled = !(miPais && miRival);
}

// Empezar el partido
document.getElementById("btn-jugar").onclick = () => {
  document.getElementById("pantalla-seleccion").classList.add("oculto");
  document.getElementById("pantalla-juego").classList.remove("oculto");
  
  velocidadPortero = catalogoPaises[miRival].vb;
  document.getElementById("txt-score").innerText = `Score ${catalogoPaises[miPais].bandera}: 0`;
  document.getElementById("txt-detenidos").innerText = `Detenidos ${catalogoPaises[miRival].bandera}: 0`;
  document.getElementById("txt-highscore").innerText = `Récord: ${highScore}`;
  
  ejecutarBucleJuego();
};

// Bucle principal de movimiento (Físicas del portero)
function ejecutarBucleJuego() {
  // Movimiento del portero estilo ping-pong
  porteroX += velocidadPortero * direccionPortero;
  if (porteroX >= 315 || porteroX <= 45) {
    direccionPortero *= -1;
  }
  document.getElementById("portero").style.left = porteroX + "px";

  // Movimiento vertical del balón al disparar
  if (balonEnMovimiento) {
    balonY -= 8; // Velocidad de subida del balón
    document.getElementById("balon").style.top = balonY + "px";

    // 1. COLISIÓN CON EL PORTERO (Atajada)
    // Se calcula si el balón coincide con la posición del portero arriba
    if (balonY <= 90 && balonY >= 55 && Math.abs(balonX - porteroX) < 35) {
      detenidos++;
      document.getElementById("txt-detenidos").innerText = `Detenidos ${catalogoPaises[miRival].bandera}: ${detenidos}`;
      balonEnMovimiento = false;
      
      // REGLA: Si los detenidos superan a tus goles, GAME OVER
      if (detenidos > score + 2) {
        alert(`¡Fin del juego! El portero te ganó. Score final: ${score}`);
        location.reload(); // Reinicia el juego
        return;
      }
      reajustarBalon();
    }
    // 2. ENTRÓ A LA PORTERÍA (Gol)
    else if (balonY <= 40) {
      if (balonX >= 70 && balonX <= 320) {
        lanzarCartelGol();
      } else {
        // Fuera del arco cuenta como "detenido/fallado" por simplicidad
        detenidos++;
        document.getElementById("txt-detenidos").innerText = `Detenidos ${catalogoPaises[miRival].bandera}: ${detenidos}`;
        if (detenidos > score) { alert("¡Fin del juego!"); location.reload(); return; }
      }
      balonEnMovimiento = false;
      reajustarBalon();
    }
  }
  requestAnimationFrame(ejecutarBucleJuego);
}

// Disparar el balón al hacer click en él
document.getElementById("balon").onclick = () => {
  if (!balonEnMovimiento) {
    balonEnMovimiento = true;
  }
};

function lanzarCartelGol() {
  score++;
  document.getElementById("txt-score").innerText = `Score ${catalogoPaises[miPais].bandera}: ${score}`;
  
  // Fórmula exacta que propusiste: Vb + (Va * goles)
  velocidadPortero = catalogoPaises[miRival].vb + (catalogoPaises[miRival].va * score);

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScoreYY", highScore);
    document.getElementById("txt-highscore").innerText = `Récord: ${highScore}`;
  }

  // Desplegar texto animado dinámico
  const cartel = document.getElementById("cartel-gol");
  cartel.innerText = `¡Gol de ${catalogoPaises[miPais].nombre} a ${catalogoPaises[miRival].nombre}!`;
  cartel.classList.remove("oculto-anim", "animar-gol");
  void cartel.offsetWidth; // Truco de JS para reiniciar animación CSS
  cartel.classList.add("animar-gol");
}

function reajustarBalon() {
  balonY = 330;
  document.getElementById("balon").style.top = balonY + "px";
}

iniciarMenus();
