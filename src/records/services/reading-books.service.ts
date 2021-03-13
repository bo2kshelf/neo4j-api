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

  async getReadingBookRecordsFromUser(
    user: UserEntity,
    {skip, limit}: {skip: number; limit: number},
  ): Promise<ReadingBookRecordEntity[]> {
    return this.neo4jService
      .read(
        `
        MATCH (u:User {id: $user.id})
        MATCH (u)-[r:READING]->(b:Book)
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

  async countReadingBookRecordsFromUser(
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
        MATCH p=(:User {id: $user.id})-[:READING]->()
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
  ): Promise<ReadingBooksPayloadEntity> {
    return {
      ...(await this.countReadingBookRecordsFromUser(user, {
        skip,
        limit,
      })),
      records: await this.getReadingBookRecordsFromUser(user, {
        skip,
        limit,
      }),
    };
  }

  async createReadingBookRecord({
    bookId,
    userId,
  }: {
    bookId: string;
    userId: string;
  }): Promise<ReadingBookRecordEntity> {
    return this.neo4jService
      .read(
        `
      MATCH (b:Book {id: $bookId})
      MERGE (u:User {id: $userId})
      MERGE (u)-[r:READING]->(b)
      RETURN *
      `,
        {userId, bookId},
      )
      .then((result) => ({
        user: result.records[0].get('u').properties,
        book: result.records[0].get('b').properties,
        reading: true,
        ...result.records[0].get('r').properties,
      }));
  }

  async deleteReadingBookRecord({
    bookId,
    userId,
  }: {
    bookId: string;
    userId: string;
  }): Promise<ReadingBookRecordEntity> {
    return this.neo4jService
      .read(
        `
      MATCH (u:User {id: $userId})
      MATCH (b:Book {id: $bookId})
      OPTIONAL MATCH (u)-[r:READING]->(b)
      DELETE r
      RETURN *
      `,
        {userId, bookId},
      )
      .then((result) => ({
        user: result.records[0].get('u').properties,
        book: result.records[0].get('b').properties,
        reading: false,
      }));
  }
}
