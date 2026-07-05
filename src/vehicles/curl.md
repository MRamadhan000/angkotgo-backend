curl -X POST http://localhost:3000/vehicles \
  -H "Content-Type: application/json" \
  -d '{
    "plateNumber": "N 1234 AB",
    "vehicleCode": "AG-01",
    "capacity": 12,
    "status": "ACTIVE"
  }'

  curl -X GET http://localhost:3000/vehicles