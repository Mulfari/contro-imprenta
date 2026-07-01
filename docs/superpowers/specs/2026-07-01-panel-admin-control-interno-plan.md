# Plan maestro — Panel admin / control interno de la imprenta

- **Fecha:** 2026-07-01
- **Estado:** Plan aprobado (roadmap). Cada fase tendrá su propio spec detallado + implementación.
- **Proyecto:** Express Printer (`Mulfari/contro-imprenta`) — dashboard `/dashboard`.
- **Objetivo:** Llevar el panel de admin de "operativo básico" a **control interno real** de la imprenta: finanzas/caja, producción, inventario y reportes, con una base de pruebas que sostenga todo. Referencia: software del rubro (shopVOX, Printavo, YoPrint, Ordant, Logic Print/Palmart).

---

## 1. Punto de partida — qué YA existe

El dashboard (`src/app/dashboard/`) ya tiene una base sólida:

- **Pedidos** (`business.ts`): modelo rico (tipo, descripción, cantidad, medidas, material, acabado/laminado, perfil de color, diseño/instalación, urgencia, sucursal, prioridad, dueño/área actual, `total_amount`/`deposit_amount`/`pending_amount`, notas internas). Flujo de estados `recibido → diseñando → imprimiendo → listo → entregado` (+ `rechazado`), historial por pedido, adjuntos, cotización básica (`setOrderQuotedTotal`), `source` (storefront/manual).
- **Pagos**: revisión (aprobar/rechazar) de pagos que llegan del storefront (`customer-commerce.ts`).
- **Clientes**: CRUD + archivos por cliente + saldos pendientes calculados.
- **Productos**: catálogo administrable completo (el mismo del storefront).
- **Equipo**: usuarios admin/staff, roles, rol secundario, sucursal.
- **Resumen**: completados hoy, "caja" (facturado hoy), personal activo (presencia en vivo), notificaciones/seguridad, recuperación de contraseña, refresco en vivo.
- **Roles**: `admin` ve todo; `staff` ve resumen/pedidos/pagos/clientes.

**Conclusión:** la capa operativa (pedidos, clientes, catálogo, equipo) está bien. Lo que falta para "control interno" es **dinero, taller, insumos y reportes** — más una **base de pruebas** (hoy hay 0 tests).

---

## 2. Benchmark del rubro (qué trae el software de imprentas)

Estándar observado en shopVOX, Printavo, YoPrint, Ordant y ERPs gráficos (Logic Print, Palmart, Wsc Printer):

- Presupuestos/cotización (plantillas de precio, escalados por cantidad).
- Gestión de órdenes de trabajo (cola por máquina/área, prioridades).
- **Aprobación de arte online** (el cliente aprueba/pide cambios antes de imprimir).
- **Tablero/calendario de producción** (evita doble-booking, ve el trabajo por etapa).
- **Facturación** + registro de pagos (+ integración contable).
- **Módulo de caja / TPV con cierre diario.**
- **Inventario de materiales + consumo por trabajo.**
- **Compras / proveedores.**
- **Hojas de trabajo con QR** (seguir el trabajo físicamente en el taller).
- **Reportes** de ventas/costes/desviaciones/productividad.

