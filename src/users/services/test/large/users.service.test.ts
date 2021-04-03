import {INestApplication} from '@nestjs/common';
import {Test} from '@nestjs/testing';
import {IDService} from '../../../../common/id/id.service';
import {OrderBy} from '../../../../common/order-by.enum';
import {Neo4jTestModule} from '../../../../neo4j/neo4j-test.module';
import {Neo4jService} from '../../../../neo4j/neo4j.service';
import {UsersService} from '../../users.service';

describe(UsersService.name, () => {
  let app: INestApplication;

  let neo4jService: Neo4jService;

  let usersService: UsersService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [Neo4jTestModule],
      providers: [IDService, UsersService],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    neo4jService = module.get<Neo4jService>(Neo4jService);

    usersService = module.get<UsersService>(UsersService);
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    await neo4jService.write(`MATCH (n) DETACH DELETE n`);
  });

  afterAll(async () => {
    await app.close();
  });

  it('to be defined', () => {
    expect(usersService).toBeDefined();
  });

  describe('findById()', () => {
    const expected = {id: '1'};

    beforeEach(async () => {
      await neo4jService.write(`CREATE (p:User) SET p=$expected RETURN p`, {
        expected,
      });
    });

    it('存在しないIDについて取得しようとすると例外を投げる', async () => {
      await expect(() => usersService.findById('2')).rejects.toThrow(
        /Not Found/,
      );
    });

    it('指定したIDが存在するなら取得できる', async () => {
      const actual = await usersService.findById(expected.id);

      expect(actual.id).toBe(expected.id);
    });
  });

  describe('getReadBooks()', () => {
    describe('一般的な状態', () => {
      const expectedUser = {id: 'user1'};
      const expectedBooks = [
        {id: 'book1', title: 'A'},
        {id: 'book2', title: 'B'},
        {id: 'book3', title: 'C'},
      ];
      const expectedReads = [
        {
          bookId: expectedBooks[0].id,
          userId: expectedUser.id,
          readAt: '2000-01-01',
        },
        {
          bookId: expectedBooks[1].id,
          userId: expectedUser.id,
          readAt: '2000-01-02',
        },
        {
          bookId: expectedBooks[2].id,
          userId: expectedUser.id,
          readAt: '2000-01-03',
        },
      ];

      beforeEach(async () => {
        await neo4jService.write(`CREATE (n:User) SET n=$expected RETURN *`, {
          expected: expectedUser,
        });
        await Promise.all(
          expectedBooks.map((expectedBook) =>
            neo4jService.write(`CREATE (n:Book) SET n=$expected RETURN *`, {
              expected: expectedBook,
            }),
          ),
        );
        await Promise.all(
          expectedReads.map(({bookId, userId, readAt}) =>
            neo4jService.write(
              `
              MATCH (b:Book {id: $bookId}),(u:User {id: $userId})
              CREATE (u)-[r:READ_BOOK {readAt: [date($readAt)]}]->(b)
              RETURN *
              `,
              {bookId, userId, readAt},
            ),
          ),
        );
      });

      it.each([
        [
          {skip: 0, limit: 0, orderBy: {date: OrderBy.ASC, title: OrderBy.ASC}},
          {
            records: [],
            hasPrevious: false,
            hasNext: true,
            count: expectedReads.length,
          },
        ],
        [
          {skip: 0, limit: 3, orderBy: {date: OrderBy.ASC, title: OrderBy.ASC}},
          {
            records: [
              {
                userId: expectedReads[0].userId,
                bookId: expectedReads[0].bookId,
                readAt: [expectedReads[0].readAt],
                latestReadAt: expectedReads[0].readAt,
              },
              {
                userId: expectedReads[1].userId,
                bookId: expectedReads[1].bookId,
                readAt: [expectedReads[1].readAt],
                latestReadAt: expectedReads[1].readAt,
              },
              {
                userId: expectedReads[2].userId,
                bookId: expectedReads[2].bookId,
                readAt: [expectedReads[2].readAt],
                latestReadAt: expectedReads[2].readAt,
              },
            ],
            hasPrevious: false,
            hasNext: false,
            count: expectedReads.length,
          },
        ],
        [
          {skip: 0, limit: 6, orderBy: {date: OrderBy.ASC, title: OrderBy.ASC}},
          {
            records: [
              {
                userId: expectedReads[0].userId,
                bookId: expectedReads[0].bookId,
                readAt: [expectedReads[0].readAt],
                latestReadAt: expectedReads[0].readAt,
              },
              {
                userId: expectedReads[1].userId,
                bookId: expectedReads[1].bookId,
                readAt: [expectedReads[1].readAt],
                latestReadAt: expectedReads[1].readAt,
              },
              {
                userId: expectedReads[2].userId,
                bookId: expectedReads[2].bookId,
                readAt: [expectedReads[2].readAt],
                latestReadAt: expectedReads[2].readAt,
              },
            ],
            hasPrevious: false,
            hasNext: false,
            count: expectedReads.length,
          },
        ],
        [
          {
            skip: 0,
            limit: 3,
            orderBy: {date: OrderBy.DESC, title: OrderBy.ASC},
          },
          {
            records: [
              {
                userId: expectedReads[2].userId,
                bookId: expectedReads[2].bookId,
                readAt: [expectedReads[2].readAt],
                latestReadAt: expectedReads[2].readAt,
              },
              {
                userId: expectedReads[1].userId,
                bookId: expectedReads[1].bookId,
                readAt: [expectedReads[1].readAt],
                latestReadAt: expectedReads[1].readAt,
              },
              {
                userId: expectedReads[0].userId,
                bookId: expectedReads[0].bookId,
                readAt: [expectedReads[0].readAt],
                latestReadAt: expectedReads[0].readAt,
              },
            ],
            hasPrevious: false,
            hasNext: false,
            count: expectedReads.length,
          },
        ],
        [
          {skip: 1, limit: 1, orderBy: {date: OrderBy.ASC, title: OrderBy.ASC}},
          {
            records: [
              {
                userId: expectedReads[1].userId,
                bookId: expectedReads[1].bookId,
                readAt: [expectedReads[1].readAt],
                latestReadAt: expectedReads[1].readAt,
              },
            ],
            hasPrevious: true,
            hasNext: true,
            count: expectedReads.length,
          },
        ],
        [
          {
            skip: 3,
            limit: 3,
            orderBy: {date: OrderBy.ASC, title: OrderBy.ASC},
          },
          {
            records: [],
            hasPrevious: true,
            hasNext: false,
            count: expectedReads.length,
          },
        ],
      ])('正常な動作 %j', async (props, expected) => {
        const actual = await usersService.getReadBooks(expectedUser.id, props);

        expect(actual.hasPrevious).toBe(expected.hasPrevious);
        expect(actual.hasNext).toBe(expected.hasNext);
        expect(actual.count).toBe(expected.count);

        expect(actual.records).toHaveLength(expected.records.length);
        for (const [i, record] of actual.records.entries()) {
          expect(record.userId).toBe(expected.records[i].userId);
          expect(record.bookId).toBe(expected.records[i].bookId);
          expect(record.readAt).toStrictEqual(expected.records[i].readAt);
          expect(record.latestReadAt).toBe(expected.records[i].latestReadAt);
        }
      });
    });

    it('複数のreadAtが存在するときに正常に動作する', async () => {
      await neo4jService.write(
        `
        CREATE (u:User {id: "user1"})
        CREATE (b1:Book {id: "book1", title: "A"})
        CREATE (b2:Book {id: "book2", title: "A"})
        CREATE (u)-[:READ_BOOK {readAt: [date("2000-01-01"), date("2002-01-02")]}]->(b1)
        CREATE (u)-[:READ_BOOK {readAt: [date("2001-01-01"), date("2001-01-02")]}]->(b2)
        RETURN *
        `,
      );
      const actual = await usersService.getReadBooks('user1', {
        skip: 0,
        limit: 2,
        orderBy: {date: OrderBy.DESC, title: OrderBy.ASC},
      });
      expect(actual.hasPrevious).toBe(false);
      expect(actual.hasNext).toBe(false);
      expect(actual.count).toBe(2);

      expect(actual.records).toHaveLength(2);

      expect(actual.records[0].bookId).toBe('book1');
      expect(actual.records[0].readAt).toStrictEqual([
        '2002-01-02',
        '2000-01-01',
      ]);
      expect(actual.records[0].latestReadAt).toBe('2002-01-02');

      expect(actual.records[1].bookId).toBe('book2');
      expect(actual.records[1].readAt).toStrictEqual([
        '2001-01-02',
        '2001-01-01',
      ]);
      expect(actual.records[1].latestReadAt).toBe('2001-01-02');
    });

    it('同じ日付の記録があったときの並び替え', async () => {
      await neo4jService.write(
        `
        CREATE (u:User {id: "user1"})
        CREATE (b1:Book {id: "book1", title: "A"})
        CREATE (b2:Book {id: "book2", title: "B"})
        CREATE (b3:Book {id: "book3", title: "C"})
        CREATE (u)-[:READ_BOOK {readAt: [date("2000-01-01")]}]->(b1)
        CREATE (u)-[:READ_BOOK {readAt: [date("2000-01-01")]}]->(b2)
        CREATE (u)-[:READ_BOOK {readAt: [date("2000-01-01")]}]->(b3)
        RETURN *
        `,
      );
      const actual = await usersService.getReadBooks('user1', {
        skip: 0,
        limit: 3,
        orderBy: {date: OrderBy.ASC, title: OrderBy.DESC},
      });
      expect(actual.hasPrevious).toBe(false);
      expect(actual.hasNext).toBe(false);
      expect(actual.count).toBe(3);

      expect(actual.records).toHaveLength(3);
      expect(actual.records[0].bookId).toBe('book3');
      expect(actual.records[1].bookId).toBe('book2');
      expect(actual.records[2].bookId).toBe('book1');
    });

    it('日付がない場合の並び替え', async () => {
      await neo4jService.write(
        `
        CREATE (u:User {id: "user1"})
        CREATE (b1:Book {id: "book1", title: "A"})
        CREATE (b2:Book {id: "book2", title: "B"})
        CREATE (b3:Book {id: "book3", title: "C"})
        CREATE (u)-[:READ_BOOK]->(b1)
        CREATE (u)-[:READ_BOOK]->(b2)
        CREATE (u)-[:READ_BOOK]->(b3)
        RETURN *
        `,
      );
      const actual = await usersService.getReadBooks('user1', {
        skip: 0,
        limit: 3,
        orderBy: {date: OrderBy.ASC, title: OrderBy.DESC},
      });
      expect(actual.hasPrevious).toBe(false);
      expect(actual.hasNext).toBe(false);
      expect(actual.count).toBe(3);

      expect(actual.records).toHaveLength(3);
      expect(actual.records[0].bookId).toBe('book3');
      expect(actual.records[1].bookId).toBe('book2');
      expect(actual.records[2].bookId).toBe('book1');
    });

    it('ミックスされた並び替え', async () => {
      await neo4jService.write(
        `
        CREATE (u:User {id: "user1"})
        CREATE (b1:Book {id: "book1", title: "A"})
        CREATE (b2:Book {id: "book2", title: "B"})
        CREATE (b3:Book {id: "book3", title: "C"})
        CREATE (b4:Book {id: "book4", title: "D"})
        CREATE (b5:Book {id: "book5", title: "E"})
        CREATE (u)-[:READ_BOOK {readAt: [date("2000-01-01")]}]->(b1)
        CREATE (u)-[:READ_BOOK {readAt: [date("2000-01-01")]}]->(b2)
        CREATE (u)-[:READ_BOOK {readAt: [date("2000-01-02")]}]->(b3)
        CREATE (u)-[:READ_BOOK]->(b4)
        CREATE (u)-[:READ_BOOK]->(b5)
        RETURN *
        `,
      );
      const actual = await usersService.getReadBooks('user1', {
        skip: 0,
        limit: 5,
        orderBy: {date: OrderBy.DESC, title: OrderBy.ASC},
      });
      expect(actual.hasPrevious).toBe(false);
      expect(actual.hasNext).toBe(false);
      expect(actual.count).toBe(5);

      expect(actual.records).toHaveLength(5);
      expect(actual.records[0].bookId).toBe('book3');
      expect(actual.records[1].bookId).toBe('book1');
      expect(actual.records[2].bookId).toBe('book2');
      expect(actual.records[3].bookId).toBe('book4');
      expect(actual.records[4].bookId).toBe('book5');
    });
  });

  describe('getHaveBooks()', () => {
    describe('一般的な場合', () => {
      const expectedUser = {id: 'user1'};
      const expectedBooks = [{id: 'book1'}, {id: 'book2'}, {id: 'book3'}];
      const expectedRecords = [
        {
          userId: expectedUser.id,
          bookId: expectedBooks[0].id,
          updatedAt: '2020-01-01T00:00:00.000000000Z',
          have: true,
        },
        {
          userId: expectedUser.id,
          bookId: expectedBooks[1].id,
          updatedAt: '2020-01-02T00:00:00.000000000Z',
          have: true,
        },
        {
          userId: expectedUser.id,
          bookId: expectedBooks[2].id,
          updatedAt: '2020-01-03T00:00:00.000000000Z',
          have: true,
        },
      ];

      beforeEach(async () => {
        await Promise.all(
          expectedRecords.map(({userId, bookId, ...props}) =>
            neo4jService.write(
              `
                MERGE (u:User {id: $userId})-[r:HAS_BOOK]->(b:Book {id: $bookId})
                SET r=$props
                RETURN *
                `,
              {userId, bookId, props},
            ),
          ),
        );
      });

      it.each([
        [
          {skip: 0, limit: 0, orderBy: {updatedAt: OrderBy.ASC}},
          {
            count: 3,
            hasPrevious: false,
            hasNext: true,
            records: [],
          },
        ],
        [
          {skip: 0, limit: 3, orderBy: {updatedAt: OrderBy.ASC}},
          {
            count: 3,
            hasPrevious: false,
            hasNext: false,
            records: [
              {
                have: true,
                userId: expectedUser.id,
                bookId: expectedBooks[0].id,
              },
              {
                have: true,
                userId: expectedUser.id,
                bookId: expectedBooks[1].id,
              },
              {
                have: true,
                userId: expectedUser.id,
                bookId: expectedBooks[2].id,
              },
            ],
          },
        ],
        [
          {skip: 0, limit: 6, orderBy: {updatedAt: OrderBy.ASC}},
          {
            count: 3,
            hasPrevious: false,
            hasNext: false,
            records: [
              {
                have: true,
                userId: expectedUser.id,
                bookId: expectedBooks[0].id,
              },
              {
                have: true,
                userId: expectedUser.id,
                bookId: expectedBooks[1].id,
              },
              {
                have: true,
                userId: expectedUser.id,
                bookId: expectedBooks[2].id,
              },
            ],
          },
        ],
        [
          {skip: 1, limit: 1, orderBy: {updatedAt: OrderBy.ASC}},
          {
            count: 3,
            hasPrevious: true,
            hasNext: true,
            records: [
              {
                have: true,
                userId: expectedUser.id,
                bookId: expectedBooks[1].id,
              },
            ],
          },
        ],
        [
          {skip: 3, limit: 3, orderBy: {updatedAt: OrderBy.ASC}},
          {
            count: 3,
            hasPrevious: true,
            hasNext: false,
            records: [],
          },
        ],
        [
          {skip: 0, limit: 3, orderBy: {updatedAt: OrderBy.DESC}},
          {
            count: 3,
            hasPrevious: false,
            hasNext: false,
            records: [
              {
                have: true,
                userId: expectedUser.id,
                bookId: expectedBooks[2].id,
              },
              {
                have: true,
                userId: expectedUser.id,
                bookId: expectedBooks[1].id,
              },
              {
                have: true,
                userId: expectedUser.id,
                bookId: expectedBooks[0].id,
              },
            ],
          },
        ],
      ])('正常な動作 %j', async (props, expected) => {
        const actual = await usersService.getHaveBooks(expectedUser.id, props);

        expect(actual.count).toBe(expected.count);
        expect(actual.hasPrevious).toBe(expected.hasPrevious);
        expect(actual.hasNext).toBe(expected.hasNext);
        expect(actual.records).toHaveLength(expected.records.length);
      });
    });

    it('have:falseが混ざっている場合', async () => {
      await neo4jService.write(
        `
        CREATE (u:User {id: "user1"})
        CREATE (b1:Book {id: "book1", title: "A"})
        CREATE (b2:Book {id: "book2", title: "B"})
        CREATE (b3:Book {id: "book3", title: "C"})
        CREATE (u)-[:HAS_BOOK {updatedAt: "2020-01-01T00:00:00.000000000Z", have: true}]->(b1)
        CREATE (u)-[:HAS_BOOK {updatedAt: "2020-01-02T00:00:00.000000000Z", have: true}]->(b2)
        CREATE (u)-[:HAS_BOOK {updatedAt: "2020-01-03T00:00:00.000000000Z", have: false}]->(b3)
        RETURN *
        `,
      );
      const actual = await usersService.getHaveBooks('user1', {
        skip: 0,
        limit: 3,
        orderBy: {updatedAt: OrderBy.DESC},
      });
      expect(actual.hasPrevious).toBe(false);
      expect(actual.hasNext).toBe(false);
      expect(actual.count).toBe(2);

      expect(actual.records).toHaveLength(2);
      expect(actual.records[0].bookId).toBe('book2');
      expect(actual.records[1].bookId).toBe('book1');
    });
  });

  describe('getReadingBooks()', () => {
    describe('一般的な場合', () => {
      const expectedUser = {id: 'user1'};
      const expectedBooks = [{id: 'book1'}, {id: 'book2'}, {id: 'book3'}];
      const expectedRecords = [
        {
          userId: expectedUser.id,
          bookId: expectedBooks[0].id,
          updatedAt: '2020-01-01T00:00:00.000000000Z',
          reading: true,
        },
        {
          userId: expectedUser.id,
          bookId: expectedBooks[1].id,
          updatedAt: '2020-01-02T00:00:00.000000000Z',
          reading: true,
        },
        {
          userId: expectedUser.id,
          bookId: expectedBooks[2].id,
          updatedAt: '2020-01-03T00:00:00.000000000Z',
          reading: true,
        },
      ];

      beforeEach(async () => {
        await Promise.all(
          expectedRecords.map(({userId, bookId, ...props}) =>
            neo4jService.write(
              `
                MERGE (u:User {id: $userId})-[r:IS_READING_BOOK]->(b:Book {id: $bookId})
                SET r=$props
                RETURN *
                `,
              {userId, bookId, props},
            ),
          ),
        );
      });

      it.each([
        [
          {skip: 0, limit: 0, orderBy: {updatedAt: OrderBy.ASC}},
          {
            count: 3,
            hasPrevious: false,
            hasNext: true,
            records: [],
          },
        ],
        [
          {skip: 0, limit: 3, orderBy: {updatedAt: OrderBy.ASC}},
          {
            count: 3,
            hasPrevious: false,
            hasNext: false,
            records: [
              {
                reading: true,
                userId: expectedUser.id,
                bookId: expectedBooks[0].id,
              },
              {
                reading: true,
                userId: expectedUser.id,
                bookId: expectedBooks[1].id,
              },
              {
                reading: true,
                userId: expectedUser.id,
                bookId: expectedBooks[2].id,
              },
            ],
          },
        ],
        [
          {skip: 0, limit: 6, orderBy: {updatedAt: OrderBy.ASC}},
          {
            count: 3,
            hasPrevious: false,
            hasNext: false,
            records: [
              {
                reading: true,
                userId: expectedUser.id,
                bookId: expectedBooks[0].id,
              },
              {
                reading: true,
                userId: expectedUser.id,
                bookId: expectedBooks[1].id,
              },
              {
                reading: true,
                userId: expectedUser.id,
                bookId: expectedBooks[2].id,
              },
            ],
          },
        ],
        [
          {skip: 1, limit: 1, orderBy: {updatedAt: OrderBy.ASC}},
          {
            count: 3,
            hasPrevious: true,
            hasNext: true,
            records: [
              {
                reading: true,
                userId: expectedUser.id,
                bookId: expectedBooks[1].id,
              },
            ],
          },
        ],
        [
          {skip: 3, limit: 3, orderBy: {updatedAt: OrderBy.ASC}},
          {
            count: 3,
            hasPrevious: true,
            hasNext: false,
            records: [],
          },
        ],
        [
          {skip: 0, limit: 3, orderBy: {updatedAt: OrderBy.DESC}},
          {
            count: 3,
            hasPrevious: false,
            hasNext: false,
            records: [
              {
                reading: true,
                userId: expectedUser.id,
                bookId: expectedBooks[2].id,
              },
              {
                reading: true,
                userId: expectedUser.id,
                bookId: expectedBooks[1].id,
              },
              {
                reading: true,
                userId: expectedUser.id,
                bookId: expectedBooks[0].id,
              },
            ],
          },
        ],
      ])('正常な動作 %j', async (props, expected) => {
        const actual = await usersService.getReadingBooks(
          expectedUser.id,
          props,
        );

        expect(actual.count).toBe(expected.count);
        expect(actual.hasPrevious).toBe(expected.hasPrevious);
        expect(actual.hasNext).toBe(expected.hasNext);
        expect(actual.records).toHaveLength(expected.records.length);
      });
    });

    it('reading:falseが混ざっている場合', async () => {
      await neo4jService.write(
        `
        CREATE (u:User {id: "user1"})
        CREATE (b1:Book {id: "book1", title: "A"})
        CREATE (b2:Book {id: "book2", title: "B"})
        CREATE (b3:Book {id: "book3", title: "C"})
        CREATE (u)-[:IS_READING_BOOK {updatedAt: "2020-01-01T00:00:00.000000000Z", reading: true}]->(b1)
        CREATE (u)-[:IS_READING_BOOK {updatedAt: "2020-01-02T00:00:00.000000000Z", reading: true}]->(b2)
        CREATE (u)-[:IS_READING_BOOK {updatedAt: "2020-01-03T00:00:00.000000000Z", reading: false}]->(b3)
        RETURN *
        `,
      );
      const actual = await usersService.getReadingBooks('user1', {
        skip: 0,
        limit: 3,
        orderBy: {updatedAt: OrderBy.DESC},
      });
      expect(actual.hasPrevious).toBe(false);
      expect(actual.hasNext).toBe(false);
      expect(actual.count).toBe(2);

      expect(actual.records).toHaveLength(2);
      expect(actual.records[0].bookId).toBe('book2');
      expect(actual.records[1].bookId).toBe('book1');
    });
  });

  describe('getWishesToReadBook()', () => {
    describe('一般的な場合', () => {
      const expectedUser = {id: 'user1'};
      const expectedBooks = [{id: 'book1'}, {id: 'book2'}, {id: 'book3'}];
      const expectedRecords = [
        {
          userId: expectedUser.id,
          bookId: expectedBooks[0].id,
          updatedAt: '2020-01-01T00:00:00.000000000Z',
          wish: true,
        },
        {
          userId: expectedUser.id,
          bookId: expectedBooks[1].id,
          updatedAt: '2020-01-02T00:00:00.000000000Z',
          wish: true,
        },
        {
          userId: expectedUser.id,
          bookId: expectedBooks[2].id,
          updatedAt: '2020-01-03T00:00:00.000000000Z',
          wish: true,
        },
      ];

      beforeEach(async () => {
        await Promise.all(
          expectedRecords.map(({userId, bookId, ...props}) =>
            neo4jService.write(
              `
                MERGE (u:User {id: $userId})-[r:WISHES_TO_READ_BOOK]->(b:Book {id: $bookId})
                SET r=$props
                RETURN *
                `,
              {userId, bookId, props},
            ),
          ),
        );
      });

      it.each([
        [
          {skip: 0, limit: 0, orderBy: {updatedAt: OrderBy.ASC}},
          {
            count: 3,
            hasPrevious: false,
            hasNext: true,
            records: [],
          },
        ],
        [
          {skip: 0, limit: 3, orderBy: {updatedAt: OrderBy.ASC}},
          {
            count: 3,
            hasPrevious: false,
            hasNext: false,
            records: [
              {
                wish: true,
                userId: expectedUser.id,
                bookId: expectedBooks[0].id,
              },
              {
                wish: true,
                userId: expectedUser.id,
                bookId: expectedBooks[1].id,
              },
              {
                wish: true,
                userId: expectedUser.id,
                bookId: expectedBooks[2].id,
              },
            ],
          },
        ],
        [
          {skip: 0, limit: 6, orderBy: {updatedAt: OrderBy.ASC}},
          {
            count: 3,
            hasPrevious: false,
            hasNext: false,
            records: [
              {
                wish: true,
                userId: expectedUser.id,
                bookId: expectedBooks[0].id,
              },
              {
                wish: true,
                userId: expectedUser.id,
                bookId: expectedBooks[1].id,
              },
              {
                wish: true,
                userId: expectedUser.id,
                bookId: expectedBooks[2].id,
              },
            ],
          },
        ],
        [
          {skip: 1, limit: 1, orderBy: {updatedAt: OrderBy.ASC}},
          {
            count: 3,
            hasPrevious: true,
            hasNext: true,
            records: [
              {
                wish: true,
                userId: expectedUser.id,
                bookId: expectedBooks[1].id,
              },
            ],
          },
        ],
        [
          {skip: 3, limit: 3, orderBy: {updatedAt: OrderBy.ASC}},
          {
            count: 3,
            hasPrevious: true,
            hasNext: false,
            records: [],
          },
        ],
        [
          {skip: 0, limit: 3, orderBy: {updatedAt: OrderBy.DESC}},
          {
            count: 3,
            hasPrevious: false,
            hasNext: false,
            records: [
              {
                wish: true,
                userId: expectedUser.id,
                bookId: expectedBooks[2].id,
              },
              {
                wish: true,
                userId: expectedUser.id,
                bookId: expectedBooks[1].id,
              },
              {
                wish: true,
                userId: expectedUser.id,
                bookId: expectedBooks[0].id,
              },
            ],
          },
        ],
      ])('正常な動作 %j', async (props, expected) => {
        const actual = await usersService.getWishesToReadBook(
          expectedUser.id,
          props,
        );

        expect(actual.count).toBe(expected.count);
        expect(actual.hasPrevious).toBe(expected.hasPrevious);
        expect(actual.hasNext).toBe(expected.hasNext);
        expect(actual.records).toHaveLength(expected.records.length);
      });
    });

    it('wish:falseが混ざっている場合', async () => {
      await neo4jService.write(
        `
        CREATE (u:User {id: "user1"})
        CREATE (b1:Book {id: "book1", title: "A"})
        CREATE (b2:Book {id: "book2", title: "B"})
        CREATE (b3:Book {id: "book3", title: "C"})
        CREATE (u)-[:WISHES_TO_READ_BOOK {updatedAt: "2020-01-01T00:00:00.000000000Z", wish: true}]->(b1)
        CREATE (u)-[:WISHES_TO_READ_BOOK {updatedAt: "2020-01-02T00:00:00.000000000Z", wish: true}]->(b2)
        CREATE (u)-[:WISHES_TO_READ_BOOK {updatedAt: "2020-01-03T00:00:00.000000000Z", wish: false}]->(b3)
        RETURN *
        `,
      );
      const actual = await usersService.getWishesToReadBook('user1', {
        skip: 0,
        limit: 3,
        orderBy: {updatedAt: OrderBy.DESC},
      });
      expect(actual.hasPrevious).toBe(false);
      expect(actual.hasNext).toBe(false);
      expect(actual.count).toBe(2);

      expect(actual.records).toHaveLength(2);
      expect(actual.records[0].bookId).toBe('book2');
      expect(actual.records[0].wish).toBe(true);
      expect(actual.records[1].bookId).toBe('book1');
      expect(actual.records[1].wish).toBe(true);
    });
  });

  describe('getStackedBooks()', () => {
    describe('READ_BOOKが一つも無い状態', () => {
      const expectedUser = {id: 'user1'};
      const expectedBooks = [{id: 'book1'}, {id: 'book2'}, {id: 'book3'}];
      const expectedRecords = [
        {
          userId: expectedUser.id,
          bookId: expectedBooks[0].id,
          updatedAt: '2020-01-01T00:00:00.000000000Z',
          have: true,
        },
        {
          userId: expectedUser.id,
          bookId: expectedBooks[1].id,
          updatedAt: '2020-01-02T00:00:00.000000000Z',
          have: true,
        },
        {
          userId: expectedUser.id,
          bookId: expectedBooks[2].id,
          updatedAt: '2020-01-03T00:00:00.000000000Z',
          have: true,
        },
      ];

      beforeEach(async () => {
        await Promise.all(
          expectedRecords.map(({userId, bookId, ...props}) =>
            neo4jService.write(
              `
            MERGE (u:User {id: $userId})-[r:HAS_BOOK]->(b:Book {id: $bookId})
            SET r=$props
            RETURN *
            `,
              {userId, bookId, props},
            ),
          ),
        );
      });

      it.each([
        [
          {skip: 0, limit: 0, orderBy: {updatedAt: OrderBy.ASC}},
          {
            count: 3,
            hasPrevious: false,
            hasNext: true,
            records: [],
          },
        ],
        [
          {skip: 0, limit: 3, orderBy: {updatedAt: OrderBy.ASC}},
          {
            count: 3,
            hasPrevious: false,
            hasNext: false,
            records: [
              {
                have: true,
                userId: expectedUser.id,
                bookId: expectedBooks[0].id,
              },
              {
                have: true,
                userId: expectedUser.id,
                bookId: expectedBooks[1].id,
              },
              {
                have: true,
                userId: expectedUser.id,
                bookId: expectedBooks[2].id,
              },
            ],
          },
        ],
        [
          {skip: 0, limit: 6, orderBy: {updatedAt: OrderBy.ASC}},
          {
            count: 3,
            hasPrevious: false,
            hasNext: false,
            records: [
              {
                have: true,
                userId: expectedUser.id,
                bookId: expectedBooks[0].id,
              },
              {
                have: true,
                userId: expectedUser.id,
                bookId: expectedBooks[1].id,
              },
              {
                have: true,
                userId: expectedUser.id,
                bookId: expectedBooks[2].id,
              },
            ],
          },
        ],
        [
          {skip: 1, limit: 1, orderBy: {updatedAt: OrderBy.ASC}},
          {
            count: 3,
            hasPrevious: true,
            hasNext: true,
            records: [
              {
                have: true,
                userId: expectedUser.id,
                bookId: expectedBooks[1].id,
              },
            ],
          },
        ],
        [
          {skip: 3, limit: 3, orderBy: {updatedAt: OrderBy.ASC}},
          {
            count: 3,
            hasPrevious: true,
            hasNext: false,
            records: [],
          },
        ],
        [
          {skip: 0, limit: 3, orderBy: {updatedAt: OrderBy.DESC}},
          {
            count: 3,
            hasPrevious: false,
            hasNext: false,
            records: [
              {
                have: true,
                userId: expectedUser.id,
                bookId: expectedBooks[2].id,
              },
              {
                have: true,
                userId: expectedUser.id,
                bookId: expectedBooks[1].id,
              },
              {
                have: true,
                userId: expectedUser.id,
                bookId: expectedBooks[0].id,
              },
            ],
          },
        ],
      ])('正常な動作 %j', async (props, expected) => {
        const actual = await usersService.getStackedBooks(
          expectedUser.id,
          props,
        );

        expect(actual.count).toBe(expected.count);
        expect(actual.hasPrevious).toBe(expected.hasPrevious);
        expect(actual.hasNext).toBe(expected.hasNext);
        expect(actual.records).toHaveLength(expected.records.length);
      });
    });

    it('READ_BOOKが混ざっている状況', async () => {
      await neo4jService.write(
        `
        CREATE (u:User {id: "user1"})
        CREATE (b1:Book {id: "book1", title: "A"})
        CREATE (b2:Book {id: "book2", title: "B"})
        CREATE (b3:Book {id: "book3", title: "C"})
        CREATE (u)-[:HAS_BOOK {updatedAt: "2020-01-01T00:00:00.000000000Z", have: true}]->(b1)
        CREATE (u)-[:HAS_BOOK {updatedAt: "2020-01-02T00:00:00.000000000Z", have: true}]->(b2)
        CREATE (u)-[:HAS_BOOK {updatedAt: "2020-01-03T00:00:00.000000000Z", have: true}]->(b3)
        CREATE (u)-[:READ_BOOK {readAt: ["2000-01-01"]}]->(b1)
        RETURN *
        `,
      );
      const actual = await usersService.getStackedBooks('user1', {
        skip: 0,
        limit: 3,
        orderBy: {updatedAt: OrderBy.DESC},
      });
      expect(actual.hasPrevious).toBe(false);
      expect(actual.hasNext).toBe(false);
      expect(actual.count).toBe(2);

      expect(actual.records).toHaveLength(2);
      expect(actual.records[0].bookId).toBe('book3');
      expect(actual.records[1].bookId).toBe('book2');
    });
  });

  describe('readBook()', () => {
    const expectedUser = {id: 'user1'};
    const expectedBook = {id: 'book1'};

    it('READ_BOOKとUserが既に存在する場合', async () => {
      await neo4jService.write(
        `
        CREATE (u:User) SET u=$user
        CREATE (b:Book) SET b=$book
        CREATE (u)-[:READ_BOOK {readAt: ["1999-01-01"]}]->(b)
        RETURN *
      `,
        {user: expectedUser, book: expectedBook},
      );
      const actual = await usersService.readBook(
        {userId: expectedUser.id, bookId: expectedBook.id},
        {readAt: '2000-01-01'},
      );
      expect(actual.userId).toBe(expectedUser.id);
      expect(actual.bookId).toBe(expectedBook.id);
      expect(actual.readAt).toStrictEqual(['2000-01-01', '1999-01-01']);
      expect(actual.latestReadAt).toBe('2000-01-01');
    });

    it('Userが存在しない場合MERGEで生成', async () => {
      await neo4jService.write(`CREATE (b:Book) SET b=$book RETURN *`, {
        book: expectedBook,
      });
      const actual = await usersService.readBook(
        {userId: expectedUser.id, bookId: expectedBook.id},
        {readAt: '2000-01-01'},
      );
      expect(actual.userId).toBe(expectedUser.id);
      expect(actual.bookId).toBe(expectedBook.id);
      expect(actual.readAt).toStrictEqual(['2000-01-01']);
      expect(actual.latestReadAt).toBe('2000-01-01');
    });

    it('READ_BOOKが存在しない場合MERGEで生成', async () => {
      await neo4jService.write(
        `CREATE (u:User),(b:Book) SET u=$user,b=$book RETURN *`,
        {user: expectedUser, book: expectedBook},
      );
      const actual = await usersService.readBook(
        {userId: expectedUser.id, bookId: expectedBook.id},
        {readAt: '2000-01-01'},
      );
      expect(actual.userId).toBe(expectedUser.id);
      expect(actual.bookId).toBe(expectedBook.id);
      expect(actual.readAt).toStrictEqual(['2000-01-01']);
      expect(actual.latestReadAt).toStrictEqual('2000-01-01');
    });

    it('READ_BOOKが存在せず日付が不明の場合', async () => {
      await neo4jService.write(
        `CREATE (u:User),(b:Book) SET u=$user,b=$book RETURN *`,
        {user: expectedUser, book: expectedBook},
      );
      const actual = await usersService.readBook(
        {userId: expectedUser.id, bookId: expectedBook.id},
        {},
      );
      expect(actual.userId).toBe(expectedUser.id);
      expect(actual.bookId).toBe(expectedBook.id);
      expect(actual.readAt).toStrictEqual([]);
      expect(actual.latestReadAt).toBeNull();
    });

    it('READ_BOOKが既に存在して日付が不明の場合', async () => {
      await neo4jService.write(
        `
        CREATE (u:User) SET u=$user
        CREATE (b:Book) SET b=$book
        CREATE (u)-[:READ_BOOK {readAt: ["1999-01-01"]}]->(b)
        RETURN *
      `,
        {user: expectedUser, book: expectedBook},
      );
      const actual = await usersService.readBook(
        {userId: expectedUser.id, bookId: expectedBook.id},
        {},
      );
      expect(actual.userId).toBe(expectedUser.id);
      expect(actual.bookId).toBe(expectedBook.id);
      expect(actual.latestReadAt).toBe('1999-01-01');
      expect(actual.readAt).toStrictEqual(['1999-01-01']);
    });
  });

  describe('setHaveBook()', () => {
    const expectedUser = {id: 'user1'};
    const expectedBook = {id: 'book1'};

    it.each([
      [
        {have: true},
        {
          userId: expectedUser.id,
          bookId: expectedBook.id,
          have: true,
          updatedAt: expect.any(Date),
        },
      ],
      [
        {have: false},
        {
          userId: expectedUser.id,
          bookId: expectedBook.id,
          have: false,
          updatedAt: expect.any(Date),
        },
      ],
    ])('Userが既に存在する場合 %p', async (props, expected) => {
      await neo4jService.write(`CREATE (n:User) SET n=$expected RETURN *`, {
        expected: expectedUser,
      });
      await neo4jService.write(`CREATE (n:Book) SET n=$expected RETURN *`, {
        expected: expectedBook,
      });
      const actual = await usersService.setHaveBook(
        {userId: expectedUser.id, bookId: expectedBook.id},
        props,
      );
      expect(actual).toStrictEqual(expected);
    });

    it.each([
      [
        {have: true},
        {
          userId: expectedUser.id,
          bookId: expectedBook.id,
          have: true,
          updatedAt: expect.any(Date),
        },
      ],
      [
        {have: false},
        {
          userId: expectedUser.id,
          bookId: expectedBook.id,
          have: false,
          updatedAt: expect.any(Date),
        },
      ],
    ])('Userが存在しない場合はMERGEで生成する %p', async (props, expected) => {
      await neo4jService.write(`CREATE (n:Book) SET n=$expected RETURN *`, {
        expected: expectedBook,
      });
      const actual = await usersService.setHaveBook(
        {userId: expectedUser.id, bookId: expectedBook.id},
        props,
      );
      expect(actual).toStrictEqual(expected);
    });
  });

  describe('setReadingBook()', () => {
    const expectedUser = {id: 'user1'};
    const expectedBook = {id: 'book1'};

    it.each([
      [
        {reading: true},
        {
          userId: expectedUser.id,
          bookId: expectedBook.id,
          reading: true,
          updatedAt: expect.any(Date),
        },
      ],
      [
        {reading: false},
        {
          userId: expectedUser.id,
          bookId: expectedBook.id,
          reading: false,
          updatedAt: expect.any(Date),
        },
      ],
    ])('Userが既に存在する場合 %p', async (props, expected) => {
      await neo4jService.write(`CREATE (n:User) SET n=$expected RETURN *`, {
        expected: expectedUser,
      });
      await neo4jService.write(`CREATE (n:Book) SET n=$expected RETURN *`, {
        expected: expectedBook,
      });
      const actual = await usersService.setReadingBook(
        {userId: expectedUser.id, bookId: expectedBook.id},
        props,
      );
      expect(actual).toStrictEqual(expected);
    });

    it.each([
      [
        {reading: true},
        {
          userId: expectedUser.id,
          bookId: expectedBook.id,
          reading: true,
          updatedAt: expect.any(Date),
        },
      ],
      [
        {reading: false},
        {
          userId: expectedUser.id,
          bookId: expectedBook.id,
          reading: false,
          updatedAt: expect.any(Date),
        },
      ],
    ])('Userが存在しない場合はMERGEで生成する %p', async (props, expected) => {
      await neo4jService.write(`CREATE (n:Book) SET n=$expected RETURN *`, {
        expected: expectedBook,
      });
      const actual = await usersService.setReadingBook(
        {userId: expectedUser.id, bookId: expectedBook.id},
        props,
      );
      expect(actual).toStrictEqual(expected);
    });
  });

  describe('setWishReadBook()', () => {
    const expectedUser = {id: 'user1'};
    const expectedBook = {id: 'book1'};

    it.each([
      [
        {wish: true},
        {
          userId: expectedUser.id,
          bookId: expectedBook.id,
          wish: true,
          updatedAt: expect.any(Date),
        },
      ],
      [
        {wish: false},
        {
          userId: expectedUser.id,
          bookId: expectedBook.id,
          wish: false,
          updatedAt: expect.any(Date),
        },
      ],
    ])('Userが既に存在する場合 %p', async (props, expected) => {
      await neo4jService.write(`CREATE (n:User) SET n=$expected RETURN *`, {
        expected: expectedUser,
      });
      await neo4jService.write(`CREATE (n:Book) SET n=$expected RETURN *`, {
        expected: expectedBook,
      });
      const actual = await usersService.setWishReadBook(
        {userId: expectedUser.id, bookId: expectedBook.id},
        props,
      );
      expect(actual).toStrictEqual(expected);
    });

    it.each([
      [
        {wish: true},
        {
          userId: expectedUser.id,
          bookId: expectedBook.id,
          wish: true,
          updatedAt: expect.any(Date),
        },
      ],
      [
        {wish: false},
        {
          userId: expectedUser.id,
          bookId: expectedBook.id,
          wish: false,
          updatedAt: expect.any(Date),
        },
      ],
    ])('Userが存在しない場合はMERGEで生成する %p', async (props, expected) => {
      await neo4jService.write(`CREATE (n:Book) SET n=$expected RETURN *`, {
        expected: expectedBook,
      });
      const actual = await usersService.setWishReadBook(
        {userId: expectedUser.id, bookId: expectedBook.id},
        props,
      );
      expect(actual).toStrictEqual(expected);
    });
  });
});
