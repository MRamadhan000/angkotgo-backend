curl --location 'http://localhost:3000/api/passenger/stops?search=Landungsari' \
--header 'Accept: application/json'


curl --location 'http://localhost:3000/api/passenger/find-bus' \
--header 'Content-Type: application/json' \
--header 'Accept: application/json' \
--data '{
    "origin_stop_id": 1,
    "destination_stop_id": 4
}'