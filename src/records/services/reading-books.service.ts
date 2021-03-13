import {Injectable} from '@nestjs/common';
import {int} from 'neo4j-driver';
import {Neo4jService} from '../../neo4j/neo4j.service';
import {UserEntity} from '../../users/users.entity';
import {
  ReadingBookRecordEntity,
  ReadingBooksPayloadEntity,
} from '../entities/reading-book.entities';

@Injectable()
export class ReadingBooksService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async getReadingBookRecordsFromAccount(
    account: UserEntity,
    {skip, limit}: {skip: number; limit: number},
  ): Promise<ReadingBookRecordEntity[]> {
    return this.neo4jService
      .read(
        `
        MATCH (a:Account {id: $account.id})
        MATCH (a)-[r:READING]->(b:Book)
        RETURN *
        SKIP $skip LIMIT $limit
        `,
        {
          account,
          skip: int(skip),
          limit: int(limit),
        },
      )
      .then((result) =>
        result.records.map((record) => ({
          account: record.get('a').properties,
          book: record.get('b').properties,
          have: true,
          ...record.get('r').properties,
        })),
      );
  }

  async countReadingBookRecordsFromAccount(
    account: UserEntity,
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
        MATCH p=(:Account {id: $account.id})-[:READING]->()
        WITH count(p) AS count
        RETURN count, 0 < count AND 0 < $skip AS previous, $skip + $limit < count AS next
        `,
        {account, skip, limit},
      )
      .then((result) => ({
        count: result.records[0].get('count').toNumber(),
        hasNext: result.records[0].get('next'),
        hasPrevious: result.records[0].get('previous'),
        skip,
        limit,
      }));
  }

  async unionResult(
    account: UserEntity,
    {skip = 0, limit = 0}: {skip?: number; limit?: number},
  ): Promise<ReadingBooksPayloadEntity> {
    return {
      ...(await this.countReadingBookRecordsFromAccount(account, {
        skip,
        limit,
      })),
      records: await this.getReadingBookRecordsFromAccount(account, {
        skip,
        limit,
      }),
    };
  }

  async createReadingBookRecord({
    bookId,
    accountId,
  }: {
    bookId: string;
    accountId: string;
  }): Promise<ReadingBookRecordEntity> {
    return this.neo4jService
      .read(
        `
      MATCH (b:Book {id: $bookId})
      MERGE (a:Account {id: $accountId})
      MERGE (a)-[r:READING]->(b)
      RETURN *
      `,
        {accountId, bookId},
      )
      .then((result) => ({
        account: result.records[0].get('a').properties,
        book: result.records[0].get('b').properties,
        reading: true,
        ...result.records[0].get('r').properties,
      }));
  }

  async deleteReadingBookRecord({
    bookId,
    accountId,
  }: {
    bookId: string;
    accountId: string;
  }): Promise<ReadingBookRecordEntity> {
    return this.neo4jService
      .read(
        `
      MATCH (a:Account {id: $accountId})
      MATCH (b:Book {id: $bookId})
      OPTIONAL MATCH (a)-[r:READING]->(b)
      DELETE r
      RETURN *
      `,
        {accountId, bookId},
      )
      .then((result) => ({
        account: result.records[0].get('a').properties,
        book: result.records[0].get('b').properties,
        reading: false,
      }));
  }
}
