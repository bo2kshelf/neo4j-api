import {registerAs} from '@nestjs/config';

export const Neo4jTestConfig = registerAs('neo4j-test', () => ({
  url: process.env.NEO4J_TEST_URL!,
}));
