import {Injectable} from '@nestjs/common';
import {int} from 'neo4j-driver';
import {IDService} from '../../id/id.service';
import {Neo4jService} from '../../neo4j/neo4j.service';
import {
  SeriesPartEntity,
  SeriesPartsPayloadEntity,
} from '../entities/series-part.entities';
import {SeriesEntity} from '../entities/series.entity';

@Injectable()
export class SeriesService {
  constructor(
    private readonly neo4jService: Neo4jService,
    private readonly idService: IDService,
  ) {}

  async findById(id: string): Promise<SeriesEntity> {
    return this.neo4jService
      .read(`MATCH (n:Series {id: $id}) RETURN n`, {id})
      .then((res) => res.records[0].get(0).properties);
  }

  async findAllSeries(): Promise<SeriesEntity[]> {
    return this.neo4jService
      .read(`MATCH (n:Series) RETURN n`)
      .then((res) => res.records.map((record) => record.get(0).properties));
  }

  async createSeries(data: {title: string}): Promise<SeriesEntity> {
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
    props: {volume?: number; displayAs?: string} = {},
  ): Promise<SeriesPartEntity> {
    const result = await this.neo4jService
      .write(
        `
        MATCH (b:Book {id: $bookId})
        MATCH (s:Series {id: $seriesId})
        MERGE (s)-[r:IS_PART_OF_SERIES]->(b)
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
    return result;
  }

  async getPartsFromSeries(
    seriesId: string,
    {skip, limit, except}: {skip: number; limit: number; except: string[]},
  ): Promise<SeriesPartsPayloadEntity> {
    const parts: SeriesPartEntity[] = await this.neo4jService
      .read(
        `
        MATCH (s:Series {id: $seriesId})
        MATCH (b:Book)-[r:IS_PART_OF_SERIES]->(s)
        WHERE NOT b.id IN $except
        RETURN s,r,b
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
          series: record.get('s').properties,
          book: record.get('b').properties,
        })),
      );
    const meta: {
      count: number;
      hasNext: boolean;
      hasPrevious: boolean;
    } = await this.neo4jService
      .read(
        `
      MATCH p=(b)-[:PART_OF_SERIES]->(:Series {id: $seriesId})
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
    return {
      parts,
      skip,
      limit,
      ...meta,
    };
  }

  async getPartsFromBook(
    bookId: string,
    {skip, limit}: {skip: number; limit: number},
  ): Promise<SeriesPartsPayloadEntity> {
    const parts: SeriesPartEntity[] = await this.neo4jService
      .read(
        `
        MATCH (b:Book {id: $bookId})
        MATCH (b)-[r:IS_PART_OF_SERIES]->(s:Series)
        RETURN s,r,b
        SKIP $skip LIMIT $limit
        `,
        {
          bookId,
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
    const meta: {
      count: number;
      hasNext: boolean;
      hasPrevious: boolean;
    } = await this.neo4jService
      .read(
        `
        MATCH p=(b {id: $bookId})-[:IS_PART_OF_SERIES]->(:Series)
        WITH count(p) AS count
        RETURN count, 0 < count AND 0 < $skip AS previous, $skip + $limit < count AS next
        `,
        {bookId, skip, limit},
      )
      .then((result) => ({
        count: result.records[0].get('count').toNumber(),
        hasNext: result.records[0].get('next'),
        hasPrevious: result.records[0].get('previous'),
      }));
    return {
      parts,
      skip,
      limit,
      ...meta,
    };
  }
}
