import {registerAs} from '@nestjs/config';

export const Neo4jTestConfig = registerAs('neo4j-test', () => ({
  scheme: 'bolt',
  host: process.env.NEO4J_TEST_HOST!,
  port: Number.parseInt(process.env.NEO4J_TEST_PORT!, 10),
  username: process.env.NEO4J_TEST_USER!,
  password: process.env.NEO4J_TEST_PASSWORD!,
}));
