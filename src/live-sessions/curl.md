curl -X POST http://localhost:3000/live-sessions \
  -H "Content-Type: application/json" \
  -d '{
    "tripId": 1
  }'

curl -X POST http://localhost:3000/live-sessions/1/locations \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": -7.956214,
    "longitude": 112.614532,
    "speedKmh": 45,
    "headingDegrees": 180
  }'


  curl -X PATCH http://localhost:3000/live-sessions/1/end \
  -H "Content-Type: application/json" \
  -d '{
    "status": "COMPLETED"
  }'
