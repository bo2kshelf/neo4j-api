import {Injectable} from '@nestjs/common';
import {int} from 'neo4j-driver';
import {BookEntity} from '../../books/entities/book.entity';
import {IDService} from '../../common/id/id.service';
import {OrderBy} from '../../common/order-by.enum';
import {Neo4jService} from '../../neo4j/neo4j.service';
import {SeriesPartEntity} from '../entities/series-part.entity';
import {SeriesEntity} from '../entities/series.entity';

@Injectable()
export class SeriesService {
  constructor(
    private readonly neo4jService: Neo4jService,
    private readonly idService: IDService,
  ) {}

  async findById(id: string): Promise<SeriesEntity> {
    const result = await this.neo4jService.read(
      `MATCH (n:Series {id: $id}) RETURN n`,
      {id},
    );
    if (result.records.length === 0) throw new Error('Not Found');
    return result.records[0].get(0).properties;
  }

  async findAll(): Promise<SeriesEntity[]> {
    return this.neo4jService
      .read(`MATCH (n:Series) RETURN n`)
      .then((res) => res.records.map((record) => record.get(0).properties));
  }

  async create(data: {title: string}): Promise<SeriesEntity> {
    const result = await this.neo4jService.write(
      `
      CREATE (n:Series {id: $id})
      SET n += $data
      RETURN n`,
      {
        id: this.idService.generate(),
        data,
      },
    );
    return result.records[0].get(0).properties;
  }

  async addBookToSeries(
    {bookId, seriesId}: {bookId: string; seriesId: string},
    props: {order?: number; displayAs?: string} = {},
  ): Promise<SeriesPartEntity> {
    const result = await this.neo4jService
      .write(
        `
        MATCH (b:Book {id: $bookId})
        MATCH (s:Series {id: $seriesId})
        MERGE (b)-[r:IS_PART_OF_SERIES]->(s)
        SET r = $props
        RETURN s,r,b
      `,
        {bookId, seriesId, props},
      )
      .then(
        (result) =>
          result.records.map((record) => ({
            ...record.get('r').properties,
            seriesId: record.get('s').properties.id,
            bookId: record.get('b').properties.id,
          }))[0],
      );
    return result;
  }

  async getPartsFromSeries(
    seriesId: string,
    {
      skip,
      limit,
      except,
      orderBy,
    }: {
      skip: number;
      limit: number;
      except: string[];
      orderBy: {order: OrderBy; title: OrderBy};
    },
  ): Promise<{
    nodes: SeriesPartEntity[];
    count: number;
    hasNext: boolean;
    hasPrevious: boolean;
  }> {
    const parts: SeriesPartEntity[] = await this.neo4jService
      .read(
        `
        MATCH (s:Series {id: $seriesId})
        MATCH (b:Book)-[r:IS_PART_OF_SERIES]->(s)
        WHERE NOT b.id IN $except
        RETURN s,r,b
        ORDER BY r.order ${orderBy.order}, b.title ${orderBy.title}
        SKIP $skip LIMIT $limit
        `,
        {
          seriesId,
          skip: int(skip),
          limit: int(limit),
          except,
        },
      )
      .then((result) =>
        result.records.map((record) => ({
          ...record.get('r').properties,
          seriesId: record.get('s').properties.id,
          bookId: record.get('b').properties.id,
        })),
      );
    const meta: {
      count: number;
      hasNext: boolean;
      hasPrevious: boolean;
    } = await this.neo4jService
      .read(
        `
      MATCH p=(:Book)-[:IS_PART_OF_SERIES]->(:Series {id: $seriesId})
      WITH count(p) AS count
      RETURN count, 0 < count AND 0 < $skip AS previous, $skip + $limit < count AS next
      `,
        {seriesId, skip, limit, except},
      )
      .then((result) => ({
        count: result.records[0].get('count').toNumber(),
        hasNext: result.records[0].get('next'),
        hasPrevious: result.records[0].get('previous'),
      }));
    return {nodes: parts, ...meta};
  }

