import {Injectable} from '@nestjs/common';
import {int} from 'neo4j-driver';
import {BookEntity} from '../../books/entities/book.entity';
import {IDService} from '../../common/id/id.service';
import {OrderBy} from '../../common/order-by.enum';
import {Neo4jService} from '../../neo4j/neo4j.service';
import {RecordEntity} from '../entities/record.entity';

@Injectable()
export class RecordsService {
  constructor(
    private readonly neo4jService: Neo4jService,
    private readonly idService: IDService,
  ) {}

  async findById(id: string): Promise<RecordEntity> {
    const result = await this.neo4jService.read(
      `MATCH (n:Record {id: $id}) RETURN n`,
      {id},
    );
    if (result.records.length === 0) throw new Error('Not Found');
    return result.records[0].get(0).properties;
  }

  async findAll(): Promise<RecordEntity[]> {
    return this.neo4jService
      .read(`MATCH (n:Record) RETURN n`)
      .then((res) => res.records.map((record) => record.get(0).properties));
  }

  async createRecord(
    {userId, bookId}: {userId: string; bookId: string},
    {readAt, ...props}: {readAt?: string},
  ): Promise<RecordEntity> {
    return readAt
      ? this.neo4jService
          .write(
            `
          MATCH (u:User {id: $userId}), (b:Book {id: $bookId})
          MERGE (u)-[:RECORDED]->(rec:Record {readAt: $readAt})-[:RECORD_OF]->(b)
          ON CREATE SET rec.id = $id
          SET rec += $props
          RETURN rec.id AS id, rec.readAt AS readAt
          `,
            {
              userId,
              bookId,
              id: this.idService.generate(),
              readAt,
              props,
            },
          )
          .then(({records}) => ({
            id: records[0].get('id'),
            readAt: records[0].get('readAt'),
          }))
      : this.neo4jService
          .write(
            `
            MATCH (u:User {id: $userId}), (b:Book {id: $bookId})
            CREATE (u)-[:RECORDED]->(rec:Record {id: $id})-[:RECORD_OF]->(b)
            SET rec += $props
            RETURN rec.id AS id
            `,
            {userId, bookId, id: this.idService.generate(), props},
          )
          .then(({records}) => ({
            id: records[0].get('id'),
            readAt: null,
          }));
  }

  async getUserIdByRecord(recordId: string): Promise<string> {
    const result = await this.neo4jService.read(
      `MATCH (u:User)-[:RECORDED]->(:Record {id: $recordId}) RETURN u.id AS id`,
      {recordId},
    );
    if (result.records.length === 0) throw new Error('Not Found');
    return result.records[0].get('id');
  }

  async getBookIdByRecord(recordId: string): Promise<string> {
    const result = await this.neo4jService.read(
      `MATCH (:Record {id: $recordId})-[:RECORD_OF]->(b:Book) RETURN b.id AS id`,
      {recordId},
    );
    if (result.records.length === 0) throw new Error('Not Found');
    return result.records[0].get('id');
  }

  async getRecordsFromUser(
    userId: string,
    {
      skip,
      limit,
      orderBy,
    }: {skip: number; limit: number; orderBy: {readAt: OrderBy}},
  ): Promise<{
    count: number;
    hasNext: boolean;
    hasPrevious: boolean;
    nodes: RecordEntity[];
  }> {
    const nodes: RecordEntity[] = await this.neo4jService
      .read(
        `
      MATCH (u:User {id: $userId})
      CALL {
          MATCH (u)-[:RECORDED]->(r:Record)
          WHERE r.readAt IS NOT NULL
          RETURN r
          ORDER BY r.readAt ${orderBy.readAt}
          UNION
          MATCH (u)-[:RECORDED]->(r:Record)
          WHERE r.readAt IS NULL
          RETURN r
      }
      RETURN r.id AS id, toString(r.readAt) AS readAt
      SKIP $skip LIMIT $limit
    `,
        {userId, skip: int(skip), limit: int(limit)},
      )
      .then((result) =>
        result.records.map((record) => ({
          id: record.get('id'),
          readAt: record.get('readAt'),
        })),
      );
    const meta: {
      count: number;
      hasNext: boolean;
      hasPrevious: boolean;
    } = await this.neo4jService
      .read(
        `
      MATCH p=(:User {id: $userId})-[:RECORDED]->(:Record)
      WITH count(p) AS count
      RETURN count, 0 < count AND 0 < $skip AS previous, $skip + $limit < count AS next
    `,
        {userId, skip: int(skip), limit: int(limit)},
      )
      .then((result) => ({
        count: result.records[0].get('count').toNumber(),
        hasNext: result.records[0].get('next'),
        hasPrevious: result.records[0].get('previous'),
      }));
    return {nodes, ...meta};
  }

  async getReadBooksFromUser(
    userId: string,
    {
      skip,
      limit,
      orderBy,
    }: {skip: number; limit: number; orderBy: {title: OrderBy}},
  ): Promise<{
    count: number;
    hasNext: boolean;
    hasPrevious: boolean;
    nodes: BookEntity[];
  }> {
    const nodes: BookEntity[] = await this.neo4jService
      .read(
        `
        MATCH (u:User {id: $userId})
        MATCH (u)-[:RECORDED]->(:Record)-[:RECORD_OF]->(b:Book)
        RETURN DISTINCT b
        ORDER BY b.title ${orderBy.title}
        SKIP $skip LIMIT $limit
        `,
        {userId, skip: int(skip), limit: int(limit)},
      )
      .then((result) => {
        return result.records.map((record) => record.get('b').properties);
      });
    const meta: {
      count: number;
      hasNext: boolean;
      hasPrevious: boolean;
    } = await this.neo4jService
      .read(
        `
        MATCH (:User {id: $userId})-[:RECORDED]->(:Record)-[:RECORD_OF]->(b)
        WITH DISTINCT b
        WITH count(b) AS count
        RETURN count, 0 < count AND 0 < $skip AS previous, $skip + $limit < count AS next
  `,
        {userId, skip: int(skip), limit: int(limit)},
      )
      .then((result) => ({
        count: result.records[0].get('count').toNumber(),
        hasNext: result.records[0].get('next'),
        hasPrevious: result.records[0].get('previous'),
      }));
    return {nodes, ...meta};
  }
}
