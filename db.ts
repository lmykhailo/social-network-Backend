import { Pool } from "pg";

const pool = new Pool({
  user: "postgres",
  password: "mle",
  host: "localhost",
  port: 5000,
  database: "social-network-project",
});

export default pool;
