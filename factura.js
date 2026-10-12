/*! factura-libre — generador de facturas para autónomos · DataFlow Elegance · MIT
 *  Contenido mínimo según el RD 1619/2012 (Reglamento de facturación). Orientativo.
 */
(function (g) {
  "use strict";
  function r2(x) { return Math.round((x + Number.EPSILON) * 100) / 100; }

  /** lineas = [{concepto, cantidad, precio}], ivaPct (21/10/4/0), irpfPct (15/7/0) */
  function calcular(lineas, ivaPct, irpfPct) {
    var base = 0;
    (lineas || []).forEach(function (l) { base += (Number(l.cantidad) || 0) * (Number(l.precio) || 0); });
    base = r2(base);
    var iva = r2(base * (Number(ivaPct) || 0) / 100);
    var irpf = r2(base * (Number(irpfPct) || 0) / 100);
    return { base: base, iva: iva, irpf: irpf, total: r2(base + iva - irpf) };
  }

  var OBLIGATORIOS = [
    ["numero", "Número de factura"], ["fecha", "Fecha de expedición"],
    ["emisor_nombre", "Nombre del emisor"], ["emisor_nif", "NIF del emisor"], ["emisor_dir", "Domicilio del emisor"],
    ["cliente_nombre", "Nombre del cliente"], ["cliente_nif", "NIF del cliente"]
  ];

  function validarNIF(nif) {
    var s = String(nif || "").toUpperCase().replace(/[\s-]/g, "");
    var L = "TRWAGMYFPDXBNJZSQVHLCKE";
    var m = s.match(/^([XYZ]?)(\d{7,8})([A-Z])$/);
    if (m) {
      var num = (m[1] ? "XYZ".indexOf(m[1]) : "") + m[2];
      return L[parseInt(num, 10) % 23] === m[3];
    }
    return /^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/.test(s); // CIF: formato
  }

  function validar(datos, lineas) {
    var faltan = OBLIGATORIOS.filter(function (o) { return !String(datos[o[0]] || "").trim(); }).map(function (o) { return o[1]; });
    var avisos = [];
    if (datos.emisor_nif && !validarNIF(datos.emisor_nif)) avisos.push("El NIF del emisor no parece válido.");
    if (datos.cliente_nif && !validarNIF(datos.cliente_nif)) avisos.push("El NIF del cliente no parece válido.");
    if (!(lineas || []).some(function (l) { return String(l.concepto || "").trim(); })) faltan.push("Al menos un concepto");
    return { valido: faltan.length === 0, faltan: faltan, avisos: avisos };
  }

  function siguienteNumero(ultimo) {
    var m = String(ultimo || "").match(/^(.*?)(\d+)$/);
    if (!m) return (ultimo ? ultimo + "-" : new Date().getFullYear() + "-") + "001";
    var n = String(parseInt(m[2], 10) + 1);
    while (n.length < m[2].length) n = "0" + n;
    return m[1] + n;
  }

  g.FacturaLibre = { calcular: calcular, validar: validar, validarNIF: validarNIF, siguienteNumero: siguienteNumero };
})(typeof window !== "undefined" ? window : globalThis);
