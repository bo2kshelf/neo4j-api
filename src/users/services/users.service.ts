import {Injectable} from '@nestjs/common';
import {int} from 'neo4j-driver';
import {Neo4jService} from '../../neo4j/neo4j.service';
import {
  HaveBooksPayloadEntity,
  ReadBooksPayloadEntity,
  ReadingBooksPayloadEntity,
  StackedBooksPayloadEntity,
  WishReadBooksPayloadEntity,
} from '../entities/payload.entities';
import {
  HaveBookRecordEntity,
  ReadBookRecordEntity,
  ReadingBookRecordEntity,
  StackedBookRecordEntity,
  WishReadBookRecordEntity,
} from '../entities/record.entities';
import {UserEntity} from '../entities/users.entity';

@Injectable()
export class UsersService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async findById(id: string): Promise<UserEntity> {
    return this.neo4jService
      .read(`MATCH (n:User {id: $id}) RETURN n`, {id})
      .then((res) => res.records[0].get(0).properties);
  }

  async readBook({
    bookId,
    userId,
    date,
  }: {
    bookId: string;
    userId: string;
    date?: string;
  }): Promise<ReadBookRecordEntity> {
    return this.neo4jService
      .read(
        `
        MATCH (b:Book {id: $bookId})
        MERGE (u:User {id: $userId})
        MERGE (u)-[r:READS]->(b)
        RETURN *
      `,
        {userId, bookId},
      )
      .then((result) => ({
        have: true,
        user: result.records[0].get('u').properties,
        book: result.records[0].get('b').properties,
        ...result.records[0].get('r').properties,
      }));
  }

  async getReadBooks(
    userId: string,
    {skip, limit}: {skip: number; limit: number},
  ): Promise<ReadBooksPayloadEntity> {
    const records: ReadBookRecordEntity[] = await this.neo4jService
      .read(
        `
      MATCH (u:User {id: $userId})
      MATCH (u)-[r:READ_BOOK]->(b:Book)
      RETURN *
      SKIP $skip LIMIT $limit
      `,
        {userId, skip: int(skip), limit: int(limit)},
      )
      .then((result) =>
        result.records.map((record) => ({
          user: record.get('u').properties,
          book: record.get('b').properties,
          ...record.get('r').properties,
        })),
      );
    const meta: {
      count: number;
      hasNext: boolean;
      hasPrevious: boolean;
    } = await this.neo4jService
      .read(
        `
        MATCH p=(:User {id: $userId})-[:READ_BOOK]->()
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
    return {records, skip, limit, ...meta};
  }

  async hasBook({
    bookId,
    userId,
    have,
  }: {
    bookId: string;
    userId: string;
    have: boolean;
  }): Promise<HaveBookRecordEntity> {
    return this.neo4jService
      .read(
        `
        MATCH (b:Book {id: $bookId})
        MERGE (u:User {id: $userId})
        MERGE (u)-[r:HAS_BOOK {have: $have}]->(b)
        RETURN *
        `,
        {userId, bookId, have},
      )
      .then((result) => ({
        have,
        user: result.records[0].get('u').properties,
        book: result.records[0].get('b').properties,
        ...result.records[0].get('r').properties,
      }));
  }

  async getHaveBooks(
    userId: string,
    {skip, limit}: {skip: number; limit: number},
  ): Promise<HaveBooksPayloadEntity> {
    const records: HaveBookRecordEntity[] = await this.neo4jService
      .read(
        `
        MATCH (u:User {id: $userId})
        MATCH (u)-[r:HAS_BOOK]->(b:Book)
        RETURN *
        SKIP $skip LIMIT $limit
        `,
        {userId, skip: int(skip), limit: int(limit)},
      )
      .then((result) =>
        result.records.map((record) => ({
          user: record.get('u').properties,
          book: record.get('b').properties,
          ...record.get('r').properties,
        })),
      );
    const meta: {
      count: number;
      hasNext: boolean;
      hasPrevious: boolean;
    } = await this.neo4jService
      .read(
        `
        MATCH p=(:User {id: $userId})-[:HAS_BOOK]->()
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
    return {records, skip, limit, ...meta};
  }

  async isReadingBook({
    bookId,
    userId,
    reading,
  }: {
    bookId: string;
    userId: string;
    reading: boolean;
  }): Promise<ReadingBookRecordEntity> {
    return this.neo4jService
      .read(
        `
        MATCH (b:Book {id: $bookId})
        MERGE (u:User {id: $userId})
        MERGE (u)-[r:IS_READING_BOOK {reading: $reading}]->(b)
        RETURN *
        `,
        {userId, bookId, reading},
      )
      .then((result) => ({
        have: reading,
        user: result.records[0].get('u').properties,
        book: result.records[0].get('b').properties,
        ...result.records[0].get('r').properties,
      }));
  }

  async getReadingBooks(
    userId: string,
    {skip, limit}: {skip: number; limit: number},
  ): Promise<ReadingBooksPayloadEntity> {
    const records: ReadingBookRecordEntity[] = await this.neo4jService
      .read(
        `
        MATCH (u:User {id: $userId})
        MATCH (u)-[r:IS_READING_BOOK]->(b:Book)
        RETURN *
        SKIP $skip LIMIT $limit
        `,
        {userId, skip: int(skip), limit: int(limit)},
      )
      .then((result) =>
        result.records.map((record) => ({
          user: record.get('u').properties,
          book: record.get('b').properties,
          ...record.get('r').properties,
        })),
      );
    const meta: {
      count: number;
      hasNext: boolean;
      hasPrevious: boolean;
    } = await this.neo4jService
      .read(
        `
        MATCH p=(:User {id: $userId})-[:IS_READING_BOOK]->()
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
    return {records, skip, limit, ...meta};
  }

  async wishesToReadBook({
    bookId,
    userId,
    wish,
  }: {
    bookId: string;
    userId: string;
    wish: boolean;
  }): Promise<WishReadBookRecordEntity> {
    return this.neo4jService
      .read(
        `
        MATCH (b:Book {id: $bookId})
        MERGE (u:User {id: $userId})
        MERGE (u)-[r:WISHES_TO_READ_BOOK {wish: $wish}]->(b)
        RETURN *
        `,
        {userId, bookId, wish},
      )
      .then((result) => ({
        have: wish,
        user: result.records[0].get('u').properties,
        book: result.records[0].get('b').properties,
        ...result.records[0].get('r').properties,
      }));
  }

  async getWishesToReadBook(
    userId: string,
    {skip, limit}: {skip: number; limit: number},
  ): Promise<WishReadBooksPayloadEntity> {
    const records: WishReadBookRecordEntity[] = await this.neo4jService
      .read(
        `
        MATCH (u:User {id: $userId})
        MATCH (u)-[r:WISHES_TO_READ_BOOK]->(b:Book)
        RETURN *
        SKIP $skip LIMIT $limit
        `,
        {userId, skip: int(skip), limit: int(limit)},
      )
      .then((result) =>
        result.records.map((record) => ({
          user: record.get('u').properties,
          book: record.get('b').properties,
          ...record.get('r').properties,
        })),
      );
    const meta: {
      count: number;
      hasNext: boolean;
      hasPrevious: boolean;
    } = await this.neo4jService
      .read(
        `
        MATCH p=(:User {id: $userId})-[:WISHES_TO_READ_BOOK]->()
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
    return {records, skip, limit, ...meta};
  }

  async getStackedBooks(
    userId: string,
    {skip, limit}: {skip: number; limit: number},
  ): Promise<StackedBooksPayloadEntity> {
    const records: StackedBookRecordEntity[] = await this.neo4jService
      .read(
        `
        MATCH (u:User {id: $userId})
        MATCH p = (u)-[:HAS_BOOK]->(b)
        WHERE NOT EXISTS ((u)-[:READ_BOOK]->(b))
        RETURN u,b
        SKIP $skip LIMIT $limit
        `,
        {userId, skip: int(skip), limit: int(limit)},
      )
      .then((result) =>
        result.records.map((record) => ({
          user: record.get('u').properties,
          book: record.get('b').properties,
        })),
      );
    const meta: {
      count: number;
      hasNext: boolean;
      hasPrevious: boolean;
    } = await this.neo4jService
      .read(
        `
        MATCH (u:User {id: $userId})
        MATCH p = (u)-[:HAS_BOOK]->(b)
        WHERE NOT EXISTS ((u)-[:READ_BOOK]->(b))
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
    return {records, skip, limit, ...meta};
  }
}
