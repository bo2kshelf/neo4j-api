import {Injectable} from '@nestjs/common';
import {int} from 'neo4j-driver';
import {BookEntity} from '../../books/entities/book.entity';
import {Neo4jService} from '../../neo4j/neo4j.service';
import {AuthorSeriesRelationEntity} from '../entities/author-series.entity';

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
    authorId: string,
    {skip, limit}: {skip: number; limit: number},
  ): Promise<AuthorSeriesRelationEntity[]> {
    return this.neo4jService
      .read(
        `
      MATCH (a:Author {id: $authorId})
      MATCH (a)-[r:WRITED_BOOK]->()<-[:IS_PART_OF_SERIES]-(s:Series)
      RETURN DISTINCT a,s
      SKIP $skip LIMIT $limit
      `,
        {
          authorId,
          skip: int(skip),
          limit: int(limit),
        },
      )
      .then((result) =>
        result.records.map((record) => ({
          author: record.get('a').properties,
          series: record.get('s').properties,
        })),
      );
  }

  async getFromSeries(
    seriesId: string,
    {skip, limit}: {skip: number; limit: number},
  ): Promise<AuthorSeriesRelationEntity[]> {
    return this.neo4jService
      .read(
        `
      MATCH (s:Series {id: $series.id})
      MATCH (a)-[r:WRITED_BOOK]->()<-[:PART_OF_SERIES]-(s)
      RETURN DISTINCT a,s
      SKIP $skip LIMIT $limit
      `,
        {
          seriesId,
          skip: int(skip),
          limit: int(limit),
        },
      )
      .then((result) =>
        result.records.map((record) => ({
          author: record.get('a').properties,
          series: record.get('s').properties,
        })),
      );
  }
}
