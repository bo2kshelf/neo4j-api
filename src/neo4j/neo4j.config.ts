import {registerAs} from '@nestjs/config';

export const Neo4jConfig = registerAs('neo4j', () => ({
  scheme: 'bolt',
  host: process.env.NEO4J_HOST!,
  port: Number.parseInt(process.env.NEO4J_PORT!, 10),
  username: process.env.NEO4J_USERNAME!,
  password: process.env.NEO4J_PASSWORD!,
}));
