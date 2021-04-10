import {Injectable} from '@nestjs/common';
import {int} from 'neo4j-driver';
import {IDService} from '../../common/id/id.service';
import {OrderBy} from '../../common/order-by.enum';
import {Neo4jService} from '../../neo4j/neo4j.service';
import {NextBookConnection} from '../entities/next-book-connection.entity';
import {SeriesPartEntity} from '../entities/series-part.entity';
import {SeriesSubPartEntity} from '../entities/series-sub-part.entity';
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

  async createSeries(
    bookId: string,
    data: {title: string},
  ): Promise<{
    seriesId: string;
    bookId: string;
  }> {
    const result = await this.neo4jService.write(
      `
        MATCH (b:Book {id: $bookId})
        CREATE (s:Series) SET s += $data
        CREATE (s)-[:HEAD_OF_SERIES]->(b)
        RETURN b.id AS b, s.id AS s
        `,
      {bookId, data: {id: this.idService.generate(), ...data}},
    );
    if (result.records.length === 0) throw new Error('Not Found');
    return {
      seriesId: result.records[0].get('s'),
      bookId: result.records[0].get('b'),
    };
  }

  async previousBooks(
    bookId: string,
    {skip, limit}: {skip: number; limit: number},
  ): Promise<{
    count: number;
    hasNext: boolean;
    hasPrevious: boolean;
    nodes: NextBookConnection[];
  }> {
    const nodes: NextBookConnection[] = await this.neo4jService
      .read(
        `
        MATCH (target:Book {id: $bookId})
        MATCH p=(pre:Book)-[:NEXT_BOOK*]->(target)
        WITH p, pre ORDER BY length(p) ASC
        MATCH (pre)-[:NEXT_BOOK]->(next:Book)
        RETURN pre.id AS pre, next.id AS next
        SKIP $skip LIMIT $limit
        `,
        {bookId, skip: int(skip), limit: int(limit)},
      )
      .then((result) =>
        result.records.map((record) => ({
          previousId: record.get('pre'),
          nextId: record.get('next'),
        })),
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
    nodes: NextBookConnection[];
  }> {
    const nodes: NextBookConnection[] = await this.neo4jService
      .read(
        `
        MATCH (target:Book {id: $bookId})
        MATCH p=(target)-[:NEXT_BOOK*]->(next:Book)
        WITH p, next ORDER BY length(p) ASC
        MATCH (pre:Book)-[:NEXT_BOOK]->(next)
        RETURN pre.id AS pre, next.id AS next
        SKIP $skip LIMIT $limit
        `,
        {bookId, skip: int(skip), limit: int(limit)},
      )
      .then((result) =>
        result.records.map((record) => ({
          previousId: record.get('pre'),
          nextId: record.get('next'),
        })),
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

  async getHeadOfSeries(seriesId: string): Promise<SeriesPartEntity> {
    return this.neo4jService
      .read(
        `
        MATCH (s:Series {id: $seriesId})-[:HEAD_OF_SERIES]->(b:Book)
        OPTIONAL MATCH (s)-[r:PART_OF_SERIES]->(b)
        RETURN s.id AS s, b.id AS b, r.numberingAs AS numberingAs
        `,
        {seriesId},
      )
      .then((result) => ({
        seriesId: result.records[0].get('s'),
        bookId: result.records[0].get('b'),
        numberingAs: result.records[0].get('numberingAs'),
      }));
  }

  async getPartsOfSeries(
    seriesId: string,
    {skip, limit, orderBy}: {skip: number; limit: number; orderBy: OrderBy},
  ): Promise<{
    nodes: SeriesPartEntity[];
    count: number;
    hasNext: boolean;
    hasPrevious: boolean;
  }> {
    const nodes: SeriesPartEntity[] = await this.neo4jService
      .read(
        `
        MATCH (s:Series {id: $seriesId})-[:HEAD_OF_SERIES]->(h:Book)
        MATCH p=(h)-[:NEXT_BOOK*0..]->(b)
        OPTIONAL MATCH (s)-[r:PART_OF_SERIES]->(b)
        RETURN s.id AS s, b.id AS b, r.numberingAs AS numberingAs
        ORDER BY length(p) ${orderBy}
        SKIP $skip LIMIT $limit
        `,
        {seriesId, skip: int(skip), limit: int(limit)},
      )
      .then((result) =>
        result.records.map((record) => ({
          seriesId: record.get('s'),
          bookId: record.get('b'),
          numberingAs: record.get('numberingAs'),
        })),
      );
    const meta: {
      count: number;
      hasNext: boolean;
      hasPrevious: boolean;
    } = await this.neo4jService
      .read(
        `
          MATCH p=(s:Series {id: $seriesId})-[:HEAD_OF_SERIES]->()-[:NEXT_BOOK*0..]->()
          WITH count(p) AS count
          RETURN count, 0 < count AND 0 < $skip AS previous, $skip + $limit < count AS next
          `,
        {seriesId, skip: int(skip), limit: int(limit)},
      )
      .then((result) => ({
        count: result.records[0].get('count').toNumber(),
        hasNext: result.records[0].get('next'),
        hasPrevious: result.records[0].get('previous'),
      }));
    return {nodes, ...meta};
  }

  async getSubPartsOfSeries(
    seriesId: string,
    {skip, limit}: {skip: number; limit: number},
  ): Promise<{
    nodes: SeriesSubPartEntity[];
    count: number;
    hasNext: boolean;
    hasPrevious: boolean;
  }> {
    const nodes: SeriesSubPartEntity[] = await this.neo4jService
      .read(
        `
        MATCH (s:Series {id: $seriesId})-[:SUBPART_OF_SERIES]->(b:Book)
        WITH s,b ORDER BY b.title
        RETURN s.id AS s, b.id AS b
        SKIP $skip LIMIT $limit
        `,
        {seriesId, skip: int(skip), limit: int(limit)},
      )
      .then((result) =>
        result.records.map((record) => ({
          seriesId: record.get('s'),
          bookId: record.get('b'),
        })),
      );
    const meta: {
      count: number;
      hasNext: boolean;
      hasPrevious: boolean;
    } = await this.neo4jService
      .read(
        `
          MATCH p=(s:Series {id: $seriesId})-[:SUBPART_OF_SERIES]->()
          WITH count(p) AS count
          RETURN count, 0 < count AND 0 < $skip AS previous, $skip + $limit < count AS next
          `,
        {seriesId, skip: int(skip), limit: int(limit)},
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
  ): Promise<{seriesId: string; bookId: string; numberingAs?: string}[]> {
    const nodes = await this.neo4jService
      .read(
        `
        MATCH (b:Book {id: $bookId})
        MATCH (s:Series)-[:HEAD_OF_SERIES]->()-[:NEXT_BOOK*0..]->(b)
        OPTIONAL MATCH (s)-[r:PART_OF_SERIES]->(b)
        RETURN s.id AS s, b.id AS b, r.numberingAs AS numberingAs
        `,
        {bookId},
      )
      .then((result) =>
        result.records.map((record) => ({
          seriesId: record.get('s'),
          bookId: record.get('b'),
          numberingAs: record.get('numberingAs'),
        })),
      );
    return nodes;
  }

  async connectBooksAsNextBook({
    previousId,
    nextId,
  }: {
    previousId: string;
    nextId: string;
  }): Promise<{
    previousId: string;
    nextId: string;
  }> {
    const result = await this.neo4jService.write(
      `
        MATCH (p:Book {id: $previousId}), (n:Book {id: $nextId})
        MERGE (p)-[:NEXT_BOOK]->(n)
        RETURN p.id AS p, n.id AS n
        `,
      {previousId, nextId},
    );
    if (result.records.length === 0) throw new Error('Not Found');
    return {
      previousId: result.records[0].get('p'),
      nextId: result.records[0].get('n'),
    };
  }
}
