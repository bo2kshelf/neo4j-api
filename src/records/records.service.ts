import {Injectable} from '@nestjs/common';
import {int, types} from 'neo4j-driver';
import {AccountEntity} from '../accounts/account.entity';
import {Neo4jService} from '../neo4j/neo4j.service';
import {
  HaveRecordEntity,
  ReadingRecordEntity,
  ReadRecordEntity,
  WishReadRecordEntity,
} from './record.entity';

@Injectable()
export class RecordsService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async getReadRecordsFromAccount(
    account: AccountEntity,
    {skip = 0, limit = 0}: {skip?: number; limit?: number},
  ): Promise<ReadRecordEntity[]> {
    return this.neo4jService
      .read(
        `
        MATCH (a:Account {id: $account.id})
        MATCH (a)-[r:READS]->(b:Book)
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
          ...record.get('r').properties,
        })),
      );
  }

  async getReadingRecordsFromAccount(
    account: AccountEntity,
    {skip = 0, limit = 0}: {skip?: number; limit?: number},
  ): Promise<ReadingRecordEntity[]> {
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
          reading: true,
          ...record.get('r').properties,
        })),
      );
  }

  async getWishReadRecordEntity(
    account: AccountEntity,
    {skip = 0, limit = 0}: {skip?: number; limit?: number},
  ): Promise<WishReadRecordEntity[]> {
    return this.neo4jService
      .read(
        `
        MATCH (a:Account {id: $account.id})
        MATCH (a)-[r:WANTS_TO_READ]->(b:Book)
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
          wish: true,
          ...record.get('r').properties,
        })),
      );
  }

  async getHaveRecordEntity(
    account: AccountEntity,
    {skip = 0, limit = 0}: {skip?: number; limit?: number},
  ): Promise<HaveRecordEntity[]> {
    return this.neo4jService
      .read(
        `
        MATCH (a:Account {id: $account.id})
        MATCH (a)-[r:HAS]->(b:Book)
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

  async createReadRecord(
    {
      bookId,
      accountId,
    }: {
      bookId: string;
      accountId: string;
    },
    {date, ...props}: {date: string},
  ): Promise<ReadRecordEntity> {
    return this.neo4jService
      .read(
        `
      MATCH (a:Account {id: $accountId})
      MATCH (b:Book {id: $bookId})
      MERGE (a)-[r:READS {date: $props.date}]->(b)
      SET r = $props
      RETURN *
      `,
        {
          accountId,
          bookId,
          props: {date: types.Date.fromStandardDate(new Date(date))},
        },
      )
      .then((result) => ({
        ...result.records[0].get('r').properties,
        account: result.records[0].get('a').properties,
        book: result.records[0].get('b').properties,
        date,
      }));
  }

  async createReadingRecord({
    bookId,
    accountId,
  }: {
    bookId: string;
    accountId: string;
  }): Promise<ReadingRecordEntity> {
    return this.neo4jService
      .read(
        `
      MATCH (a:Account {id: $accountId})
      MATCH (b:Book {id: $bookId})
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

  async deleteReadingRecord({
    bookId,
    accountId,
  }: {
    bookId: string;
    accountId: string;
  }): Promise<ReadingRecordEntity> {
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

  async createWishReadRecord({
    bookId,
    accountId,
  }: {
    bookId: string;
    accountId: string;
  }): Promise<WishReadRecordEntity> {
    return this.neo4jService
      .read(
        `
      MATCH (a:Account {id: $accountId})
      MATCH (b:Book {id: $bookId})
      MERGE (a)-[r:WANTS_TO_READ]->(b)
      RETURN *
      `,
        {accountId, bookId},
      )
      .then((result) => ({
        account: result.records[0].get('a').properties,
        book: result.records[0].get('b').properties,
        wish: true,
        ...result.records[0].get('r').properties,
      }));
  }

  async deleteWishReadRecord({
    bookId,
    accountId,
  }: {
    bookId: string;
    accountId: string;
  }): Promise<WishReadRecordEntity> {
    return this.neo4jService
      .read(
        `
      MATCH (a:Account {id: $accountId})
      MATCH (b:Book {id: $bookId})
      OPTIONAL MATCH (a)-[r:WANTS_TO_READ]->(b)
      DELETE r
      RETURN *
      `,
        {accountId, bookId},
      )
      .then((result) => ({
        account: result.records[0].get('a').properties,
        book: result.records[0].get('b').properties,
        wish: false,
      }));
  }

  async createHaveRecordEntity({
    bookId,
    accountId,
  }: {
    bookId: string;
    accountId: string;
  }): Promise<HaveRecordEntity> {
    return this.neo4jService
      .read(
        `
      MATCH (a:Account {id: $accountId})
      MATCH (b:Book {id: $bookId})
      MERGE (a)-[r:HAS]->(b)
      RETURN *
      `,
        {accountId, bookId},
      )
      .then((result) => ({
        account: result.records[0].get('a').properties,
        book: result.records[0].get('b').properties,
        have: true,
        ...result.records[0].get('r').properties,
      }));
  }

  async deleteHaveRecordEntity({
    bookId,
    accountId,
  }: {
    bookId: string;
    accountId: string;
  }): Promise<HaveRecordEntity> {
    return this.neo4jService
      .read(
        `
      MATCH (a:Account {id: $accountId})
      MATCH (b:Book {id: $bookId})
      OPTIONAL MATCH (a)-[r:HAS]->(b)
      DELETE r
      RETURN *
      `,
        {accountId, bookId},
      )
      .then((result) => ({
        account: result.records[0].get('a').properties,
        book: result.records[0].get('b').properties,
        have: false,
      }));
  }
}
