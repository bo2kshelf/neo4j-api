import {Injectable} from '@nestjs/common';
import {int} from 'neo4j-driver';
import {OrderBy} from '../../common/order-by.enum';
import {Neo4jService} from '../../neo4j/neo4j.service';
import {HaveBookRecordEntity} from '../entities/have-book-record.entity';
import {ReadBookRecordEntity} from '../entities/read-book-record.entity';
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

  async getReadBooks(
    userId: string,
    {
      skip,
      limit,
      orderBy,
    }: {skip: number; limit: number; orderBy: {date: OrderBy; title: OrderBy}},
  ): Promise<{
    count: number;
    hasNext: boolean;
    hasPrevious: boolean;
    records: ReadBookRecordEntity[];
  }> {
    const records: ReadBookRecordEntity[] = await this.neo4jService
      .read(
        `
        MATCH (u:User {id: $userId})
        CALL {
            MATCH (u)-[r:READ_BOOK]->(b:Book)
            WHERE r.readAt IS NOT NULL
            WITH r,b,head(reverse(apoc.coll.sort(r.readAt))) AS latest
            RETURN r,b
            ORDER BY latest ${orderBy.date}, b.title ${orderBy.title}
            UNION
            MATCH (u)-[r:READ_BOOK]->(b:Book)
            WHERE r.readAt IS NULL
            RETURN r,b
            ORDER BY b.title ${orderBy.title}
        }
        RETURN u.id AS u, b.id AS b, r.readAt AS readAt, toString(head(reverse(apoc.coll.sort(r.readAt)))) AS latest
        SKIP $skip LIMIT $limit
      `,
        {userId, skip: int(skip), limit: int(limit)},
      )
      .then((result) =>
        result.records.map((record) => ({
          userId: record.get('u'),
          bookId: record.get('b'),
          readAt: record.get('readAt'),
          latestReadAt: record.get('latest'),
        })),
      );
    const meta: {
      count: number;
      hasNext: boolean;
      hasPrevious: boolean;
    } = await this.neo4jService
      .read(
        `
        MATCH p=(:User {id: $userId})-[:READ_BOOK]->(:Book)
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
    return {records, ...meta};
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
    records: HaveBookRecordEntity[];
  }> {
    const records: HaveBookRecordEntity[] = await this.neo4jService
      .read(
        `
        MATCH (u:User {id: $userId})
        MATCH (u)-[r:HAS_BOOK]->(b:Book)
        WHERE r.have = true
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
    return {records, ...meta};
  }

  async getReadingBooks(
    userId: string,
    {
      skip,
      limit,
      orderBy,
    }: {skip: number; limit: number; orderBy: {updatedAt: OrderBy}},
  ): Promise<{
    records: ReadingBookRecordEntity[];
    count: number;
    hasNext: boolean;
    hasPrevious: boolean;
  }> {
    const records: ReadingBookRecordEntity[] = await this.neo4jService
      .read(
        `
        MATCH (u:User {id: $userId})
        MATCH (u)-[r:IS_READING_BOOK]->(b:Book)
        WHERE r.reading = true
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
    return {records, ...meta};
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
    records: WishReadBookRecordEntity[];
  }> {
    const records: WishReadBookRecordEntity[] = await this.neo4jService
      .read(
        `
        MATCH (u:User {id: $userId})
        MATCH (u)-[r:WISHES_TO_READ_BOOK]->(b:Book)
        WHERE r.wish = true
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
    return {records, ...meta};
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
    records: StackedBookRecordEntity[];
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
    return {records, ...meta};
  }

  async readBook(
    {bookId, userId}: {bookId: string; userId: string},
    props: {readAt?: string},
  ): Promise<ReadBookRecordEntity> {
    return this.neo4jService
      .read(
        `
        MATCH (b:Book {id: $bookId})
        MERGE (u:User {id: $userId})-[r:READ_BOOK]->(b)
        SET r.readAt = coalesce(r.readAt, []) + coalesce($props.readAt, [])
        WITH u.id AS u, b.id AS b, reverse(apoc.coll.sort(r.readAt)) AS readAt
        RETURN u,b,readAt,toString(head(readAt)) AS latest
      `,
        {userId, bookId, props},
      )
      .then((result) => ({
        userId: result.records[0].get('u'),
        bookId: result.records[0].get('b'),
        readAt: result.records[0].get('readAt'),
        latestReadAt: result.records[0].get('latest'),
      }));
  }

  async setHaveBook(
    {bookId, userId}: {bookId: string; userId: string},
    {have}: {have: boolean},
  ): Promise<HaveBookRecordEntity> {
    return this.neo4jService
      .read(
        `
        MATCH (b:Book {id: $bookId})
        MERGE (u:User {id: $userId})
        MERGE (u)-[r:HAS_BOOK]->(b)
        SET r=$props SET r.updatedAt = datetime.realtime()
        RETURN u.id AS u, b.id AS b, r.have AS have, r.updatedAt AS updatedAt
        `,
        {userId, bookId, props: {have}},
      )
      .then((result) => ({
        userId: result.records[0].get('u'),
        bookId: result.records[0].get('b'),
        have: result.records[0].get('have'),
        updatedAt: new Date(result.records[0].get('updatedAt')),
      }));
  }

  async setReadingBook(
    {bookId, userId}: {bookId: string; userId: string},
    {reading}: {reading: boolean},
  ): Promise<ReadingBookRecordEntity> {
    return this.neo4jService
      .read(
        `
        MATCH (b:Book {id: $bookId})
        MERGE (u:User {id: $userId})
        MERGE (u)-[r:IS_READING_BOOK]->(b)
        SET r=$props SET r.updatedAt = datetime.realtime()
        RETURN u.id AS u, b.id AS b, r.reading AS reading, r.updatedAt AS updatedAt
        `,
        {userId, bookId, props: {reading}},
      )
      .then((result) => ({
        userId: result.records[0].get('u'),
        bookId: result.records[0].get('b'),
        reading: result.records[0].get('reading'),
        updatedAt: new Date(result.records[0].get('updatedAt')),
      }));
  }

  async setWishReadBook(
    {bookId, userId}: {bookId: string; userId: string},
    {wish}: {wish: boolean},
  ): Promise<WishReadBookRecordEntity> {
    return this.neo4jService
      .read(
        `
        MATCH (b:Book {id: $bookId})
        MERGE (u:User {id: $userId})
        MERGE (u)-[r:WISHES_TO_READ_BOOK]->(b)
        SET r=$props SET r.updatedAt = datetime.realtime()
        RETURN u.id AS u, b.id AS b, r.wish AS wish, r.updatedAt AS updatedAt
        `,
        {userId, bookId, props: {wish}},
      )
      .then((result) => ({
        userId: result.records[0].get('u'),
        bookId: result.records[0].get('b'),
        wish: result.records[0].get('wish'),
        updatedAt: new Date(result.records[0].get('updatedAt')),
      }));
  }
}
