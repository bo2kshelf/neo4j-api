import {Module} from '@nestjs/common';
import {ConfigModule, ConfigType} from '@nestjs/config';
import {GraphQLFederationModule} from '@nestjs/graphql';
import {AuthorsModule} from './authors/authors.module';
import {BooksModule} from './books/books.module';
import {Neo4jConfig} from './neo4j/neo4j.config';
import {Neo4jModule} from './neo4j/neo4j.module';
import {WritingsModule} from './writings/writings.module';

@Module({
  imports: [
    GraphQLFederationModule.forRoot({
      typePaths: ['**/*.graphqls'],
    }),
    Neo4jModule.forRootAsync({
      imports: [ConfigModule.forFeature(Neo4jConfig)],
      inject: [Neo4jConfig.KEY],
      useFactory: async (config: ConfigType<typeof Neo4jConfig>) => ({
        scheme: config.scheme,
        host: config.host,
        port: config.port,
        username: config.username,
        password: config.password,
      }),
    }),
    WritingsModule,
    BooksModule,
    AuthorsModule,
  ],
})
export class AppModule {}
