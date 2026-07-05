docker exec -i nest_postgres_container psql -U nest_user -d nest_db < sql/drivers.sql

docker exec -i nest_postgres_container psql -U nest_user -d nest_db < sql/vehicles.sql

docker exec -i nest_postgres_container psql -U nest_user -d nest_db < sql/routeALGO.sql

docker exec -i nest_postgres_container psql -U nest_user -d nest_db < sql/routeALRETURN.sql

docker exec -i nest_postgres_container psql -U nest_user -d nest_db < sql/schedule.sql