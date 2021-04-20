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
            nodes: [],
          },
        ],
        [
          {skip: 0, limit: 3, orderBy: {updatedAt: OrderBy.ASC}},
          {
            count: 3,
            hasPrevious: false,
            hasNext: false,
            nodes: [
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
            nodes: [
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
            nodes: [
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
            nodes: [],
          },
        ],
        [
          {skip: 0, limit: 3, orderBy: {updatedAt: OrderBy.DESC}},
          {
            count: 3,
            hasPrevious: false,
            hasNext: false,
            nodes: [
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
        expect(actual.nodes).toHaveLength(expected.nodes.length);
      });
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
            nodes: [],
          },
        ],
        [
          {skip: 0, limit: 3, orderBy: {updatedAt: OrderBy.ASC}},
          {
            count: 3,
            hasPrevious: false,
            hasNext: false,
            nodes: [
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
            nodes: [
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
            nodes: [
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
            nodes: [],
          },
        ],
        [
          {skip: 0, limit: 3, orderBy: {updatedAt: OrderBy.DESC}},
          {
            count: 3,
            hasPrevious: false,
            hasNext: false,
            nodes: [
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
        expect(actual.nodes).toHaveLength(expected.nodes.length);
      });
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
            nodes: [],
          },
        ],
        [
          {skip: 0, limit: 3, orderBy: {updatedAt: OrderBy.ASC}},
          {
            count: 3,
            hasPrevious: false,
            hasNext: false,
            nodes: [
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
            nodes: [
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
            nodes: [
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
            nodes: [],
          },
        ],
        [
          {skip: 0, limit: 3, orderBy: {updatedAt: OrderBy.DESC}},
          {
            count: 3,
            hasPrevious: false,
            hasNext: false,
            nodes: [
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
        expect(actual.nodes).toHaveLength(expected.nodes.length);
      });
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
            nodes: [],
          },
        ],
        [
          {skip: 0, limit: 3, orderBy: {updatedAt: OrderBy.ASC}},
          {
            count: 3,
            hasPrevious: false,
            hasNext: false,
            nodes: [
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
            nodes: [
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
            nodes: [
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
            nodes: [],
          },
        ],
        [
          {skip: 0, limit: 3, orderBy: {updatedAt: OrderBy.DESC}},
          {
            count: 3,
            hasPrevious: false,
            hasNext: false,
            nodes: [
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
        expect(actual.nodes).toHaveLength(expected.nodes.length);
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

      expect(actual.nodes).toHaveLength(2);
      expect(actual.nodes[0].bookId).toBe('book3');
      expect(actual.nodes[1].bookId).toBe('book2');
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
        true,
      ],
      [
        {have: false},
        {
          userId: expectedUser.id,
          bookId: expectedBook.id,
          have: false,
          updatedAt: expect.any(Date),
        },
        false,
      ],
    ])('Userが既に存在する場合 %p', async (props, expected, expectedExists) => {
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

      const exists: boolean = await neo4jService
        .read(
          `OPTIONAL MATCH p=(:User {id: $userId})-[r:HAS_BOOK]->(:Book {id: $bookId}) RETURN p IS NOT NULL AS exists`,
          {userId: expectedUser.id, bookId: expectedBook.id},
        )
        .then(({records}) => records[0].get('exists'));
      expect(exists).toBe(expectedExists);
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
        true,
      ],
      [
        {have: false},
        {
          userId: expectedUser.id,
          bookId: expectedBook.id,
          have: false,
          updatedAt: expect.any(Date),
        },
        false,
      ],
    ])(
      'Userが存在しない場合はMERGEで生成する %p',
      async (props, expected, expectedExists) => {
        await neo4jService.write(`CREATE (n:Book) SET n=$expected RETURN *`, {
          expected: expectedBook,
        });
        const actual = await usersService.setHaveBook(
          {userId: expectedUser.id, bookId: expectedBook.id},
          props,
        );
        expect(actual).toStrictEqual(expected);

        const exists: boolean = await neo4jService
          .read(
            `OPTIONAL MATCH p=(:User {id: $userId})-[r:HAS_BOOK]->(:Book {id: $bookId}) RETURN p IS NOT NULL AS exists`,
            {userId: expectedUser.id, bookId: expectedBook.id},
          )
          .then(({records}) => records[0].get('exists'));
        expect(exists).toBe(expectedExists);
      },
    );
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
        true,
      ],
      [
        {reading: false},
        {
          userId: expectedUser.id,
          bookId: expectedBook.id,
          reading: false,
          updatedAt: expect.any(Date),
        },
        false,
      ],
    ])('Userが既に存在する場合 %p', async (props, expected, expectedExists) => {
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

      const exists: boolean = await neo4jService
        .read(
          `OPTIONAL MATCH p=(:User {id: $userId})-[r:IS_READING_BOOK]->(:Book {id: $bookId}) RETURN p IS NOT NULL AS exists`,
          {userId: expectedUser.id, bookId: expectedBook.id},
        )
        .then(({records}) => records[0].get('exists'));
      expect(exists).toBe(expectedExists);
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
        true,
      ],
      [
        {reading: false},
        {
          userId: expectedUser.id,
          bookId: expectedBook.id,
          reading: false,
          updatedAt: expect.any(Date),
        },
        false,
      ],
    ])(
      'Userが存在しない場合はMERGEで生成する %p',
      async (props, expected, expectedExists) => {
        await neo4jService.write(`CREATE (n:Book) SET n=$expected RETURN *`, {
          expected: expectedBook,
        });
        const actual = await usersService.setReadingBook(
          {userId: expectedUser.id, bookId: expectedBook.id},
          props,
        );
        expect(actual).toStrictEqual(expected);

        const exists: boolean = await neo4jService
          .read(
            `OPTIONAL MATCH p=(:User {id: $userId})-[r:IS_READING_BOOK]->(:Book {id: $bookId}) RETURN p IS NOT NULL AS exists`,
            {userId: expectedUser.id, bookId: expectedBook.id},
          )
          .then(({records}) => records[0].get('exists'));
        expect(exists).toBe(expectedExists);
      },
    );
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
        true,
      ],
      [
        {wish: false},
        {
          userId: expectedUser.id,
          bookId: expectedBook.id,
          wish: false,
          updatedAt: expect.any(Date),
        },
        false,
      ],
    ])('Userが既に存在する場合 %p', async (props, expected, expectedExists) => {
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

      const exists: boolean = await neo4jService
        .read(
          `OPTIONAL MATCH p=(:User {id: $userId})-[r:WISHES_TO_READ_BOOK]->(:Book {id: $bookId}) RETURN p IS NOT NULL AS exists`,
          {userId: expectedUser.id, bookId: expectedBook.id},
        )
        .then(({records}) => records[0].get('exists'));
      expect(exists).toBe(expectedExists);
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
        true,
      ],
      [
        {wish: false},
        {
          userId: expectedUser.id,
          bookId: expectedBook.id,
          wish: false,
          updatedAt: expect.any(Date),
        },
        false,
      ],
    ])(
      'Userが存在しない場合はMERGEで生成する %p',
      async (props, expected, expectedExists) => {
        await neo4jService.write(`CREATE (n:Book) SET n=$expected RETURN *`, {
          expected: expectedBook,
        });
        const actual = await usersService.setWishReadBook(
          {userId: expectedUser.id, bookId: expectedBook.id},
          props,
        );
        expect(actual).toStrictEqual(expected);
        const exists: boolean = await neo4jService
          .read(
            `OPTIONAL MATCH p=(:User {id: $userId})-[r:WISHES_TO_READ_BOOK]->(:Book {id: $bookId}) RETURN p IS NOT NULL AS exists`,
            {userId: expectedUser.id, bookId: expectedBook.id},
          )
          .then(({records}) => records[0].get('exists'));
        expect(exists).toBe(expectedExists);
      },
    );
  });
});
