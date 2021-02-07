import {Injectable} from '@nestjs/common';
import {int} from 'neo4j-driver';
import {AccountEntity} from '../../accounts/account.entity';
import {Neo4jService} from '../../neo4j/neo4j.service';
import {
  StackedBooksPayloadEntity,
  StackedRecordEntity,
} from '../entities/stacked-book.entities';

@Injectable()
export class StackedBooksService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async getStackedBookRecordsFromAccount(
    account: AccountEntity,
    {skip, limit}: {skip: number; limit: number},
  ): Promise<StackedRecordEntity[]> {
    return this.neo4jService
      .read(
        `
        MATCH (a:Account {id: $account.id})
        MATCH p = (a)-[:HAS]->(b)
        WHERE NOT EXISTS ((a)-[:READS]->(b))
        RETURN a,b
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
        })),
      );
  }

  async countStackedBookRecordsFromAccount(
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
        MATCH (a:Account {id: $account.id})
        MATCH p = (a)-[:HAS]->(b)
        WHERE NOT EXISTS ((a)-[:READS]->(b))
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
  ): Promise<StackedBooksPayloadEntity> {
    return {
      ...(await this.countStackedBookRecordsFromAccount(account, {
        skip,
        limit,
      })),
      records: await this.getStackedBookRecordsFromAccount(account, {
        skip,
        limit,
      }),
    };
  }
}
