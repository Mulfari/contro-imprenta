# Codex Handoff

## Proyecto
- Nombre local del proyecto: `control-imprenta`
- Ruta de trabajo: `C:\Users\joses\OneDrive\Documentos\control-imprenta`
- Tipo de app: Next.js App Router
- Producto: panel administrativo + storefront ecommerce para Express Printer
- Rama de trabajo habitual: `main`

## Objetivo de este archivo
Este archivo existe para que cualquier nueva sesion de Codex o chat nuevo pueda retomar el proyecto sin perder el contexto operativo, visual y tecnico que ya se definio en sesiones anteriores.

No reemplaza el codigo ni GitHub. Su funcion es guardar las reglas de trabajo y el contexto que normalmente se perderian al cerrar el chat.

## Flujo de trabajo esperado
Cada nueva sesion debe seguir este orden:

1. Leer este archivo completo antes de hacer cambios.
2. Ejecutar `git status --short`.
3. Revisar si hay cambios locales no relacionados y respetarlos.
4. Leer el archivo o componente que se va a tocar antes de editar.
5. Hacer solo cambios relacionados con el pedido actual.
6. Validar con:
   - `npm run lint`
   - `npm run build`
7. Hacer commit solo de los archivos relacionados.
8. Hacer `git push origin main`.

## Forma de trabajo con el usuario
- Responder siempre en espanol.
- El usuario prefiere iteracion rapida y trabajo directo sobre el codigo.
- No proponer demasiado antes de ejecutar; si el cambio es razonable, implementarlo.
- En temas visuales, iterar hasta que quede bien.
- No hacer redisenos grandes sin aprobacion explicita.
- Ser honesto si una idea visual o asset no esta funcionando bien.

## Reglas importantes al editar
- No tocar archivos no relacionados.
- Si hay cambios locales previos, no revertirlos.
- Si un archivo tiene cambios del usuario o de otra sesion, leerlo con cuidado antes de editarlo.
- No usar cambios destructivos de Git como `reset --hard`.
- Si se hacen assets nuevos para produccion, deben quedar dentro del repo, normalmente en `public/`.

## Estado local importante
Al momento de escribir este handoff existe un cambio local no relacionado en:

- `src/app/storefront-shell.tsx`

Ese archivo aparece modificado en `git status` y no debe tocarse ni incluirse en commits salvo que el pedido actual realmente lo requiera.

## Validaciones obligatorias
Antes de dar por terminado cualquier cambio:

- correr `npm run lint`
- correr `npm run build`

Si una de esas validaciones falla, no se debe cerrar la tarea como lista.

## Flujo de imagenes y assets
- Si Codex genera una imagen nueva, no se debe dejar solo en la carpeta temporal de Codex.
- El asset final debe copiarse al repo, normalmente en `public/`.
- Si una imagen no encaja visualmente, no insistir eternamente con CSS si el problema real es el formato del asset.
- Si el asset trae demasiado espacio transparente o mal encuadre, se puede:
  - recortar con `sharp`
  - generar una nueva version
  - reemplazarlo por un arte mas adecuado

## Contexto actual del storefront
La home publica se ha trabajado como ecommerce para Express Printer.

Piezas relevantes del storefront:
- Header ecommerce
- Banner principal rotativo
- Seccion de categorias bajo el banner
- Seccion de promos tipo tarjetas destacadas
- Secciones de comentarios, empresa y footer
- Flujos de `Mi cuenta`, `registro` y `login`

## Estado actual de la seccion de promos
Archivo principal:
- `src/app/storefront-promo-panels.tsx`

Estado actual:
- La tarjeta de `Tarjetas Premium` ya no usa la imagen vieja conflictiva.
- Se creo un arte propio para esa promo y se guarda en:
  - `public/storefront-promo-cards-premium.svg`
  - `public/storefront-promo-cards-premium.webp`
- La tarjeta de `Stickers y Etiquetas` sigue usando un asset real:
  - `public/storefront-promo-stickers-labels-trimmed.webp`

Aprendizajes de sesiones anteriores:
- Las imagenes cuadradas con mucho espacio transparente se veian diminutas.
- Las imagenes metidas como fondo con `cover` se recortaban mal.
- El uso de `absolute` grande hacia la derecha tendia a invadir el texto.
- Para este tipo de tarjeta funcionan mejor:
  - assets recortados de verdad
  - proporciones reales
  - composicion en flujo normal o muy controlada

## Contexto actual del admin
El dashboard administrativo ha recibido bastantes cambios y se ha trabajado principalmente en:
- usuarios
- clientes
- pedidos
- tiempo real / presencia
- archivos digitales por cliente
- alertas y notificaciones

Al continuar cualquier trabajo del admin:
- revisar primero el componente puntual
- evitar mover piezas de layout aprobadas si no fue pedido

## Convencion para nuevas sesiones
Si un nuevo chat arranca desde cero, el mejor prompt de inicio es:

```text
Lee primero docs/codex-handoff.md y luego revisa git status antes de hacer cambios.
Trabaja en espanol.
Respeta cambios locales existentes.
No toques archivos no relacionados.
Valida siempre con npm run lint y npm run build antes de hacer commit y push.
```

## Convencion para commits
- Hacer commits pequenos y enfocados.
- No mezclar cambios visuales, backend y assets si no estan relacionados.
- No incluir `src/app/storefront-shell.tsx` en commits accidentales mientras siga como cambio local no relacionado.

## Cuando algo visual se vea mal
Antes de seguir empujando CSS, verificar si el problema real es uno de estos:
- el asset tiene demasiado espacio vacio
- la proporcion del asset no coincide con el componente
- el fondo no es realmente transparente
- el layout esta intentando usar una imagen de producto como fondo decorativo

## Resumen corto para cualquier chat nuevo
- Leer este archivo
- Revisar `git status`
- Respetar `src/app/storefront-shell.tsx` si sigue modificado localmente
- Hacer cambios pequenos y dirigidos
- Validar con lint y build
- Commit y push solo de lo relacionado
