import {Injectable} from '@nestjs/common';
import {int} from 'neo4j-driver';
import {BookEntity} from '../../books/entities/book.entity';
import {OrderBy} from '../../common/order-by.enum';
import {Neo4jService} from '../../neo4j/neo4j.service';
import {AuthorSeriesRelationEntity} from '../entities/author-series.entity';

@Injectable()
export class AuthorSeriesRelationsService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async getFromAuthor(
    authorId: string,
    {
      skip,
      limit,
      orderBy,
    }: {skip: number; limit: number; orderBy: {title: OrderBy}},
  ): Promise<{
    nodes: AuthorSeriesRelationEntity[];
    count: number;
    hasNext: boolean;
    hasPrevious: boolean;
  }> {
    const relations: AuthorSeriesRelationEntity[] = await this.neo4jService
      .read(
        `
      MATCH (a:Author {id: $authorId})
      MATCH (a)-[r:WRITED_BOOK]->(:Book)-[:IS_PART_OF_SERIES]->(s:Series)
      RETURN DISTINCT a,s
      ORDER BY s.title ${orderBy.title}
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
          authorId: record.get('a').properties.id,
          seriesId: record.get('s').properties.id,
        })),
      );
    const meta: {
      count: number;
      hasNext: boolean;
      hasPrevious: boolean;
    } = await this.neo4jService
      .read(
        `
      MATCH (a:Author {id: $authorId})
      MATCH (a)-[:WRITED_BOOK]->(:Book)-[:IS_PART_OF_SERIES]->(s:Series)
      WITH DISTINCT a,s
      WITH count(s) AS count
      RETURN count, 0 < count AND 0 < $skip AS previous, $skip + $limit < count AS next
      `,
        {
          authorId,
          skip: int(skip),
          limit: int(limit),
        },
      )
      .then((result) => ({
        count: result.records[0].get('count').toNumber(),
        hasNext: result.records[0].get('next'),
        hasPrevious: result.records[0].get('previous'),
      }));
    return {nodes: relations, ...meta};
  }

  async getFromSeries(
    seriesId: string,
    {
      skip,
      limit,
      orderBy,
    }: {skip: number; limit: number; orderBy: {name: OrderBy}},
  ): Promise<{
    nodes: AuthorSeriesRelationEntity[];
    count: number;
    hasNext: boolean;
    hasPrevious: boolean;
  }> {
    const relations = await this.neo4jService
      .read(
        `
      MATCH (s:Series {id: $seriesId})
      MATCH (a:Author)-[r:WRITED_BOOK]->(:Book)-[:IS_PART_OF_SERIES]->(s)
      RETURN DISTINCT a,s
      ORDER BY a.name ${orderBy.name}
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
          authorId: record.get('a').properties.id,
          seriesId: record.get('s').properties.id,
        })),
      );
    const meta: {
      count: number;
      hasNext: boolean;
      hasPrevious: boolean;
    } = await this.neo4jService
      .read(
        `
        MATCH (s:Series {id: $seriesId})
        MATCH (a:Author)-[:WRITED_BOOK]->(:Book)-[:IS_PART_OF_SERIES]->(s)
        WITH DISTINCT a,s
        WITH count(a) AS count
        RETURN count, 0 < count AND 0 < $skip AS previous, $skip + $limit < count AS next

        `,
        {
          seriesId,
          skip: int(skip),
          limit: int(limit),
        },
      )
      .then((result) => ({
        count: result.records[0].get('count').toNumber(),
        hasNext: result.records[0].get('next'),
        hasPrevious: result.records[0].get('previous'),
      }));
    return {nodes: relations, ...meta};
  }

  async getRelatedBooks(
    {authorId, seriesId}: {authorId: string; seriesId: string},
    {
      skip,
      limit,
      orderBy,
    }: {skip: number; limit: number; orderBy: {order: OrderBy; title: OrderBy}},
  ): Promise<BookEntity[]> {
    return this.neo4jService
      .read(
        `
        MATCH (a:Author {id: $authorId})
        MATCH (s:Series {id: $seriesId})
        MATCH (a)-[:WRITED_BOOK]->(b)-[bs:IS_PART_OF_SERIES]->(s)
        WITH DISTINCT b,bs
        ORDER BY bs.order ${orderBy.order}, b.title ${orderBy.title}
        RETURN b
        SKIP $skip LIMIT $limit
        `,
        {
          authorId,
          seriesId,
          skip: int(skip),
          limit: int(limit),
        },
      )
      .then((result) =>
        result.records.map((record) => record.get('b').properties),
      );
  }
}
