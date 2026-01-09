/****************************
 * CONFIGURACIÓN
 ****************************/
const SHEET_URL = "https://script.google.com/macros/s/AKfycbyBnK4VEkwfvWbkaw26vQPD4sLXnhcHfKycHHxyKAjDNvtY_64GkW2uFO5OXvRgrXe49Q/exec";
const WHATSAPP_NUMERO = "522731180394"; // México

/****************************
 * PARTIDOS
 ****************************/
const partidosData = [
  "Milan vs Fiorentina",
  "Inter vs Napoli",
  "Heerenveen vs Feyenoord",
  "Telstar vs Ajax",
  "Bayern vs Wolfsburgo",
  "Pumas vs Querétaro",
  "Atl San Luis vs Tigres"
];

/****************************
 * VARIABLES
 ****************************/
let quinielas = [];
let seleccionActual = [];

// FECHA LÍMITE: 09-01-2026 14:15
const fechaCierre = new Date("2026-01-09T14:15:00");

/****************************
 * PINTAR PARTIDOS
 ****************************/
const cont = document.getElementById("partidos");

partidosData.forEach((p, i) => {
  cont.innerHTML += `
    <div class="partido">
      <span>${p.split(" vs ")[0]}</span>
      <div>
        <button onclick="sel(${i}, 'L', this)">L</button>
        <button onclick="sel(${i}, 'E', this)">E</button>
        <button onclick="sel(${i}, 'V', this)">V</button>
      </div>
      <span>${p.split(" vs ")[1]}</span>
    </div>
  `;
});

/****************************
 * SELECCIÓN L / E / V
 ****************************/
function sel(i, v, btn) {
  if (verificarCierre()) return;
  seleccionActual[i] = v;
  btn.parentNode
    .querySelectorAll("button")
    .forEach(b => b.classList.remove("seleccionado"));
  btn.classList.add("seleccionado");
}

/****************************
 * CALCULAR TOTAL
 ****************************/
function calcularTotal(cantidad) {
  let total = 0;
  const p6 = Math.floor(cantidad / 6);
  total += p6 * 50;
  cantidad %= 6;
  const p3 = Math.floor(cantidad / 3);
  total += p3 * 25;
  cantidad %= 3;
  total += cantidad * 10;
  return total;
}

/****************************
 * VERIFICAR CIERRE
 ****************************/
function verificarCierre() {
  const ahora = new Date();
  if (ahora > fechaCierre) {
    alert("El tiempo para enviar quinielas ha terminado.");
    document.querySelectorAll(".acciones button").forEach(b => b.disabled = true);
    document.getElementById("nombre").disabled = true;
    document.getElementById("telefono").disabled = true;
    const whatsapp = document.getElementById("whatsapp");
    whatsapp.style.pointerEvents = "none";
    whatsapp.style.opacity = "0.5";
    return true;
  }
  return false;
}

/****************************
 * AGREGAR QUINIELA
 ****************************/
function agregar() {
  if (verificarCierre()) return;

  const nombre = document.getElementById("nombre").value.trim();
  const telefono = document.getElementById("telefono").value.trim();

  if (!nombre || !telefono) {
    alert("Ingresa nombre y teléfono");
    return;
  }

  if (seleccionActual.length < partidosData.length) {
    alert("Selecciona todos los partidos");
    return;
  }

  const participante = {
    nombre,
    telefono,
    pronosticos: [...seleccionActual]
  };

  quinielas.push(participante);

  // Guardar en Google Sheets
  fetch(SHEET_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nombre: nombre,
      telefono: telefono,
      p1: participante.pronosticos[0],
      p2: participante.pronosticos[1],
      p3: participante.pronosticos[2],
      p4: participante.pronosticos[3],
      p5: participante.pronosticos[4],
      p6: participante.pronosticos[5],
      p7: participante.pronosticos[6],
      total: calcularTotal(quinielas.length)
    })
  });

  mostrarRegistros();
  actualizar();
  limpiar();
}

/****************************
 * ACTUALIZAR TOTALES + WHATSAPP
 ****************************/
function actualizar() {
  const totalQ = quinielas.length;
  const totalP = calcularTotal(totalQ);

  document.getElementById("totalQ").innerText = totalQ;
  document.getElementById("totalP").innerText = totalP;

  let texto = "⚽ Quinielas GL ⚽\n\n";

  quinielas.forEach((q, i) => {
    texto += `${i + 1}) ${q.nombre} (${q.telefono})\n`;
    q.pronosticos.forEach((p, j) => {
      texto += `P${j + 1}: ${p}\n`;
    });
    texto += "\n";
  });

  texto += `Total quinielas: ${totalQ}\n`;
  texto += `Total a pagar: $${totalP} MXN`;

  document.getElementById("whatsapp").href =
    `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(texto)}`;
}

/****************************
 * MOSTRAR REGISTROS CON PRONÓSTICOS
 ****************************/
function mostrarRegistros() {
  const r = document.getElementById("registros");
  r.innerHTML = "";

  quinielas.forEach((q, i) => {
    let fila = `<div class="registro">`;
    fila += `<strong>${i + 1}. ${q.nombre} (${q.telefono})</strong><br>`;
    fila += `Pronósticos: `;
    fila += q.pronosticos.map((p, j) => `P${j+1}:${p}`).join(", ");
    fila += `</div><hr>`;
    r.innerHTML += fila;
  });
}

/****************************
 * LIMPIAR SELECCIÓN
 ****************************/
function limpiar() {
  seleccionActual = [];
  document.querySelectorAll(".partido button")
    .forEach(b => b.classList.remove("seleccionado"));
}

/****************************
 * ALEATORIO
 ****************************/
function aleatorio() {
  if (verificarCierre()) return;

  seleccionActual = [];
  document.querySelectorAll(".partido").forEach((p, i) => {
    const r = Math.floor(Math.random() * 3);
    const opciones = ["L", "E", "V"];
    seleccionActual[i] = opciones[r];

    p.querySelectorAll("button").forEach(b =>
      b.classList.remove("seleccionado")
    );
    p.querySelectorAll("button")[r].classList.add("seleccionado");
  });
}

/****************************
 * REINICIAR
 ****************************/
function reiniciar() {
  quinielas = [];
  mostrarRegistros();
  actualizar();
  limpiar();
}

/****************************
 * CONTADOR REGRESIVO
 ****************************/
function contador() {
  setInterval(() => {
    const ahora = new Date();
    const diff = fechaCierre - ahora;

    const c = document.getElementById("contador");

    if (diff <= 0) {
      c.innerText = "¡Quinielas cerradas!";
      c.classList.add("cerrado");
      verificarCierre();
      return;
    }

    const horas = Math.floor(diff / 3600000);
    const minutos = Math.floor((diff % 3600000) / 60000);
    const segundos = Math.floor((diff % 60000) / 1000);

    c.innerText = `Faltan: ${horas}h ${minutos}m ${segundos}s`;
  }, 1000);
}

contador();

