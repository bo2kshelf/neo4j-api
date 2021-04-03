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
          book: expectedBooks[0],
          user: expectedUser,
          readAt: ['2000-01-01'],
        },
        {
          book: expectedBooks[1],
          user: expectedUser,
          readAt: ['2000-01-02'],
        },
        {
          book: expectedBooks[2],
          user: expectedUser,
          readAt: ['2000-01-03'],
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
          expectedReads.map(({book, user, ...props}) =>
            neo4jService.write(
              `
            MATCH (u:User {id: $user.id}) MATCH (b:Book {id: $book.id})
            CREATE (u)-[r:READ_BOOK]->(b) SET r=$props
            RETURN *
            `,
              {user, book, props},
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
                userId: expectedUser.id,
                bookId: expectedReads[0].book.id,
                latestReadAt: expectedReads[0].readAt[0],
              },
              {
                userId: expectedUser.id,
                bookId: expectedReads[1].book.id,
                latestReadAt: expectedReads[1].readAt[0],
              },
              {
                userId: expectedUser.id,
                bookId: expectedReads[2].book.id,
                latestReadAt: expectedReads[2].readAt[0],
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
                userId: expectedUser.id,
                bookId: expectedReads[0].book.id,
                latestReadAt: expectedReads[0].readAt[0],
              },
              {
                userId: expectedUser.id,
                bookId: expectedReads[1].book.id,
                latestReadAt: expectedReads[1].readAt[0],
              },
              {
                userId: expectedUser.id,
                bookId: expectedReads[2].book.id,
                latestReadAt: expectedReads[2].readAt[0],
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
                userId: expectedUser.id,
                bookId: expectedReads[2].book.id,
                latestReadAt: expectedReads[2].readAt[0],
              },
              {
                userId: expectedUser.id,
                bookId: expectedReads[1].book.id,
                latestReadAt: expectedReads[1].readAt[0],
              },
              {
                userId: expectedUser.id,
                bookId: expectedReads[0].book.id,
                latestReadAt: expectedReads[0].readAt[0],
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
                userId: expectedUser.id,
                bookId: expectedReads[1].book.id,
                latestReadAt: expectedReads[1].readAt[0],
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
        CREATE (u)-[:READ_BOOK {readAt: ["2000-01-01", "2002-01-02"]}]->(b1)
        CREATE (u)-[:READ_BOOK {readAt: ["2001-01-01", "2001-01-02"]}]->(b2)
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
      expect(actual.records[0].latestReadAt).toBe('2002-01-02');

      expect(actual.records[1].bookId).toBe('book2');
      expect(actual.records[1].latestReadAt).toBe('2001-01-02');
    });

    it('同じ日付の記録があったときの並び替え', async () => {
      await neo4jService.write(
        `
        CREATE (u:User {id: "user1"})
        CREATE (b1:Book {id: "book1", title: "A"})
        CREATE (b2:Book {id: "book2", title: "B"})
        CREATE (b3:Book {id: "book3", title: "C"})
        CREATE (u)-[:READ_BOOK {readAt: ["2000-01-01"]}]->(b1)
        CREATE (u)-[:READ_BOOK {readAt: ["2000-01-01"]}]->(b2)
        CREATE (u)-[:READ_BOOK {readAt: ["2000-01-01"]}]->(b3)
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
        CREATE (u)-[:READ_BOOK {readAt: ["2000-01-01"]}]->(b1)
        CREATE (u)-[:READ_BOOK {readAt: ["2000-01-01"]}]->(b2)
        CREATE (u)-[:READ_BOOK {readAt: ["2000-01-02"]}]->(b3)
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
