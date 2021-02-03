import neo4j from 'neo4j-driver';

export type Neo4jCreateOptions = {
  scheme: string;
  host: string;
  port: number;
  username: string;
  password: string;
};

export const createDriver = async ({
  host,
  password,
  port,
  scheme,
  username,
}: Neo4jCreateOptions) => {
  const driver = neo4j.driver(
    `${scheme}://${host}:${port}`,
    neo4j.auth.basic(username, password),
  );

  await driver.verifyConnectivity();

  return driver;
};
