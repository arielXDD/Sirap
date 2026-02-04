/*
  Código para Arduino con lector NFC MFRC522
  
  Conexiones del MFRC522:
  - SDA  -> Pin 10
  - SCK  -> Pin 13
  - MOSI -> Pin 11
  - MISO -> Pin 12
  - IRQ  -> (no conectado)
  - GND  -> GND
  - RST  -> Pin 9
  - 3.3V -> 3.3V
  
  LED Verde (confirmación) -> Pin 7
  LED Rojo (error) -> Pin 6
*/

#include <SPI.h>
#include <MFRC522.h>

#define RST_PIN 9
#define SS_PIN  10
#define LED_OK 7
#define LED_ERROR 6

MFRC522 mfrc522(SS_PIN, RST_PIN);

void setup() {
  Serial.begin(9600);
  SPI.begin();
  mfrc522.PCD_Init();
  
  pinMode(LED_OK, OUTPUT);
  pinMode(LED_ERROR, OUTPUT);
  
  digitalWrite(LED_OK, LOW);
  digitalWrite(LED_ERROR, LOW);
  
  Serial.println("Lector NFC iniciado - Esperando tarjetas...");
}

void loop() {
  // Buscar tarjetas nuevas
  if (!mfrc522.PICC_IsNewCardPresent()) {
    return;
  }

  // Leer tarjeta
  if (!mfrc522.PICC_ReadCardSerial()) {
    return;
  }

  // Obtener UID de la tarjeta
  String uid = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    uid += String(mfrc522.uid.uidByte[i], HEX);
  }
  uid.toUpperCase();

  // Enviar UID al servidor por serial
  Serial.println(uid);

  // Esperar respuesta del servidor (timeout 2 segundos)
  unsigned long startTime = millis();
  String response = "";
  
  while (millis() - startTime < 2000) {
    if (Serial.available()) {
      response = Serial.readStringUntil('\n');
      response.trim();
      break;
    }
  }

  // Mostrar resultado con LEDs
  if (response == "OK") {
    // Asistencia registrada correctamente
    digitalWrite(LED_OK, HIGH);
    delay(1000);
    digitalWrite(LED_OK, LOW);
  } else {
    // Error o tarjeta no reconocida
    digitalWrite(LED_ERROR, HIGH);
    delay(1000);
    digitalWrite(LED_ERROR, LOW);
  }

  // Detener lectura actual
  mfrc522.PICC_HaltA();
  mfrc522.PCD_StopCrypto1();

  delay(1000); // Evitar lecturas múltiples
}
