CREATE USER psql_admin WITH PASSWORD 'password';
CREATE USER pictaccio_admin WITH PASSWORD 'password';
CREATE USER pictaccio_transactional WITH PASSWORD 'password';
CREATE USER pictaccio_transactional_migration WITH PASSWORD 'password';
ALTER DATABASE pictaccio_db1 OWNER TO psql_admin;
CREATE SCHEMA admin;
CREATE SCHEMA transactional;
ALTER SCHEMA public OWNER TO psql_admin;
ALTER SCHEMA admin OWNER TO psql_admin;
ALTER SCHEMA transactional OWNER TO psql_admin;
GRANT CONNECT ON DATABASE pictaccio_db1 TO pictaccio_admin;
GRANT CONNECT ON DATABASE pictaccio_db1 TO pictaccio_transactional;
GRANT USAGE ON SCHEMA admin TO pictaccio_admin;
GRANT USAGE ON SCHEMA transactional TO pictaccio_admin;
GRANT USAGE ON SCHEMA transactional TO pictaccio_transactional;
GRANT USAGE ON SCHEMA public TO pictaccio_admin;
GRANT USAGE ON SCHEMA public TO pictaccio_transactional;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA transactional TO pictaccio_transactional_migration;
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
