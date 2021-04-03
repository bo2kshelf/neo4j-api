import {Inject, Injectable, OnApplicationShutdown} from '@nestjs/common';
import neo4j, {Driver, Result, Transaction} from 'neo4j-driver';
import {NEO4J_MODULE_DRIVER, NEO4J_MODULE_OPTIONS} from './neo4j.constants';
import {Neo4jCreateOptions} from './neo4j.utils';

@Injectable()
export class Neo4jService implements OnApplicationShutdown {
  private readonly driver: Driver;

  constructor(
    @Inject(NEO4J_MODULE_OPTIONS) config: Neo4jCreateOptions,
    @Inject(NEO4J_MODULE_DRIVER) driver: Driver,
  ) {
    this.driver = driver;
  }

  beginTransaction(database?: string): Transaction {
    const session = this.getWriteSession(database);
    return session.beginTransaction();
  }

  getReadSession(database?: string) {
    return this.driver.session({
      database,
      defaultAccessMode: neo4j.session.READ,
    });
  }

  getWriteSession(database?: string) {
    return this.driver.session({
      database,
      defaultAccessMode: neo4j.session.WRITE,
    });
  }

  read(cypher: string, params?: Record<string, any>): Result {
    const session = this.getWriteSession();
    return session.run(cypher, params);
  }

  write(cypher: string, params?: Record<string, any>): Result {
    const session = this.getWriteSession();
    return session.run(cypher, params);
  }

  onApplicationShutdown() {
    return this.driver.close();
  }
}
