import {Injectable} from '@nestjs/common';
import {int} from 'neo4j-driver';
import {AuthorEntity} from '../authors/entities/author.entity';
import {BookEntity} from '../books/entities/book.entity';
import {Neo4jService} from '../neo4j/neo4j.service';
import {SeriesEntity} from '../series/entities/series.entity';
import {AuthorSeriesRelationEntity} from './author-series-relation.entity';

@Injectable()
export class AuthorSeriesRelationsService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async getRelatedBooks(
    {author, series}: AuthorSeriesRelationEntity,
    {skip = 0, limit = 0}: {skip?: number; limit?: number},
  ): Promise<BookEntity[]> {
    return this.neo4jService
      .read(
        `
    MATCH (a:Author {id: $author.id})
    MATCH (s:Series {id: $series.id})
    MATCH (a)-[:WRITES]->(b)<-[:PART_OF_SERIES]-(s)
    RETURN DISTINCT b
    SKIP $skip LIMIT $limit
    `,
        {
          author,
          series,
          skip: int(skip),
          limit: int(limit),
        },
      )
      .then((result) =>
        result.records.map((record) => record.get('b').properties),
      );
  }

  async getFromAuthor(
    author: AuthorEntity,
    {skip = 0, limit = 0}: {skip?: number; limit?: number},
  ): Promise<AuthorSeriesRelationEntity[]> {
    return this.neo4jService
      .read(
        `
      MATCH (author:Author {id: $author.id})
      MATCH (author)-[r:WRITES]->()<-[:PART_OF_SERIES]-(series)
      RETURN DISTINCT author,series
      SKIP $skip LIMIT $limit
      `,
        {
          author,
          skip: int(skip),
          limit: int(limit),
        },
      )
      .then((result) =>
        result.records.map((record) => ({
          author: record.get('author').properties,
          series: record.get('series').properties,
        })),
      );
  }

  async getFromSeries(
    series: SeriesEntity,
    {skip = 0, limit = 0}: {skip?: number; limit?: number},
  ): Promise<AuthorSeriesRelationEntity[]> {
    return this.neo4jService
      .read(
        `
      MATCH (series:Series {id: $series.id})
      MATCH (author)-[r:WRITES]->()<-[:PART_OF_SERIES]-(series)
      RETURN DISTINCT author,series
      SKIP $skip LIMIT $limit
      `,
        {
          series,
          skip: int(skip),
          limit: int(limit),
        },
      )
      .then((result) =>
        result.records.map((record) => ({
          author: record.get('author').properties,
          series: record.get('series').properties,
        })),
      );
  }
}
