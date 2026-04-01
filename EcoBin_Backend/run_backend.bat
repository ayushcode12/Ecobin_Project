@echo off
set DB_PASSWORD=admin
call mvnw.cmd spring-boot:run > backend.log 2>&1
