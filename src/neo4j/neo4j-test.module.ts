import {Module} from '@nestjs/common';
import {ConfigModule, ConfigType} from '@nestjs/config';
import {Neo4jTestConfig} from './neo4j-test.config';
import {Neo4jModule} from './neo4j.module';

@Module({
  imports: [
    Neo4jModule.forRootAsync({
      imports: [ConfigModule.forFeature(Neo4jTestConfig)],
      inject: [Neo4jTestConfig.KEY],
      useFactory: async (config: ConfigType<typeof Neo4jTestConfig>) => ({
        url: config.url,
      }),
    }),
  ],
})
export class Neo4jTestModule {}
