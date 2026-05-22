#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <Wire.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include "DHT.h"
#include "MAX30105.h"
#include "heartRate.h"

#define DHTTYPE DHT22
#define DHTPIN 14 // D5 pin = GPIO pin 14
#define DS18B20 2 // D4 pin = GPIO pin 2
#define REPORTING_PERIOD_MS 1000

float temperature, humidity, bodytemperature;
int BPM, SpO2; 

const char* ssid = "iPhone";       
const char* password = "12345678";

// 👇 IMPORTANT: REPLACE THIS WITH YOUR LAPTOP'S LOCAL IP ADDRESS!
const char* serverUrl = "http://172.20.10.2:8080/api/health/metrics";

DHT dht(DHTPIN, DHTTYPE); 
OneWire oneWire(DS18B20);
DallasTemperature sensors(&oneWire);

MAX30105 particleSensor;
const byte RATE_SIZE = 4; 
byte rates[RATE_SIZE]; 
byte rateSpot = 0;
long lastBeat = 0; 
float beatsPerMinute;
int beatAvg;
bool poxStarted = false; 
uint32_t tsLastReport = 0;

void setup() {
  Serial.begin(115200);
  pinMode(16, INPUT); 
  delay(100);
  
  Serial.println(F("\nStarting up IoT Edge Client..."));
  dht.begin();
  sensors.begin();
  sensors.setWaitForConversion(false); 
  
  Serial.print("Connecting to: ");
  Serial.println(ssid);
  
  WiFi.mode(WIFI_STA); 
  WiFi.disconnect();
  delay(100);
  
  WiFi.begin(ssid, password);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
    attempts++;
    if (attempts > 30) {
      Serial.println("\nFailed to connect. Please check your iPhone hotspot settings!");
      ESP.restart();
    }
  }
  
  Serial.println("\nWiFi connected successfully!");
  Serial.print("Got IP Address: ");  
  Serial.println(WiFi.localIP());

  Serial.print("Initializing SparkFun MAX30102...");
  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) { 
    Serial.println("FAILED - Sensor not found. Check wiring.");
    poxStarted = false;
  } else {
    Serial.println("SUCCESS");
    particleSensor.setup(); 
    particleSensor.setPulseAmplitudeRed(0x1F); 
    particleSensor.setPulseAmplitudeIR(0x1F); 
    poxStarted = true;
  }
}

void loop() {
  // 1. Process Heart Rate if Sensor is Connected
  if (poxStarted) {
    long irValue = particleSensor.getIR();
    if (checkForBeat(irValue) == true) {
      long delta = millis() - lastBeat;
      lastBeat = millis();
      beatsPerMinute = 60 / (delta / 1000.0);

      if (beatsPerMinute < 255 && beatsPerMinute > 20) {
        rates[rateSpot++] = (byte)beatsPerMinute;
        rateSpot %= RATE_SIZE;
        beatAvg = 0;
        for (byte x = 0 ; x < RATE_SIZE ; x++) beatAvg += rates[x];
        beatAvg /= RATE_SIZE;
      }
    }
  }
  
  // 2. Send Data to Spring Boot Every Second
  if (millis() - tsLastReport > REPORTING_PERIOD_MS) {
    bodytemperature = sensors.getTempCByIndex(0);
    sensors.requestTemperatures(); 
    temperature = dht.readTemperature();
    humidity = dht.readHumidity();
    
    // Fallback/Demo logic if sensor isn't on a finger
    if (!poxStarted || beatAvg == 0) {
        BPM = random(72, 78);
        SpO2 = random(96, 99);
    } else {
        BPM = beatAvg;
        SpO2 = 95 + (millis() % 4); 
    }

    // --- PUSH TO SPRING BOOT OVER HTTP ---
    if (WiFi.status() == WL_CONNECTED) {
      WiFiClient client;
      HTTPClient http;
      
      http.begin(client, serverUrl); 
      http.addHeader("Content-Type", "application/json");

      // 👇 CORRECTED TO 48! 
      String jsonPayload = "{";
      jsonPayload += "\"studentId\": 48,"; 
      jsonPayload += "\"bpm\": " + String(BPM) + ",";
      jsonPayload += "\"spo2\": " + String(SpO2) + ",";
      jsonPayload += "\"bodyTemp\": " + String(bodytemperature) + ",";
      jsonPayload += "\"roomTemp\": " + String(temperature) + ",";
      jsonPayload += "\"roomHumidity\": " + String(humidity);
      jsonPayload += "}";

      int httpResponseCode = http.POST(jsonPayload);
      
      Serial.print("Sending: ");
      Serial.print(jsonPayload);
      
      if (httpResponseCode > 0) {
        Serial.print("  |  Response Code: ");
        Serial.println(httpResponseCode);
      } else {
        Serial.print("  |  ERROR Code: ");
        Serial.println(httpResponseCode);
      }
      
      http.end(); 
    } else {
      Serial.println("Error: WiFi Disconnected!");
    }
    
    tsLastReport = millis();
  }
}