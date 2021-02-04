import {registerAs} from '@nestjs/config';

export const Neo4jConfig = registerAs('neo4j', () => ({
  url: process.env.NEO4J_URL!,
  username: process.env.NEO4J_USERNAME!,
  password: process.env.NEO4J_PASSWORD!,
}));
