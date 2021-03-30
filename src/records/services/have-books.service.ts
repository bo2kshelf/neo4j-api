import {Injectable} from '@nestjs/common';
import {int} from 'neo4j-driver';
import {Neo4jService} from '../../neo4j/neo4j.service';
import {UserEntity} from '../../users/entities/users.entity';
import {
  HaveBookRecordEntity,
  HaveBooksPayloadEntity,
} from '../entities/have-book.entities';

@Injectable()
export class HaveBooksService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async getHaveRecordsFromUser(
    user: UserEntity,
    {skip, limit}: {skip: number; limit: number},
  ): Promise<HaveBookRecordEntity[]> {
    return this.neo4jService
      .read(
        `
        MATCH (u:User {id: $user.id})
        MATCH (u)-[r:HAS]->(b:Book)
        RETURN *
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

  async countHaveRecordFromUser(
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
        MATCH p=(:User {id: $user.id})-[:HAS]->()
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
    {skip = 0, limit = 0}: {skip?: number; limit?: number},
  ): Promise<HaveBooksPayloadEntity> {
    return {
      ...(await this.countHaveRecordFromUser(user, {skip, limit})),
      records: await this.getHaveRecordsFromUser(user, {skip, limit}),
    };
  }

  async createHaveBookRecordEntity({
    bookId,
    userId,
  }: {
    bookId: string;
    userId: string;
  }): Promise<HaveBookRecordEntity> {
    return this.neo4jService
      .read(
        `
      MATCH (b:Book {id: $bookId})
      MERGE (u:User {id: $userId})
      MERGE (u)-[r:HAS]->(b)
      RETURN *
      `,
        {userId, bookId},
      )
      .then((result) => ({
        user: result.records[0].get('u').properties,
        book: result.records[0].get('b').properties,
        have: true,
        ...result.records[0].get('r').properties,
      }));
  }

  async deleteHaveBookRecordEntity({
    bookId,
    userId,
  }: {
    bookId: string;
    userId: string;
  }): Promise<HaveBookRecordEntity> {
    return this.neo4jService
      .read(
        `
      MATCH (u:User {id: $userId})
      MATCH (b:Book {id: $bookId})
      OPTIONAL MATCH (u)-[r:HAS]->(b)
      DELETE r
      RETURN *
      `,
        {userId, bookId},
      )
      .then((result) => ({
        user: result.records[0].get('u').properties,
        book: result.records[0].get('b').properties,
        have: false,
      }));
  }
}
