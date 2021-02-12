import {Injectable} from '@nestjs/common';
import {int} from 'neo4j-driver';
import {BookEntity} from '../books/book.entity';
import {OrderBy} from '../common/order-by.enum';
import {Neo4jService} from '../neo4j/neo4j.service';
import {SeriesEntity} from '../series/series.entity';
import {
  SeriesPartEntity,
  SeriesPartsPayloadEntity,
} from './part-of-series.entity';

@Injectable()
export class PartsOfSeriesService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async getFromBook(
    book: BookEntity,
    {skip, limit}: {skip: number; limit: number},
  ): Promise<SeriesPartEntity[]> {
    return this.neo4jService
      .read(
        `
      MATCH (b:Book {id: $book.id})
      MATCH (s)-[r:PART_OF_SERIES]->(b)
      RETURN s,r,b
      SKIP $skip LIMIT $limit
      `,
        {
          book,
          skip: int(skip),
          limit: int(limit),
        },
      )
      .then((result) =>
        result.records.map((record) => ({
          ...record.get('r').properties,
          series: record.get('s').properties,
          book: record.get('b').properties,
        })),
      );
  }

  async getMetaFromBook(
    book: BookEntity,
    {skip, limit}: {skip: number; limit: number},
  ): Promise<{
    count: number;
    skip: number;
    limit: number;
    hasPrevious: boolean;
    hasNext: boolean;
  }> {
    return this.neo4jService
      .read(
        `
        MATCH p=()-[:PART_OF_SERIES]->(:Book {id: $book.id})
        WITH count(p) AS count
        RETURN count, 0 < count AND 0 < $skip AS previous, $skip + $limit < count AS next
      `,
        {
          book,
          skip: int(skip),
          limit: int(limit),
        },
      )
      .then((result) => ({
        count: result.records[0].get('count').toNumber(),
        hasNext: result.records[0].get('next'),
        hasPrevious: result.records[0].get('previous'),
        skip,
        limit,
      }));
  }

  async unionFromBook(
    book: BookEntity,
    {skip = 0, limit = 0}: {skip?: number; limit?: number},
  ): Promise<SeriesPartsPayloadEntity> {
    return {
      parts: await this.getFromBook(book, {skip, limit}),
      ...(await this.getMetaFromBook(book, {skip, limit})),
    };
  }

  orderByBuilder(
    orderBy: Partial<{title: OrderBy; volume: OrderBy}>,
    {series, relation, book}: {series: string; relation: string; book: string},
  ): string {
    const order = [];
    if (orderBy.volume) order.push(`${relation}.volume ${orderBy.volume}`);
    if (orderBy.title) order.push(`${book}.title ${orderBy.title}`);

    if (order.length > 0) return `ORDER BY ${order.join(',')}`;
    return '';
  }

  async getPartsFromSeries(
    series: SeriesEntity,
    {
      skip,
      limit,
      orderBy,
    }: {
      skip: number;
      limit: number;
      orderBy: Parameters<PartsOfSeriesService['orderByBuilder']>[0];
    },
  ): Promise<SeriesPartEntity[]> {
    return this.neo4jService
      .read(
        `
      MATCH (s:Series {id: $series.id})
      MATCH (s)-[r:PART_OF_SERIES]->(b)
      RETURN s,r,b
      ${this.orderByBuilder(orderBy, {series: 's', relation: 'r', book: 'b'})}
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
          ...record.get('r').properties,
          series: record.get('s').properties,
          book: record.get('b').properties,
        })),
      );
  }

  async getMetaFromSeries(
    series: SeriesEntity,
    {skip, limit}: {skip: number; limit: number},
  ): Promise<{
    count: number;
    skip: number;
    limit: number;
    hasPrevious: boolean;
    hasNext: boolean;
  }> {
    return this.neo4jService
      .read(
        `
        MATCH p=(:Series {id: $series.id})-[:PART_OF_SERIES]->()
        WITH count(p) AS count
        RETURN count, 0 < count AND 0 < $skip AS previous, $skip + $limit < count AS next
        `,
        {series, skip, limit},
      )
      .then((result) => ({
        count: result.records[0].get('count').toNumber(),
        hasNext: result.records[0].get('next'),
        hasPrevious: result.records[0].get('previous'),
        skip,
        limit,
      }));
  }

  async unionFromSeries(
    series: SeriesEntity,
    {
      skip = 0,
      limit = 0,
      orderBy = {},
    }: {
      skip?: number;
      limit?: number;
      orderBy?: Parameters<PartsOfSeriesService['orderByBuilder']>[0];
    },
  ): Promise<SeriesPartsPayloadEntity> {
    return {
      parts: await this.getPartsFromSeries(series, {skip, limit, orderBy}),
      ...(await this.getMetaFromSeries(series, {skip, limit})),
    };
  }

  async connectSeriesAndBook(
    {bookId, seriesId}: {bookId: string; seriesId: string},
    props: {volume?: number} = {},
  ): Promise<SeriesPartEntity> {
    return this.neo4jService
      .write(
        `
        MATCH (s:Series {id: $seriesId})
        MATCH (b:Book {id: $bookId})
        MERGE (s)-[r:PART_OF_SERIES]->(b)
        SET r = $props
        RETURN s,r,b
      `,
        {bookId, seriesId, props},
      )
      .then((result) =>
        result.records.map((record) => ({
          ...record.get('r').properties,
          series: record.get('s').properties,
          book: record.get('b').properties,
        })),
      )
      .then((entities) => entities[0]);
  }
}
