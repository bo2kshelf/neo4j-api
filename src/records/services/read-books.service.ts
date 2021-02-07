import {Injectable} from '@nestjs/common';
import {int, types} from 'neo4j-driver';
import {AccountEntity} from '../../accounts/account.entity';
import {Neo4jService} from '../../neo4j/neo4j.service';
import {
  ReadBookRecordEntity,
  ReadBooksPayloadEntity,
} from '../entities/read-book.entities';

@Injectable()
export class ReadBooksService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async getReadBookRecordsFromAccount(
    account: AccountEntity,
    {skip, limit}: {skip: number; limit: number},
  ): Promise<ReadBookRecordEntity[]> {
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
          have: true,
          ...record.get('r').properties,
        })),
      );
  }

  async countReadBookRecordFromAccount(
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
        MATCH p=(:Account {id: $account.id})-[:READS]->()
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
  ): Promise<ReadBooksPayloadEntity> {
    return {
      ...(await this.countReadBookRecordFromAccount(account, {skip, limit})),
      records: await this.getReadBookRecordsFromAccount(account, {skip, limit}),
    };
  }

  async createReadBookRecord(
    {
      bookId,
      accountId,
    }: {
      bookId: string;
      accountId: string;
    },
    {date, ...props}: {date: string},
  ): Promise<ReadBookRecordEntity> {
    return this.neo4jService
      .read(
        `
      MATCH (b:Book {id: $bookId})
      MERGE (a:Account {id: $accountId})
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
}
