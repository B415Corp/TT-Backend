Чтобы запустить все сервисы, включая Adminer, используйте команду:

docker-compose up
Если вы хотите запустить только определенные сервисы, вы можете указать их имена:

docker-compose up app-dev db-dev adminer
или

docker-compose up app-prod db-prod adminer


test 222