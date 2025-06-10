# Pasarela de Pagos

Aplicación ligera de ejemplo para recibir pagos en línea a través de Stripe. Permite registrar los datos del cliente y el importe a pagar. Al completar el pago, se almacena la operación en MongoDB y se genera un comprobante en PDF que puede descargarse. Incluye un pequeño panel con el historial de pagos y ahora las páginas se renderizan con **EJS** desde el backend.


## Uso

1. Configura las variables de entorno en un archivo `.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_xxx
   MONGO_URI=mongodb://localhost/pagos
   JWT_SECRET=secreto

   PORT=3000
   ```
2. Instala las dependencias y compila:
   ```
   npm install
   npm run build   # o npm run dev durante desarrollo
   ```
3. Ejecuta el servidor:
   ```
   npm start
   ```
4. Regístrate y accede:
   - `http://localhost:3000/register`
   - `http://localhost:3000/login`
5. Abre `http://localhost:3000/` en tu navegador para realizar un pago una vez autenticado y consulta el historial en `http://localhost:3000/history`.

Al registrarte puedes indicar una clave secreta de Stripe para que los pagos se realicen con tu propia cuenta. Por defecto se usará la definida en las variables de entorno. Existen roles de usuario y administrador; solo el administrador puede ver todos los pagos.
=======
   npx tsc
   ```
3. Ejecuta el servidor:
   ```
   node dist/index.js
   ```
4. Abre `http://localhost:3000/index.html` en tu navegador para realizar un pago.

Este proyecto es únicamente demostrativo y no debe usarse en producción sin las medidas de seguridad adecuadas.
