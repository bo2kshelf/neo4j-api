import {INestApplication} from '@nestjs/common';
import {Test} from '@nestjs/testing';
import * as faker from 'faker';
import {IDModule} from '../../../../common/id/id.module';
import {IDService} from '../../../../common/id/id.service';
import {OrderBy} from '../../../../common/order-by.enum';
import {Neo4jTestModule} from '../../../../neo4j/neo4j-test.module';
import {Neo4jService} from '../../../../neo4j/neo4j.service';
import {AuthorRole} from '../../../entities/roles.enitty';
import {AuthorsService} from '../../authors.service';

describe(AuthorsService.name, () => {
  let app: INestApplication;

  let neo4jService: Neo4jService;
  let idService: IDService;

  let authorsService: AuthorsService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [Neo4jTestModule, IDModule],
      providers: [IDService, AuthorsService],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    neo4jService = module.get<Neo4jService>(Neo4jService);
    idService = module.get<IDService>(IDService);

    authorsService = module.get<AuthorsService>(AuthorsService);
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    await neo4jService.write(`MATCH (n) DETACH DELETE n`);
  });

  afterAll(async () => {
    await app.close();
  });

  it('to be defined', () => {
    expect(authorsService).toBeDefined();
  });

  describe('create()', () => {
    it.each([
      [
        {name: faker.lorem.words(2)},
        {id: expect.any(String), name: expect.any(String)},
      ],
    ])('生成に成功する %#', async (data, expected) => {
      const actual = await authorsService.create(data);

      expect(actual).toStrictEqual(expected);
    });
  });

  describe('findById()', () => {
    const expected = {id: '1', name: faker.lorem.words(2)};

    beforeEach(async () => {
      await neo4jService.write(
        `CREATE (a:Author {id: $expected.id, name: $expected.name}) RETURN a`,
        {
          expected,
        },
      );
    });

    it('存在しないIDについて取得しようとすると例外を投げる', async () => {
      await expect(() => authorsService.findById('2')).rejects.toThrow(
        /Not Found/,
      );
    });

    it('指定したIDが存在するなら取得できる', async () => {
      const actual = await authorsService.findById(expected.id);

      expect(actual.id).toBe(expected.id);
      expect(actual.name).toBe(expected.name);
    });
  });

  describe('findAll()', () => {
    const expectedArray = [
      {id: '1', name: faker.lorem.words(2)},
      {id: '2', name: faker.lorem.words(2)},
      {id: '3', name: faker.lorem.words(2)},
      {id: '4', name: faker.lorem.words(2)},
      {id: '5', name: faker.lorem.words(2)},
    ];

    beforeEach(async () => {
      await Promise.all(
        expectedArray.map((expected) =>
          neo4jService.write(
            `CREATE (a:Author {id: $expected.id, name: $expected.name}) RETURN a`,
            {expected},
          ),
        ),
      );
    });

    it('全件取得できる', async () => {
      const actualArray = await authorsService.findAll();

      actualArray.map((actual) => {
        const expected = expectedArray.find(({id}) => id === actual.id)!;

        expect(expected).not.toBeUndefined();
        expect(actual.id).toBe(expected.id);
        expect(actual.name).toBe(expected.name);
      });
    });
  });

  describe('writedBook()', () => {
    const expectedAuthor = {id: 'author1', name: faker.lorem.words(2)};
    const expectedBook = {id: 'book1', title: faker.lorem.words(2)};

    beforeEach(async () => {
      await neo4jService.write(
        `CREATE (a:Author {id: $expected.id, name: $expected.name}) RETURN a`,
        {expected: expectedAuthor},
      );
      await neo4jService.write(
        `CREATE (b:Book {id: $expected.id, title: $expected.title}) RETURN b`,
        {expected: expectedBook},
      );
    });

    it.each([
      [{}, {roles: [AuthorRole.AUTHOR]}],
      [{roles: [AuthorRole.TRANSLATOR]}, {roles: [AuthorRole.TRANSLATOR]}],
    ])('正常な動作 %#', async (data, expected) => {
      const actual = await authorsService.writedBook(
        {
          authorId: 'author1',
          bookId: 'book1',
        },
        data,
      );

      expect(actual.authorId).toBe(expectedAuthor.id);
      expect(actual.bookId).toBe(expectedBook.id);

      expect(actual.roles).toStrictEqual(expected.roles);

      const neo4jResult = await neo4jService.read(
        `
        MATCH (:Author {id: $authorId})-[r: WRITED_BOOK]->(:Book {id: $bookId})
        RETURN *
        `,
        {bookId: expectedBook.id, authorId: expectedAuthor.id},
      );
      expect(neo4jResult.records).toHaveLength(1);
    });

    it('2度呼ばれた際に上書きする', async () => {
      const rightProps = {roles: [AuthorRole.ILLUSTRATOR]};
      await authorsService.writedBook(
        {authorId: 'author1', bookId: 'book1'},
        {roles: [AuthorRole.COMIC_ARTIST]},
      );
      const actual = await authorsService.writedBook(
        {authorId: 'author1', bookId: 'book1'},
        rightProps,
      );

      expect(actual.authorId).toBe(expectedAuthor.id);
      expect(actual.bookId).toBe(expectedBook.id);

      expect(actual.roles).toStrictEqual(rightProps.roles);
    });
  });

  describe('getWritingFromAuthor()', () => {
    const expectedAuthor = {id: 'author1', name: faker.lorem.words(2)};
    const expectedBooks = [
      {id: 'book1', title: 'A'},
      {id: 'book2', title: 'B'},
      {id: 'book3', title: 'C'},
    ];

    beforeEach(async () => {
      await neo4jService.write(
        `CREATE (b:Author {id: $author.id, title: $author.name}) RETURN *`,
        {author: expectedAuthor},
      );
      await Promise.all(
        expectedBooks.map((expectedBook) =>
          neo4jService.write(
            `
            CREATE (b:Book {id: $book.id, title: $book.title})
            CREATE (a:Author {id: $author.id})-[r:WRITED_BOOK]->(b)
            RETURN *
            `,
            {author: expectedAuthor, book: expectedBook},
          ),
        ),
      );
    });

    it.each([
      [
        {skip: 0, limit: 0, except: [], orderBy: {title: OrderBy.ASC}},
        {
          books: [],
          hasPrevious: false,
          hasNext: true,
        },
      ],
      [
        {skip: 0, limit: 3, except: [], orderBy: {title: OrderBy.ASC}},
        {
          books: [expectedBooks[0], expectedBooks[1], expectedBooks[2]],
          hasPrevious: false,
          hasNext: false,
        },
      ],
      [
        {
          skip: 0,
          limit: 3,
          except: [expectedBooks[1].id],
          orderBy: {title: OrderBy.ASC},
        },
        {
          books: [expectedBooks[0], expectedBooks[2]],
          hasPrevious: false,
          hasNext: false,
        },
      ],
      [
        {skip: 0, limit: 3, except: [], orderBy: {title: OrderBy.DESC}},
        {
          books: [expectedBooks[2], expectedBooks[1], expectedBooks[0]],
          hasPrevious: false,
          hasNext: false,
        },
      ],
      [
        {skip: 0, limit: 1, except: [], orderBy: {title: OrderBy.ASC}},
        {
          books: [expectedBooks[0]],
          hasPrevious: false,
          hasNext: true,
        },
      ],
      [
        {skip: 1, limit: 1, except: [], orderBy: {title: OrderBy.ASC}},
        {
          books: [expectedBooks[1]],
          hasPrevious: true,
          hasNext: true,
        },
      ],
      [
        {skip: 3, limit: 3, except: [], orderBy: {title: OrderBy.ASC}},
        {
          books: [],
          hasPrevious: true,
          hasNext: false,
        },
      ],
    ])('正常な動作 %j', async (props, expected) => {
      const actual = await authorsService.getWritingFromAuthor(
        expectedAuthor.id,
        props,
      );

      expect(actual.nodes).toHaveLength(expected.books.length);
      expect(actual.hasPrevious).toBe(expected.hasPrevious);
      expect(actual.hasNext).toBe(expected.hasNext);
      expect(actual.count).toBe(expectedBooks.length);
      actual.nodes.map(({bookId}, i) => {
        expect(bookId).toBe(expected.books[i].id);
      });
    });
  });

  describe('getWritingFromBook()', () => {
    const expectedBook = {id: 'book1', title: faker.lorem.words(2)};
    const expectedAuthors = [
      {id: 'author1', name: 'A'},
      {id: 'author2', name: 'B'},
      {id: 'author3', name: 'C'},
    ];

    beforeEach(async () => {
      await neo4jService.write(
        `CREATE (b:Book {id: $book.id, title: $book.title}) RETURN *`,
        {book: expectedBook},
      );
      await Promise.all(
        expectedAuthors.map((expectedAuthor) =>
          neo4jService.write(
            `
            CREATE (a:Author {id: $author.id, name: $author.name})
            CREATE (a)-[r:WRITED_BOOK]->(:Book {id: $book.id})
            RETURN *
            `,
            {author: expectedAuthor, book: expectedBook},
          ),
        ),
      );
    });

    it.each([
      [
        {orderBy: {name: OrderBy.ASC}},
        {sort: [expectedAuthors[0], expectedAuthors[1], expectedAuthors[2]]},
      ],
      [
        {orderBy: {name: OrderBy.DESC}},
        {sort: [expectedAuthors[2], expectedAuthors[1], expectedAuthors[0]]},
      ],
    ])('正常な動作 %j', async (props, expected) => {
      const actual = await authorsService.getWritingFromBook(
        expectedBook.id,
        props,
      );

      expect(actual).toHaveLength(expectedAuthors.length);
      actual.map(({authorId}, i) => {
        expect(authorId).toBe(expected.sort[i].id);
      });
    });
  });
});
