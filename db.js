"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    user: "postgres",
    password: "mle",
    host: "localhost",
    port: 5000,
    database: "social-network-project",
});
exports.default = pool;
