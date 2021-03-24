import {Injectable} from '@nestjs/common';
import {int, types} from 'neo4j-driver';
import {OrderBy} from '../../common/order-by.enum';
import {Neo4jService} from '../../neo4j/neo4j.service';
import {UserEntity} from '../../users/users.entity';
import {
  ReadBookRecordEntity,
  ReadBooksPayloadEntity,
} from '../entities/read-book.entities';

@Injectable()
export class ReadBooksService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async getReadBookRecordsFromUser(
    user: UserEntity,
    {
      skip,
      limit,
      orderBy,
    }: {
      skip: number;
      limit: number;
      orderBy: {date?: OrderBy};
    },
  ): Promise<ReadBookRecordEntity[]> {
    return this.neo4jService
      .read(
        `
        MATCH (u:User {id: $user.id})
        MATCH (u)-[r:READS]->(b:Book)
        RETURN *
        ORDER BY r.date ${orderBy.date || OrderBy.DESC}
        SKIP $skip LIMIT $limit
        `,
        {
          user,
          skip: int(skip),
          limit: int(limit),
        },
      )
      .then((result) =>
        result.records.map((record) => ({
          user: record.get('u').properties,
          book: record.get('b').properties,
          have: true,
          ...record.get('r').properties,
        })),
      );
  }

  async countReadBookRecordFromUser(
    user: UserEntity,
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
        MATCH p=(:User {id: $user.id})-[:READS]->()
        WITH count(p) AS count
        RETURN count, 0 < count AND 0 < $skip AS previous, $skip + $limit < count AS next
        `,
        {user, skip, limit},
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
    user: UserEntity,
    {
      skip = 0,
      limit = 0,
      orderBy = {},
    }: {skip?: number; limit?: number; orderBy?: {date?: OrderBy}},
  ): Promise<ReadBooksPayloadEntity> {
    return {
      ...(await this.countReadBookRecordFromUser(user, {skip, limit})),
      records: await this.getReadBookRecordsFromUser(user, {
        skip,
        limit,
        orderBy,
      }),
    };
  }

  async createReadBookRecord(
    {
      bookId,
      userId,
    }: {
      bookId: string;
      userId: string;
    },
    {date, ...props}: {date: string},
  ): Promise<ReadBookRecordEntity> {
    return this.neo4jService
      .read(
        `
      MATCH (b:Book {id: $bookId})
      MERGE (u:User {id: $userId})
      MERGE (u)-[r:READS {date: $props.date}]->(b)
      SET r = $props
      RETURN *
      `,
        {
          userId,
          bookId,
          props: {date: types.Date.fromStandardDate(new Date(date))},
        },
      )
      .then((result) => ({
        ...result.records[0].get('r').properties,
        user: result.records[0].get('u').properties,
        book: result.records[0].get('b').properties,
        date,
      }));
  }
}
