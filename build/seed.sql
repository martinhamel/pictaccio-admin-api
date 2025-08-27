CREATE USER psql_admin WITH PASSWORD 'password';
CREATE USER pictaccio_admin WITH PASSWORD 'password';
CREATE USER pictaccio_transactional WITH PASSWORD 'password';

CREATE ROLE pictaccio_admin WITH LOGIN NOSUPERUSER INHERIT NOCREATEDB NOCREATEROLE NOREPLICATION;
CREATE ROLE pictaccio_transactional WITH LOGIN NOSUPERUSER INHERIT NOCREATEDB NOCREATEROLE NOREPLICATION;

--CREATE DATABASE pictaccio;
ALTER DATABASE pictaccio OWNER TO psql_admin;
CREATE SCHEMA admin;
CREATE SCHEMA transactional;
ALTER SCHEMA public OWNER TO psql_admin;
ALTER SCHEMA admin OWNER TO psql_admin;
ALTER SCHEMA transactional OWNER TO psql_admin;
GRANT CONNECT ON DATABASE pictaccio TO pictaccio_admin;
GRANT CONNECT ON DATABASE pictaccio TO pictaccio_transactional;
GRANT USAGE ON SCHEMA admin TO pictaccio_admin;
GRANT USAGE ON SCHEMA transactional TO pictaccio_admin;
GRANT USAGE ON SCHEMA transactional TO pictaccio_transactional;
GRANT USAGE ON SCHEMA public TO pictaccio_admin;
GRANT USAGE ON SCHEMA public TO pictaccio_transactional;
ALTER DEFAULT PRIVILEGES
    FOR USER psql_admin
    IN SCHEMA admin
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO pictaccio_admin;
ALTER DEFAULT PRIVILEGES
    FOR USER psql_admin
    IN SCHEMA transactional
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO pictaccio_admin;
ALTER DEFAULT PRIVILEGES
    FOR USER psql_admin
    IN SCHEMA transactional
    GRANT SELECT, INSERT, UPDATE ON TABLES TO pictaccio_transactional;
ALTER DEFAULT PRIVILEGES
    FOR USER psql_admin
    IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE ON TABLES TO pictaccio_admin;
ALTER DEFAULT PRIVILEGES
    FOR USER psql_admin
    IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE ON TABLES TO pictaccio_transactional;

ALTER DEFAULT PRIVILEGES
    FOR USER psql_admin
    IN SCHEMA admin
    GRANT ALL PRIVILEGES ON SEQUENCES TO pictaccio_admin;
ALTER DEFAULT PRIVILEGES
    FOR USER psql_admin
    IN SCHEMA transactional
    GRANT ALL PRIVILEGES ON SEQUENCES TO pictaccio_admin;
ALTER DEFAULT PRIVILEGES
    FOR USER psql_admin
    IN SCHEMA transactional
    GRANT ALL PRIVILEGES ON SEQUENCES TO pictaccio_transactional;
ALTER DEFAULT PRIVILEGES
    FOR USER psql_admin
    IN SCHEMA public
    GRANT ALL PRIVILEGES ON SEQUENCES TO pictaccio_admin;
ALTER DEFAULT PRIVILEGES
    FOR USER psql_admin
    IN SCHEMA public
    GRANT ALL PRIVILEGES ON SEQUENCES TO pictaccio_transactional;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA transactional TO pictaccio_admin;
