import {Module} from '@nestjs/common';
import {ConfigModule, ConfigType} from '@nestjs/config';
import {GraphQLFederationModule} from '@nestjs/graphql';
import {AccountsModule} from './accounts/accounts.module';
import {AuthorSeriesRelationsModule} from './author-series-relation/author-series-relations.module';
import {AuthorsModule} from './authors/authors.module';
import {BooksModule} from './books/books.module';
import {Neo4jConfig} from './neo4j/neo4j.config';
import {Neo4jModule} from './neo4j/neo4j.module';
import {PartsOfSeriesModule} from './parts-of-series/parts-of-series.module';
import {RecordsModule} from './records/records.module';
import {SeriesModule} from './series/series.module';
import {WritingsModule} from './writings/writings.module';

@Module({
  imports: [
    GraphQLFederationModule.forRoot({
      autoSchemaFile: true,
    }),
    Neo4jModule.forRootAsync({
      imports: [ConfigModule.forFeature(Neo4jConfig)],
      inject: [Neo4jConfig.KEY],
      useFactory: async (config: ConfigType<typeof Neo4jConfig>) => ({
        url: config.url,
        username: config.username,
        password: config.password,
      }),
    }),
    BooksModule,
    AuthorsModule,
    SeriesModule,
    WritingsModule,
    PartsOfSeriesModule,
    AuthorSeriesRelationsModule,
    AccountsModule,
    RecordsModule,
  ],
})
export class AppModule {}
