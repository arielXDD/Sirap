# Configuración Arduino NFC

## Hardware Requerido

- Arduino Uno/Nano/Mega
- Módulo lector RFID MFRC522
- 2 LEDs (verde y rojo)
- 2 resistencias de 220Ω
- Cables de conexión

## Conexiones del MFRC522

| Pin MFRC522 | Pin Arduino |
| ----------- | ----------- |
| SDA         | 10          |
| SCK         | 13          |
| MOSI        | 11          |
| MISO        | 12          |
| IRQ         | No conectar |
| GND         | GND         |
| RST         | 9           |
| 3.3V        | 3.3V        |

## Conexiones de LEDs

- **LED Verde** (Confirmación OK): Pin 7 → Resistencia 220Ω → LED → GND
- **LED Rojo** (Error): Pin 6 → Resistencia 220Ω → LED → GND

## Instalación

1. **Instalar la biblioteca MFRC522 en Arduino IDE:**
   - Abre Arduino IDE
   - Ve a: Sketch → Include Library → Manage Libraries
   - Busca "MFRC522" y haz clic en "Install"

2. **Cargar el código:**
   - Abre el archivo `nfc_reader.ino`
   - Conecta el Arduino por USB
   - Selecciona tu placa y puerto en Tools
   - Haz clic en Upload

3. **Verificar conexión:**
   - Abre el Monitor Serial (9600 baud)
   - Deberías ver: "Lector NFC iniciado - Esperando tarjetas..."

## Uso

1. Conecta el Arduino a la computadora donde está el servidor backend
2. Identifica el puerto COM (por ejemplo, COM3) en el Administrador de Dispositivos
3. Actualiza el archivo `.env` del backend con el puerto correcto:
   ```
   SERIAL_PORT=COM3
   SERIAL_BAUD_RATE=9600
   ```
4. Cuando el servidor backend esté ejecutándose, acerca una tarjeta NFC al lector
5. El LED verde parpadeará si la asistencia se registra correctamente
6. El LED rojo parpadeará si hay un error o la tarjeta no está registrada

## Solución de Problemas

- **No se detectan tarjetas:** Verifica las conexiones del MFRC522
- **LEDs no encienden:** Revisa las conexiones de los LEDs y resistencias
- **No responde el servidor:** Verifica que el puerto COM sea correcto en el archivo .env
- **Error de lectura:** Asegúrate de que las tarjetas sean compatibles (MIFARE Classic 1K/4K, MIFARE Ultralight)
