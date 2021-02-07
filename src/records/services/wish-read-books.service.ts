import {Injectable} from '@nestjs/common';
import {int} from 'neo4j-driver';
import {AccountEntity} from '../../accounts/account.entity';
import {Neo4jService} from '../../neo4j/neo4j.service';
import {
  WishReadBookRecordEntity,
  WishReadBooksPayloadEntity,
} from '../entities/wish-read-book.entities';

@Injectable()
export class WishReadBooksService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async getWishBookRecordsFromAccount(
    account: AccountEntity,
    {skip, limit}: {skip: number; limit: number},
  ): Promise<WishReadBookRecordEntity[]> {
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
          have: true,
          ...record.get('r').properties,
        })),
      );
  }

  async countWishBookRecordsFromAccount(
    account: AccountEntity,
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
        MATCH p=(:Account {id: $account.id})-[:WANTS_TO_READ]->()
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
    account: AccountEntity,
    {skip = 0, limit = 0}: {skip?: number; limit?: number},
  ): Promise<WishReadBooksPayloadEntity> {
    return {
      ...(await this.countWishBookRecordsFromAccount(account, {skip, limit})),
      records: await this.getWishBookRecordsFromAccount(account, {skip, limit}),
    };
  }

  async createWishReadBookRecord({
    bookId,
    accountId,
  }: {
    bookId: string;
    accountId: string;
  }): Promise<WishReadBookRecordEntity> {
    return this.neo4jService
      .read(
        `
      MATCH (b:Book {id: $bookId})
      MERGE (a:Account {id: $accountId})
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

  async deleteWishReadBookRecord({
    bookId,
    accountId,
  }: {
    bookId: string;
    accountId: string;
  }): Promise<WishReadBookRecordEntity> {
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
}
