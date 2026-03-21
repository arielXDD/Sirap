#include <SPI.h>
#include <MFRC522.h>
#include <WiFi.h>
#include <HTTPClient.h>

// --- Credenciales WiFi ---
const char* ssid = "POCOF5"; 
const char* password = "ariel2005"; 
const char* serverUrl = "http://10.251.228.21:3001/api/nfc/lectura";

// --- Configuración RC522 ---
#define SS_PIN  5
#define RST_PIN 22

MFRC522 rfid(SS_PIN, RST_PIN); // Instancia del lector

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n======================================");
  Serial.println("  SISTEMA DE ASISTENCIA SRAP (RC522)  ");
  Serial.println("======================================");

  // Iniciar SPI y RC522
  SPI.begin();
  rfid.PCD_Init();
  Serial.println("[1/2] Lector RC522 iniciado.");

  // Conectar WiFi
  WiFi.begin(ssid, password);
  Serial.print("[2/2] Conectando a WiFi: ");
  Serial.println(ssid);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\n[!] WiFi Conectado!");
  Serial.print("    IP del ESP32: ");
  Serial.println(WiFi.localIP());
  Serial.println("    URL Servidor: " + String(serverUrl));
  Serial.println("\n--- LISTO. Acerca tu tarjeta/llavero ---");
}

void loop() {
  // Resetear el bucle si no hay tarjeta nueva
  if (!rfid.PICC_IsNewCardPresent()) return;
  if (!rfid.PICC_ReadCardSerial()) return;

  Serial.println("\n------------------------------");
  Serial.println("[!] Tarjeta detectada!");

  // Obtener UID
  String cardID = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) cardID += "0";
    cardID += String(rfid.uid.uidByte[i], HEX);
  }
  cardID.toUpperCase();

  Serial.print("    UID: "); Serial.println(cardID);

  // Enviar al servidor
  if (WiFi.status() == WL_CONNECTED) {
    enviarAlServidor(cardID);
  } else {
    Serial.println("    [!] Error: Sin WiFi.");
    WiFi.begin(ssid, password); // Intentar reconectar
  }

  // Detener lectura de la tarjeta actual
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
  
  Serial.println("------------------------------");
  delay(1000);
}

void enviarAlServidor(String id) {
  HTTPClient http;
  Serial.println("    [HTTP] Enviando al servidor...");
  
  if (http.begin(serverUrl)) {
    http.addHeader("Content-Type", "application/x-www-form-urlencoded");
    String postData = "codigoNfc=" + id;
    int code = http.POST(postData);
    
    if (code > 0) {
      Serial.printf("    [HTTP] Éxito! Código: %d\n", code);
    } else {
      Serial.printf("    [HTTP] Error: %s (Código: %d)\n", http.errorToString(code).c_str(), code);
    }
    http.end();
  } else {
    Serial.println("    [HTTP] Error al conectar con el servidor.");
  }
}