curl -X POST http://localhost:3000/drivers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "M. Ramadhan Titan",
    "phone": "081234567890",
    "license_number": "SIM-9999-12345",
    "status": "ACTIVE"
  }'


  curl -X GET http://localhost:3000/drivers