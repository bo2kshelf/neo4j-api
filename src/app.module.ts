import {Module} from '@nestjs/common';
import {ConfigModule, ConfigType} from '@nestjs/config';
import {GraphQLFederationModule} from '@nestjs/graphql';
import {AuthorsModule} from './authors/authors.module';
import {WritingsModule} from './authors/writings.module';
import {BooksModule} from './books/books.module';
import {LabelingsModule} from './labels/labelings.module';
import {LabelsModule} from './labels/labels.module';
import {Neo4jConfig} from './neo4j/neo4j.config';
import {Neo4jModule} from './neo4j/neo4j.module';
import {PublicationsModule} from './publishers/publications.module';
import {PublishersModule} from './publishers/publishers.module';
import {RecordsModule} from './records/records.module';
import {AuthorSeriesRelationsModule} from './relations/author-series.module';
import {PublisherLabelRelationsModule} from './relations/publisher-label.module';
import {SeriesPartModule} from './series/series-part.module';
import {SeriesModule} from './series/series.module';
import {UserRecordsModule} from './users/user-records.module';
import {UsersModule} from './users/users.module';

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
    WritingsModule,
    SeriesModule,
    SeriesPartModule,
    PublishersModule,
    PublicationsModule,
    LabelsModule,
    LabelingsModule,
    UsersModule,
    UserRecordsModule,
    RecordsModule,
    AuthorSeriesRelationsModule,
    PublisherLabelRelationsModule,
  ],
})
export class AppModule {}