Fuentes: [shopVOX](https://shopvox.com/print-shop-software/) · [Printavo](https://www.printavo.com/features/print-shop-order-management/) · [YoPrint](https://www.yoprint.com/) · [Ordant](https://www.appintent.com/software/ERP/printing-industry/) · [Logic Print](https://www.logic-print.com/softwareimprentas.html).

---

## 3. Análisis de brechas

| Función del rubro | ¿En Express Printer? | Dónde cae |
|---|---|---|
| Órdenes de trabajo (estado, área, material) | ✅ Sólido | — |
| Clientes / CRM | ✅ | — |
| Cotizar precio a un pedido | 🟡 Básico | Reforzar (Fase 1: presupuesto doc) |
| Adjuntar arte | ✅ (sin loop de aprobación) | Fase 2 |
| Registrar pagos | 🟡 Solo storefront | **Fase 1** (ledger completo) |
| Cierre de caja diario | ❌ | **Fase 1** |
| Gastos / egresos | ❌ | **Fase 1** |
| Cuentas por cobrar | 🟡 Se calcula, sin gestión | **Fase 1** |
| Facturación fiscal (IVA/IGTF) | ❌ | **Fase 1** |
| Presupuesto como documento | 🟡 | **Fase 1** |
| Aprobación de arte online | ❌ | **Fase 2** |
| Tablero de producción / carga / tiempos | ❌ | **Fase 2** |
| Hoja de trabajo con QR | ❌ | **Fase 2** |
| Inventario + consumo + compras/proveedores | 🟡 Parcial | **Fase 3** |
| Reportes ventas/costes/productividad | ❌ | **Fase 4** |

---

## 4. Decisiones tomadas

1. **Moneda:** USD como referencia (como ya está el sistema) **+ tasa del día Bs/USD**. Se registra en qué moneda/medio entró cada pago y la caja concilia en USD. (Descartado: doble moneda real en paralelo y "solo USD".)
2. **Orden de fases:** Finanzas primero, Reportes al final (se alimentan de las otras). Testing como base transversal desde el inicio.
3. **Extras del benchmark:** se incorporan las 4 (aprobación de arte, facturación fiscal IVA/IGTF, hoja de trabajo QR, presupuesto como documento).
4. **Stack de testing:** Vitest (lógica pura) + Playwright (e2e). Sin CI por ahora.
5. **Entrega por partes:** cada fase es un spec + implementación independiente y **nace con sus pruebas**.

---

## 5. Plan por fases

### Fase 0 · Base de testing (transversal, se monta primero)

- Instalar **Vitest** + **@testing-library** (si aplica a componentes) y **Playwright**.
- Scripts: `test` (unit/watch), `test:run`, `test:e2e`.
- Cubrir primero lo **crítico que ya existe**:
  - Unit: `src/lib/pricing.ts` (`computeUnitPrice`, `formatPrice`), helpers de `business.ts` (cálculo de `pending_amount`, transiciones de estado válidas).
  - E2E (Playwright): login → dashboard, crear pedido, registrar/revisar pago.
- Convención: tests junto al archivo o en `__tests__/`. Fixtures/mocks de Supabase para unit; e2e contra build local o entorno de prueba.
- **Regla:** de aquí en adelante, cada fase entrega su código **con pruebas**.

### Fase 1 · Finanzas y caja ⭐ (la primera que detallamos)

El corazón del control interno. Bloques:

1. **Tasa del día** — tabla `exchange_rates` (`rate_date`, `bs_per_usd`, `set_by`, `created_at`). El admin la fija una vez al día; alimenta toda conversión Bs→USD. (Futuro: autocompletar desde BCV/paralelo — fuera de alcance ahora.)
2. **Ledger de movimientos** — tabla `cash_movements`: `{ id, type (ingreso|egreso), amount_usd, currency_in (USD|VES), amount_in, exchange_rate, method (efectivo_usd | efectivo_bs | zelle | pago_movil | transferencia_bs | usdt | punto), category, order_id?, client_id?, branch, description, affects_cash (bool), cash_session_id?, created_by, created_at }`. Los pagos de pedidos generan movimientos de ingreso automáticamente.
3. **Gastos** — egresos con categoría (`insumos`, `servicios`, `sueldos`, `alquiler`, `mantenimiento`, `impuestos`, `otros`), proveedor opcional y adjunto opcional (comprobante). Vista propia "Gastos" = movimientos `type=egreso`.
4. **Cierre de caja diario** — tabla `cash_sessions` (`branch`, `opened_by`, `opened_at`, `opening_cash_usd`, `opening_cash_ves`, `closed_by?`, `closed_at?`, `counted_cash_usd?`, `counted_cash_ves?`, `status`, `notes`). Los movimientos en efectivo enlazan a la sesión. Cierre = **esperado (apertura + ingresos efectivo − egresos efectivo) vs contado + diferencia**; medios no-efectivo (Zelle, etc.) se totalizan aparte para conciliar.
5. **Cuentas por cobrar** — vista de pedidos con saldo, **antigüedad (0–7 / 8–30 / +30 días)** y acción "registrar abono" (crea un movimiento de ingreso y actualiza `pending_amount`).
6. **Facturación fiscal** — tabla `invoices` (numeración secuencial, `order_id?`, `client_id`, `subtotal_usd`, `iva_usd` (16%), `igtf_usd` (3% sobre pago en divisa), `total_usd`, `currency_in`, `exchange_rate`, `status`, `issued_by`, `issued_at`) + `invoice_items`. Genera el documento con desglose de impuestos. **Nota de alcance:** integración con máquina fiscal / imprenta digital autorizada por SENIAT queda **fuera de alcance**; aquí generamos el documento y el control interno, no la certificación fiscal.
7. **Presupuesto como documento** — tabla `quotes` (`quote_number`, `client_id`, `items`, `subtotal`, `valid_until`, `status`: borrador|enviado|aceptado|rechazado|convertido, `converted_order_id?`). Se envía al cliente y se **convierte en pedido** (reusa el modelo de pedido existente).

**UI:** nueva vista **Finanzas** (admin) con sub-secciones Caja/Cierre · Gastos · Cuentas por cobrar · Facturas · Presupuestos · Tasa. Staff puede registrar cobros/gastos de su sucursal y hacer su cierre; admin ve todo y concilia.

**Tests Fase 1:** conversión por tasa (Bs→USD), cálculo IVA 16% + IGTF 3%, antigüedad de deudas, totales de cierre (esperado vs contado), numeración de facturas.

### Fase 2 · Producción / taller

- **Tablero de producción** (kanban por estado/área) con la carga visible de un vistazo.
- **Carga por persona/área** y **atrasados** (comparando `promised_delivery_at` vs hoy).
- **Tiempos por etapa** (cuánto estuvo en cada estado; usa el historial de pedido existente).
- **Aprobación de arte online** — el cliente ve el arte adjunto y aprueba/pide cambios; el estado del pedido lo refleja.
- **Hoja de trabajo con QR** — imprimir la orden con QR que abre el pedido (escanear = ver/actualizar estado en el taller).

### Fase 3 · Inventario / insumos

- Revisar a fondo el `InventoryPanel` actual (qué cubre hoy).
- **Stock de materiales** (papel, vinil, tinta, etc.) con unidades.
- **Consumo por pedido** (descontar material al producir).
- **Alertas de bajo stock.**
- **Proveedores y compras** (órdenes de compra que suman stock; enlazan con gastos de Fase 1).

### Fase 4 · Reportes / métricas

- **Ventas por período** (día/semana/mes), por método de pago, por sucursal.
- **P&L simple**: ingresos − gastos.
- **Productos/servicios más pedidos**, **clientes top**, **productividad del equipo** (pedidos/etapas por persona).
- Se alimenta de los datos capturados en Fases 1–3.

---

## 6. Estrategia de testing (transversal)

- **Vitest** para lógica pura y determinista: precios, conversión por tasa, impuestos, antigüedad de deudas, totales de caja, transiciones de estado.
- **Playwright** para flujos críticos end-to-end: login, crear pedido, registrar pago, **cierre de caja**, emitir factura, convertir presupuesto.
- Cada fase **entrega sus pruebas** junto al código.
- CI (GitHub Actions) queda como mejora futura, no bloqueante.

---

## 7. Fuera de alcance / supuestos / riesgos

- **Certificación fiscal SENIAT** (máquina fiscal / imprenta digital autorizada): fuera de alcance. Generamos documentos y control interno, no certificación legal.
- **Tasa automática** (BCV/paralelo por API): se fija manual en Fase 1; automatizar es futuro.
- **Pasarela de pago automática**: fuera de alcance (el cobro sigue mixto: manual + storefront).
- **Supuesto**: la BD de Express Printer no es accesible por MCP; los cambios de esquema van como SQL idempotente en `supabase/setup.sql` para pegar en el SQL Editor.
- **Riesgo**: Fase 1 es grande; si al detallar el spec queda muy pesada, se parte en 1a (caja/gastos/tasa/cierre/cobros) y 1b (facturación + presupuesto).

---

## 8. Próximos pasos

1. Escribir el **spec detallado de la Fase 1** (modelo de datos final + SQL idempotente + pantallas + acciones + pruebas).
2. Montar la **Fase 0 (testing)** en paralelo o justo antes de tocar código de Fase 1.
3. Implementar Fase 1 → verificar en producción → seguir con Fase 2.