  async getPartsFromBook(
    bookId: string,
  ): Promise<{nodes: SeriesPartEntity[]; count: number}> {
    const parts: SeriesPartEntity[] = await this.neo4jService
      .read(
        `
        MATCH (b:Book {id: $bookId})
        MATCH (b)-[r:IS_PART_OF_SERIES]->(s:Series)
        RETURN s,r,b
        `,
        {
          bookId,
        },
      )
      .then((result) =>
        result.records.map((record) => ({
          ...record.get('r').properties,
          seriesId: record.get('s').properties.id,
          bookId: record.get('b').properties.id,
        })),
      );
    const meta: {
      count: number;
    } = await this.neo4jService
      .read(
        `
        MATCH p=(:Book {id: $bookId})-[:IS_PART_OF_SERIES]->(:Series)
        WITH count(p) AS count
        RETURN count
        `,
        {bookId},
      )
      .then((result) => ({
        count: result.records[0].get('count').toNumber(),
      }));
    return {nodes: parts, ...meta};
  }

  async previousBooks(
    bookId: string,
    {skip, limit}: {skip: number; limit: number},
  ): Promise<{
    count: number;
    hasNext: boolean;
    hasPrevious: boolean;
    nodes: BookEntity[];
  }> {
    const nodes: BookEntity[] = await this.neo4jService
      .read(
        `
        MATCH (b:Book {id: $bookId})
        MATCH p=(pre:Book)-[:NEXT_BOOK*]->(b)
        WHERE $skip < length(p) AND length(p) <= $limit
        RETURN p, pre
        ORDER BY length(p) ASC
        `,
        {bookId, skip: int(skip), limit: int(limit)},
      )
      .then((result) =>
        result.records.map((record) => record.get('pre').properties),
      );
    const meta: {
      count: number;
      hasNext: boolean;
      hasPrevious: boolean;
    } = await this.neo4jService
      .read(
        `
        MATCH p=(:Book)-[:NEXT_BOOK*]->(:Book {id: $bookId})
        WITH count(p) AS count
        RETURN count, 0 < count AND 0 < $skip AS previous, $skip + $limit < count AS next
        `,
        {bookId, skip: int(skip), limit: int(limit)},
      )
      .then((result) => ({
        count: result.records[0].get('count').toNumber(),
        hasNext: result.records[0].get('next'),
        hasPrevious: result.records[0].get('previous'),
      }));
    return {nodes, ...meta};
  }

  async nextBooks(
    bookId: string,
    {skip, limit}: {skip: number; limit: number},
  ): Promise<{
    count: number;
    hasNext: boolean;
    hasPrevious: boolean;
    nodes: BookEntity[];
  }> {
    const nodes: BookEntity[] = await this.neo4jService
      .read(
        `
        MATCH (b:Book {id: $bookId})
        MATCH p=(b)-[:NEXT_BOOK*]->(next:Book)
        WHERE $skip < length(p) AND length(p) <= $limit
        RETURN p, next
        ORDER BY length(p) ASC
        `,
        {bookId, skip: int(skip), limit: int(limit)},
      )
      .then((result) =>
        result.records.map((record) => record.get('next').properties),
      );
    const meta: {
      count: number;
      hasNext: boolean;
      hasPrevious: boolean;
    } = await this.neo4jService
      .read(
        `
        MATCH p=(:Book {id: $bookId})-[:NEXT_BOOK*]->(:Book)
        WITH count(p) AS count
        RETURN count, 0 < count AND 0 < $skip AS previous, $skip + $limit < count AS next
        `,
        {bookId, skip: int(skip), limit: int(limit)},
      )
      .then((result) => ({
        count: result.records[0].get('count').toNumber(),
        hasNext: result.records[0].get('next'),
        hasPrevious: result.records[0].get('previous'),
      }));
    return {nodes, ...meta};
  }

  async getSeriesFromBook(
    bookId: string,
  ): Promise<{seriesId: string; numberingAs?: string}[]> {
    const node: {seriesId: string}[] = await this.neo4jService
      .read(
        `
        MATCH (b:Book {id: $bookId})
        MATCH (s:Series)-[:HEAD_OF_SERIES]->()-[:NEXT_BOOK*0..]->(b)
        OPTIONAL MATCH (s)-[r:PART_OF_SERIES]->(b)
        RETURN s.id AS s, r.numberingAs AS numberingAs
        `,
        {bookId},
      )
      .then((result) =>
        result.records.map((record) => ({
          seriesId: record.get('s'),
          numberingAs: record.get('numberingAs'),
        })),
      );
    return node;
  }
}
