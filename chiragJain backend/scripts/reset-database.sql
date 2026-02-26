-- Run this script in MySQL to fix schema migration errors
-- This drops all WMS tables and lets Hibernate recreate them on next startup
-- Usage: mysql -u root -p < scripts/reset-database.sql
-- Or run in MySQL Workbench / IntelliJ Database tool

DROP DATABASE IF EXISTS logistics_db;
CREATE DATABASE logistics_db;
