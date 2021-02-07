import {Injectable} from '@nestjs/common';
import {int} from 'neo4j-driver';
import {AccountEntity} from '../../accounts/account.entity';
import {Neo4jService} from '../../neo4j/neo4j.service';
import {
  HaveBookRecordEntity,
  HaveBooksPayloadEntity,
} from '../entities/have-book.entities';

@Injectable()
export class HaveBooksService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async getHaveRecordsFromAccount(
    account: AccountEntity,
    {skip, limit}: {skip: number; limit: number},
  ): Promise<HaveBookRecordEntity[]> {
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

  async countHaveRecordFromAccount(
    account: AccountEntity,
    {skip, limit}: {skip: number; limit: number},
  ): Promise<{count: number; hasPrevious: boolean; hasNext: boolean}> {
    return this.neo4jService
      .read(
        `
        MATCH p=(:Account {id: $account.id})-[:HAS]->()
        WITH count(p) AS count
        RETURN count, 0 < count AND 0 < $skip AS previous, $skip + $limit < count AS next
        `,
        {account, skip, limit},
      )
      .then((result) => ({
        count: result.records[0].get('count').toNumber(),
        hasNext: result.records[0].get('next'),
        hasPrevious: result.records[0].get('previous'),
      }));
  }

  async unionResult(
    account: AccountEntity,
    {skip = 0, limit = 0}: {skip?: number; limit?: number},
  ): Promise<HaveBooksPayloadEntity> {
    return {
      ...(await this.countHaveRecordFromAccount(account, {skip, limit})),
      records: await this.getHaveRecordsFromAccount(account, {skip, limit}),
    };
  }

  async createHaveBookRecordEntity({
    bookId,
    accountId,
  }: {
    bookId: string;
    accountId: string;
  }): Promise<HaveBookRecordEntity> {
    return this.neo4jService
      .read(
        `
      MATCH (b:Book {id: $bookId})
      MERGE (a:Account {id: $accountId})
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

  async deleteHaveBookRecordEntity({
    bookId,
    accountId,
  }: {
    bookId: string;
    accountId: string;
  }): Promise<HaveBookRecordEntity> {
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
