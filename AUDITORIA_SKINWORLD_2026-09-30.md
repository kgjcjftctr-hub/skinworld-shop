# Auditoría de Skinworld — rediseño V1 y pendientes

Fecha de revisión: 30 de septiembre de 2026  
Rama revisada: `rediseno-v1`

## Resultado general

El rediseño V1 está implementado en sus nueve fases y la aplicación compila. La revisión en navegador confirmó la portada con 164 productos agrupados, búsqueda, catálogo, ficha de producto, carrito, autocompletado del domicilio y la llegada al Checkout de Stripe. Se revisó en escritorio y en un teléfono de 390 × 844 px.

También se añadieron dos mariposas con animación 3D por capas: una en la composición de portada y otra en el cierre de la página. El movimiento respeta `prefers-reduced-motion`.

## Lo que ya funciona

- El catálogo muestra 164 productos después de agrupar variantes y permite filtrar por necesidad y laboratorio.
- La búsqueda devuelve productos y marcas, cierra con Escape y devuelve el foco al botón que la abrió.
- La tienda muestra dos tarjetas por fila en un teléfono de 390 px.
- La ficha móvil enseña foto, nombre, precio, cantidad y el botón de agregar en la primera pantalla.
- Agregar un producto actualiza el carrito; cantidades y eliminación tienen nombres accesibles.
- El formulario de domicilio reconoce el código postal 11000 y completa Ciudad de México, Miguel Hidalgo y sus colonias.
- Con el domicilio completo se habilita el pago y se abre Stripe con el producto, imagen, descripción y total correctos.
- El código del webhook guarda el pedido antes de mandar avisos y contempla dos correos al finalizar un pago: aviso a la tienda y confirmación al cliente.
- Desde el panel se contemplan avisos al cliente cuando el pedido pasa a empaquetado, enviado y entregado; el aviso de envío puede incluir la guía.
- La compilación de producción y la comprobación de tipos terminan correctamente.

## Lo que se pidió y todavía no está cumplido o comprobado

### Prioridad crítica

1. **Cobros reales.** La cuenta configurada sigue en modo de prueba. Stripe reporta `charges_enabled=false`, `payouts_enabled=false` y `details_submitted=false`. El flujo llega correctamente al Checkout de prueba, pero un comprador real todavía no puede pagar.
2. **Correos al cliente y a la tienda en producción.** El código sí prepara ambos avisos, pero esta copia no tiene `RESEND_API_KEY`, `CONTACT_NOTIFY_EMAIL` ni `CONTACT_FROM_EMAIL`. La evidencia histórica sólo confirma que la tienda recibió un mensaje de prueba; no confirma que un cliente externo reciba la confirmación, el aviso de empaquetado ni el de envío en su bandeja de entrada. Falta verificar el dominio en Resend, configurar el remitente y hacer una prueba a un correo externo.
3. **Inventario.** El catálogo sólo maneja disponible/no disponible. No reserva ni descuenta unidades al cobrar, por lo que no puede impedir sobreventa si dos personas compran el último producto al mismo tiempo. Hace falta decidir si Skinworld necesita existencias por cantidad.

### Prioridad alta

4. **Promesa de envío contradictoria.** Encabezado, cierre, preguntas frecuentes y política prometen envío gratis en CDMX. El carrito y la API cobran $100 a cualquier pedido de $500 o menos sin revisar el estado. También se dice que el interior se cotiza por destino, pero el sistema aplica la misma regla a todo México. Hace falta definir la política real y alinear textos y cálculo.
5. **Textos legales y operativos.** Los términos todavía hablan de “estado físico y nutricional”; el aviso de privacidad no contiene razón social, RFC ni domicilio legal completo. La política también afirma que la guía se envía al confirmar la compra, aunque el sistema sólo puede mandarla después de que la tienda la capture al marcar el pedido como enviado. Estos textos requieren datos del propietario y revisión legal antes de publicarse como definitivos.
6. **Precios comparativos invertidos.** Dos productos muestran “Antes” con una cifra menor al precio actual:
   - Protector Solar SPF 50: actual $760, “Antes” $754.
   - Sérum Hidratante Intenso: actual $1,250, “Antes” $986.
   Debe confirmarse cuál precio es correcto antes de editar el catálogo.
7. **Verificación posterior a publicar.** El rediseño se probó localmente. Después de desplegarlo todavía hay que repetir portada, tienda, producto, carrito, Checkout, búsqueda, contacto y panel en el dominio público.

### Prioridad media

8. **Productos sin laboratorio.** 46 de los 164 productos agrupados no tienen marca. No aparecen al navegar por laboratorio ni pueden entrar en la sección de marcas de la portada.
9. **Decisiones del catálogo.** ISDIN Pediatrics Stick y Daeha ya aparecen con precio, pero falta confirmar que los importes fueron aprobados. “Flavo C Sérum 30 Ml” sigue sin identificar la versión exacta.
10. **Contenido de las fichas.** Las 201 filas de producto tienen descripción, pero ninguna tiene datos estructurados adicionales como ingredientes, instrucciones, presentación, tipo de problema o tipo de producto. La ficha no debe inventar indicaciones médicas; hace falta proporcionar esos datos o confirmar que se conservará sólo la descripción.

### Mejora técnica

11. **Imágenes.** Las páginas siguen usando `<img>` y no la optimización de imágenes de Next. Debe medirse rendimiento antes de decidir qué imágenes migrar y probar el reemplazo cuando una URL falla.
12. **Tipos de datos.** Quedan tipos amplios (`any`) en rutas de productos, búsqueda y pagos. No impiden compilar, pero reducen la capacidad de detectar regresiones.

## Cambios del rediseño revisados

- Sistema visual, tipografía, colores y contraste.
- Encabezado, menú móvil, búsqueda, pie y boletín.
- Portada editorial y selección destacada.
- Catálogo móvil de dos columnas y filtros accesibles.
- Ficha de producto y variantes.
- Sobre nosotros, Journal y contacto.
- Carrito, resumen, domicilio y confirmación de pedido.
- Páginas de preguntas frecuentes, envíos, privacidad y términos integradas visualmente al nuevo sistema.
- Mariposa vectorial única y animaciones 3D sin recursos externos.

El registro maestro con estados e historial permanece en `SKINWORLD_TASKS.json` y su vista generada en `SKINWORLD_TASK_CENTER.html`.
