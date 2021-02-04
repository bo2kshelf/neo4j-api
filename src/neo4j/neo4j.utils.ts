import neo4j from 'neo4j-driver';

export type Neo4jCreateOptions = {
  url: string;
  username?: string;
  password?: string;
};

export const createDriver = async ({
  url: uri,
  username,
  password,
}: Neo4jCreateOptions) => {
  const driverUri = uri;
  const driverAuth =
    username && password ? neo4j.auth.basic(username, password) : undefined;

  const driver = neo4j.driver(driverUri, driverAuth);
  await driver.verifyConnectivity();
  return driver;
};
