import {INestApplication} from '@nestjs/common';
import {Test} from '@nestjs/testing';
import * as faker from 'faker';
import {IDModule} from '../../../../common/id/id.module';
import {IDService} from '../../../../common/id/id.service';
import {OrderBy} from '../../../../common/order-by.enum';
import {Neo4jTestModule} from '../../../../neo4j/neo4j-test.module';
import {Neo4jService} from '../../../../neo4j/neo4j.service';
import {PublishersService} from '../../publishers.service';

describe(PublishersService.name, () => {
  let app: INestApplication;

  let neo4jService: Neo4jService;
  let idService: IDService;

  let publishersService: PublishersService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [Neo4jTestModule, IDModule],
      providers: [IDService, PublishersService],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    neo4jService = module.get<Neo4jService>(Neo4jService);
    idService = module.get<IDService>(IDService);

    publishersService = module.get<PublishersService>(PublishersService);
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    await neo4jService.write(`MATCH (n) DETACH DELETE n`);
  });

  afterAll(async () => {
    await app.close();
  });

  it('to be defined', () => {
    expect(publishersService).toBeDefined();
  });

  describe('create()', () => {
    it.each([
      [
        {name: faker.lorem.words(2)},
        {id: expect.any(String), name: expect.any(String)},
      ],
    ])('生成に成功する %#', async (data, expected) => {
      const actual = await publishersService.create(data);

      expect(actual).toStrictEqual(expected);
    });
  });

  describe('findById()', () => {
    const expected = {id: '1', name: faker.lorem.words(2)};

    beforeEach(async () => {
      await neo4jService.write(
        `CREATE (p:Publisher) SET p=$expected RETURN p`,
        {expected},
      );
    });

    it('存在しないIDについて取得しようとすると例外を投げる', async () => {
      await expect(() => publishersService.findById('2')).rejects.toThrow(
        /Not Found/,
      );
    });

    it('指定したIDが存在するなら取得できる', async () => {
      const actual = await publishersService.findById(expected.id);

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
          neo4jService.write(`CREATE (p:Publisher) SET p=$expected RETURN p`, {
            expected,
          }),
        ),
      );
    });

    it('全件取得できる', async () => {
      const actualArray = await publishersService.findAll();

      actualArray.map((actual) => {
        const expected = expectedArray.find(({id}) => id === actual.id)!;

        expect(expected).not.toBeUndefined();
        expect(actual.id).toBe(expected.id);
        expect(actual.name).toBe(expected.name);
      });
    });
  });

  describe('publishedBook()', () => {
    const expectedPublisher = {id: 'publisher1', name: faker.lorem.words(2)};
    const expectedBook = {id: 'book1', title: faker.lorem.words(2)};

    beforeEach(async () => {
      await neo4jService.write(
        `CREATE (n:Publisher) SET n=$expected RETURN *`,
        {expected: expectedPublisher},
      );
      await neo4jService.write(`CREATE (n:Book) SET n=$expected RETURN *`, {
        expected: expectedBook,
      });
    });

    it('正常な動作', async () => {
      const actual = await publishersService.publishedBook({
        publisherId: expectedPublisher.id,
        bookId: expectedBook.id,
      });

      expect(actual.publisherId).toBe(expectedPublisher.id);
      expect(actual.bookId).toBe(expectedBook.id);

      const neo4jResult = await neo4jService.read(
        `
        MATCH (:Publisher {id: $publisherId})-[r: PUBLISHED_BOOK]->(:Book {id: $bookId})
        RETURN *
        `,
        {bookId: expectedBook.id, publisherId: expectedPublisher.id},
      );
      expect(neo4jResult.records).toHaveLength(1);
    });
  });

  describe('getPublicationsFromBook()', () => {
    const expectedPublishers = [
      {id: 'publisher1', name: 'A'},
      {id: 'publisher2', name: 'B'},
    ];
    const expectedBook = {id: 'book1', title: faker.lorem.words(2)};

    beforeEach(async () => {
      await neo4jService.write(`CREATE (n:Book) SET n=$expected RETURN *`, {
        expected: expectedBook,
      });
      await Promise.all(
        expectedPublishers.map((expectedPublisher) =>
          neo4jService.write(
            `
            CREATE (p:Publisher) SET p=$publisher
            CREATE (p)-[r:PUBLISHED_BOOK]->(:Book {id: $book.id})
            RETURN *
            `,
            {publisher: expectedPublisher, book: expectedBook},
          ),
        ),
      );
    });

    it.each([
      [
        {orderBy: {name: OrderBy.ASC}},
        {
          result: [
            {publisherId: expectedPublishers[0].id, bookId: expectedBook.id},
            {publisherId: expectedPublishers[1].id, bookId: expectedBook.id},
          ],
        },
      ],
      [
        {orderBy: {name: OrderBy.DESC}},
        {
          result: [
            {publisherId: expectedPublishers[1].id, bookId: expectedBook.id},
            {publisherId: expectedPublishers[0].id, bookId: expectedBook.id},
          ],
        },
      ],
    ])('正常な動作 %j', async (props, expected) => {
      const actual = await publishersService.getPublicationsFromBook(
        expectedBook.id,
        props,
      );

      expect(actual).toHaveLength(expectedPublishers.length);
      for (const [i, {publisherId, bookId}] of actual.entries()) {
        expect(bookId).toBe(expected.result[i].bookId);
        expect(publisherId).toBe(expected.result[i].publisherId);
      }
    });
  });

  describe('getPublicationsFromPublisher()', () => {
    const expectedPublisher = {id: 'publisher1', name: faker.lorem.words(2)};
    const expectedBooks = [
      {id: 'book1', title: 'A'},
      {id: 'book2', title: 'B'},
      {id: 'book3', title: 'C'},
    ];

    beforeEach(async () => {
      await neo4jService.write(
        `CREATE (n:Publisher) SET n=$expected RETURN *`,
        {expected: expectedPublisher},
      );
      await Promise.all(
        expectedBooks.map((expectedBook) =>
          neo4jService.write(
            `
            CREATE (b:Book) SET b=$book
            CREATE (p:Publisher {id: $publisher.id})-[r:PUBLISHED_BOOK]->(b)
            RETURN *
            `,
            {publisher: expectedPublisher, book: expectedBook},
          ),
        ),
      );
    });

    it.each([
      [
        {skip: 0, limit: 0, except: [], orderBy: {title: OrderBy.ASC}},
        {
          publications: [],
          hasPrevious: false,
          hasNext: true,
        },
      ],
      [
        {skip: 0, limit: 3, except: [], orderBy: {title: OrderBy.ASC}},
        {
          publications: [
            {bookId: expectedBooks[0].id, publisherId: expectedPublisher.id},
            {bookId: expectedBooks[1].id, publisherId: expectedPublisher.id},
            {bookId: expectedBooks[2].id, publisherId: expectedPublisher.id},
          ],
          hasPrevious: false,
          hasNext: false,
        },
      ],
      [
        {skip: 0, limit: 3, except: [], orderBy: {title: OrderBy.DESC}},
        {
          publications: [
            {bookId: expectedBooks[2].id, publisherId: expectedPublisher.id},
            {bookId: expectedBooks[1].id, publisherId: expectedPublisher.id},
            {bookId: expectedBooks[0].id, publisherId: expectedPublisher.id},
          ],
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
          publications: [
            {bookId: expectedBooks[0].id, publisherId: expectedPublisher.id},
            {bookId: expectedBooks[2].id, publisherId: expectedPublisher.id},
          ],
          hasPrevious: false,
          hasNext: false,
        },
      ],
      [
        {skip: 0, limit: 1, except: [], orderBy: {title: OrderBy.ASC}},
        {
          publications: [
            {bookId: expectedBooks[0].id, publisherId: expectedPublisher.id},
          ],
          hasPrevious: false,
          hasNext: true,
        },
      ],
      [
        {skip: 1, limit: 1, except: [], orderBy: {title: OrderBy.ASC}},
        {
          publications: [
            {bookId: expectedBooks[1].id, publisherId: expectedPublisher.id},
          ],
          hasPrevious: true,
          hasNext: true,
        },
      ],
      [
        {skip: 3, limit: 3, except: [], orderBy: {title: OrderBy.ASC}},
        {
          publications: [],
          hasPrevious: true,
          hasNext: false,
        },
      ],
    ])('正常な動作 %j', async (props, expected) => {
      const actual = await publishersService.getPublicationsFromPublisher(
        expectedPublisher.id,
        props,
      );

      expect(actual.hasPrevious).toBe(expected.hasPrevious);
      expect(actual.hasNext).toBe(expected.hasNext);
      expect(actual.count).toBe(expectedBooks.length);

      expect(actual.publications).toHaveLength(expected.publications.length);
      for (const [i, actualPub] of actual.publications.entries()) {
        expect(actualPub.bookId).toBe(expected.publications[i].bookId);
        expect(actualPub.publisherId).toBe(
          expected.publications[i].publisherId,
        );
      }
    });
  });
});
