import {Injectable} from '@nestjs/common';
import {int} from 'neo4j-driver';
import {OrderBy} from '../../common/order-by.enum';
import {Neo4jService} from '../../neo4j/neo4j.service';
import {HaveBookRecordEntity} from '../entities/have-book-record.entity';
import {ReadingBookRecordEntity} from '../entities/reading-book-record.entity';
import {StackedBookRecordEntity} from '../entities/stacked-book-record.entity';
import {UserEntity} from '../entities/users.entity';
import {WishReadBookRecordEntity} from '../entities/wish-read-book-record.entity';

@Injectable()
export class UsersService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async findById(id: string): Promise<UserEntity> {
    const result = await this.neo4jService.read(
      `MATCH (n:User {id: $id}) RETURN n`,
      {id},
    );
    if (result.records.length === 0) throw new Error('Not Found');
    return result.records[0].get(0).properties;
  }

  async getHaveBooks(
    userId: string,
    {
      skip,
      limit,
      orderBy,
    }: {skip: number; limit: number; orderBy: {updatedAt: OrderBy}},
  ): Promise<{
    count: number;
    hasNext: boolean;
    hasPrevious: boolean;
    nodes: HaveBookRecordEntity[];
  }> {
    const records: HaveBookRecordEntity[] = await this.neo4jService
      .read(
        `
        MATCH (u:User {id: $userId})
        MATCH (u)-[r:HAS_BOOK]->(b:Book)
        RETURN u.id AS u, b.id AS b, r.updatedAt AS updatedAt
        ORDER BY r.updatedAt ${orderBy.updatedAt}
        SKIP $skip LIMIT $limit
        `,
        {userId, skip: int(skip), limit: int(limit)},
      )
      .then((result) =>
        result.records.map((record) => ({
          have: true,
          userId: record.get('u'),
          bookId: record.get('b'),
          updatedAt: new Date(record.get('updatedAt')),
        })),
      );
    const meta: {
      count: number;
      hasNext: boolean;
      hasPrevious: boolean;
    } = await this.neo4jService
      .read(
        `
        MATCH p=(:User {id: $userId})-[r:HAS_BOOK]->()
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
    return {nodes: records, ...meta};
  }

  async getReadingBooks(
    userId: string,
    {
      skip,
      limit,
      orderBy,
    }: {skip: number; limit: number; orderBy: {updatedAt: OrderBy}},
  ): Promise<{
    nodes: ReadingBookRecordEntity[];
    count: number;
    hasNext: boolean;
    hasPrevious: boolean;
  }> {
    const records: ReadingBookRecordEntity[] = await this.neo4jService
      .read(
        `
        MATCH (u:User {id: $userId})
        MATCH (u)-[r:IS_READING_BOOK]->(b:Book)
        RETURN u.id AS u, b.id AS b, r.updatedAt AS updatedAt
        ORDER BY r.updatedAt ${orderBy.updatedAt}
        SKIP $skip LIMIT $limit
        `,
        {userId, skip: int(skip), limit: int(limit)},
      )
      .then((result) =>
        result.records.map((record) => ({
          reading: true,
          userId: record.get('u'),
          bookId: record.get('b'),
          updatedAt: new Date(record.get('updatedAt')),
        })),
      );
    const meta: {
      count: number;
      hasNext: boolean;
      hasPrevious: boolean;
    } = await this.neo4jService
      .read(
        `
        MATCH p=(:User {id: $userId})-[r:IS_READING_BOOK]->()
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
    return {nodes: records, ...meta};
  }

  async getWishesToReadBook(
    userId: string,
    {
      skip,
      limit,
      orderBy,
    }: {skip: number; limit: number; orderBy: {updatedAt: OrderBy}},
  ): Promise<{
    count: number;
    hasNext: boolean;
    hasPrevious: boolean;
    nodes: WishReadBookRecordEntity[];
  }> {
    const records: WishReadBookRecordEntity[] = await this.neo4jService
      .read(
        `
        MATCH (u:User {id: $userId})
        MATCH (u)-[r:WISHES_TO_READ_BOOK]->(b:Book)
        RETURN u.id AS u, b.id AS b, r.updatedAt AS updatedAt
        ORDER BY r.updatedAt ${orderBy.updatedAt}
        SKIP $skip LIMIT $limit
        `,
        {userId, skip: int(skip), limit: int(limit)},
      )
      .then((result) =>
        result.records.map((record) => ({
          wish: true,
          userId: record.get('u'),
          bookId: record.get('b'),
          updatedAt: new Date(record.get('updatedAt')),
        })),
      );
    const meta: {
      count: number;
      hasNext: boolean;
      hasPrevious: boolean;
    } = await this.neo4jService
      .read(
        `
        MATCH p=(:User {id: $userId})-[r:WISHES_TO_READ_BOOK]->()
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
    return {nodes: records, ...meta};
  }

  async getStackedBooks(
    userId: string,
    {
      skip,
      limit,
      orderBy,
    }: {skip: number; limit: number; orderBy: {updatedAt: OrderBy}},
  ): Promise<{
    count: number;
    hasNext: boolean;
    hasPrevious: boolean;
    nodes: StackedBookRecordEntity[];
  }> {
    const records: StackedBookRecordEntity[] = await this.neo4jService
      .read(
        `
        MATCH (u:User {id: $userId})
        MATCH p = (u)-[r:HAS_BOOK]->(b)
        WHERE NOT EXISTS ((u)-[:READ_BOOK]->(b))
        RETURN u,b
        ORDER BY r.updatedAt ${orderBy.updatedAt}
        SKIP $skip LIMIT $limit
        `,
        {userId, skip: int(skip), limit: int(limit)},
      )
      .then((result) =>
        result.records.map((record) => ({
          userId: record.get('u').properties.id,
          bookId: record.get('b').properties.id,
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
    return {nodes: records, ...meta};
  }

  async setHaveBook(
    {bookId, userId}: {bookId: string; userId: string},
    {have}: {have: boolean},
  ): Promise<HaveBookRecordEntity> {
    return have
      ? this.neo4jService
          .read(
            `
            MATCH (b:Book {id: $bookId})
            MERGE (u:User {id: $userId})
            MERGE (u)-[r:HAS_BOOK]->(b)
            SET r.updatedAt = datetime.realtime()
            RETURN u.id AS u, b.id AS b, r.updatedAt AS updatedAt
            `,
            {userId, bookId},
          )
          .then((result) => ({
            userId: result.records[0].get('u'),
            bookId: result.records[0].get('b'),
            have: true,
            updatedAt: new Date(result.records[0].get('updatedAt')),
          }))
      : this.neo4jService
          .read(
            `
            MERGE (u:User {id: $userId}) WITH u
            MATCH (b:Book {id: $bookId})
            OPTIONAL MATCH (u)-[r:HAS_BOOK]->(b) DELETE r
            RETURN u.id AS u, b.id AS b, datetime.realtime() AS updatedAt
            `,
            {userId, bookId},
          )
          .then((result) => ({
            userId: result.records[0].get('u'),
            bookId: result.records[0].get('b'),
            have: false,
            updatedAt: new Date(result.records[0].get('updatedAt')),
          }));
  }

  async setReadingBook(
    {bookId, userId}: {bookId: string; userId: string},
    {reading}: {reading: boolean},
  ): Promise<ReadingBookRecordEntity> {
    return reading
      ? this.neo4jService
          .read(
            `
            MATCH (b:Book {id: $bookId})
            MERGE (u:User {id: $userId})
            MERGE (u)-[r:IS_READING_BOOK]->(b)
            SET r.updatedAt = datetime.realtime()
            RETURN u.id AS u, b.id AS b, r.reading AS reading, r.updatedAt AS updatedAt
            `,
            {userId, bookId},
          )
          .then((result) => ({
            userId: result.records[0].get('u'),
            bookId: result.records[0].get('b'),
            reading: true,
            updatedAt: new Date(result.records[0].get('updatedAt')),
          }))
      : this.neo4jService
          .read(
            `
            MERGE (u:User {id: $userId}) WITH u
            MATCH (b:Book {id: $bookId})
            OPTIONAL MATCH (u)-[r:IS_READING_BOOK]->(b) DELETE r
            RETURN u.id AS u, b.id AS b, datetime.realtime() AS updatedAt
            `,
            {userId, bookId},
          )
          .then((result) => ({
            userId: result.records[0].get('u'),
            bookId: result.records[0].get('b'),
            reading: false,
            updatedAt: new Date(result.records[0].get('updatedAt')),
          }));
  }

  async setWishReadBook(
    {bookId, userId}: {bookId: string; userId: string},
    {wish}: {wish: boolean},
  ): Promise<WishReadBookRecordEntity> {
    return wish
      ? this.neo4jService
          .read(
            `
            MATCH (b:Book {id: $bookId})
            MERGE (u:User {id: $userId})
            MERGE (u)-[r:WISHES_TO_READ_BOOK]->(b)
            SET r.updatedAt = datetime.realtime()
            RETURN u.id AS u, b.id AS b, r.reading AS reading, r.updatedAt AS updatedAt
            `,
            {userId, bookId},
          )
          .then((result) => ({
            userId: result.records[0].get('u'),
            bookId: result.records[0].get('b'),
            wish: true,
            updatedAt: new Date(result.records[0].get('updatedAt')),
          }))
      : this.neo4jService
          .read(
            `
            MERGE (u:User {id: $userId}) WITH u
            MATCH (b:Book {id: $bookId})
            OPTIONAL MATCH (u)-[r:WISHES_TO_READ_BOOK]->(b) DELETE r
            RETURN u.id AS u, b.id AS b, datetime.realtime() AS updatedAt
            `,
            {userId, bookId},
          )
          .then((result) => ({
            userId: result.records[0].get('u'),
            bookId: result.records[0].get('b'),
            wish: false,
            updatedAt: new Date(result.records[0].get('updatedAt')),
          }));
  }
}
