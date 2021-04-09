import {INestApplication} from '@nestjs/common';
import {Test} from '@nestjs/testing';
import * as faker from 'faker';
import {IDModule} from '../../../../common/id/id.module';
import {IDService} from '../../../../common/id/id.service';
import {OrderBy} from '../../../../common/order-by.enum';
import {Neo4jTestModule} from '../../../../neo4j/neo4j-test.module';
import {Neo4jService} from '../../../../neo4j/neo4j.service';
import {SeriesService} from '../../series.service';

describe(SeriesService.name, () => {
  let app: INestApplication;

  let neo4jService: Neo4jService;
  let idService: IDService;

  let seriesService: SeriesService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [Neo4jTestModule, IDModule],
      providers: [IDService, SeriesService],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    neo4jService = module.get<Neo4jService>(Neo4jService);
    idService = module.get<IDService>(IDService);

    seriesService = module.get<SeriesService>(SeriesService);
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    await neo4jService.write(`MATCH (n) DETACH DELETE n`);
  });

  afterAll(async () => {
    await app.close();
  });

  it('to be defined', () => {
    expect(seriesService).toBeDefined();
  });

  describe('create()', () => {
    it.each([
      [
        {title: faker.lorem.words(2)},
        {
          id: expect.any(String),
          title: expect.any(String),
        },
      ],
    ])('生成に成功する %#', async (data, expected) => {
      const actual = await seriesService.create(data);

      expect(actual).toStrictEqual(expected);
    });
  });

  describe('findAll()', () => {
    const expectedArray = [
      {id: '1', title: faker.lorem.words(2)},
      {id: '2', title: faker.lorem.words(2)},
      {id: '3', title: faker.lorem.words(2)},
      {id: '4', title: faker.lorem.words(2)},
      {id: '5', title: faker.lorem.words(2)},
    ];

    beforeEach(async () => {
      await Promise.all(
        expectedArray.map((expected) =>
          neo4jService.write(`CREATE (s:Series) SET s = $expected RETURN *`, {
            expected,
          }),
        ),
      );
    });

    it('全件取得できる', async () => {
      const actualArray = await seriesService.findAll();

      actualArray.map((actual) => {
        const expected = expectedArray.find(({id}) => id === actual.id)!;

        expect(expected).not.toBeUndefined();
        expect(actual.id).toBe(expected.id);
        expect(actual.title).toBe(expected.title);
      });
    });
  });

  describe('findById()', () => {
    const expected = {id: '1', title: faker.lorem.words(2)};

    beforeEach(async () => {
      await neo4jService.write(`CREATE (s:Series) SET s = $expected RETURN *`, {
        expected,
      });
    });

    it('指定したIDが存在するなら取得できる', async () => {
      const actual = await seriesService.findById(expected.id);

      expect(actual.id).toBe(expected.id);
      expect(actual.title).toBe(expected.title);
    });

    it('存在しないIDによって取得しようとすると例外を投げる', async () => {
      await expect(() => seriesService.findById('2')).rejects.toThrow(
        /Not Found/,
      );
    });
  });

  describe('addBookToSeries()', () => {
    const expectedSeries = {id: 'series1', title: faker.lorem.words(2)};
    const expectedBook = {id: 'book1', title: faker.lorem.words(2)};

    beforeEach(async () => {
      await neo4jService.write(`CREATE (s:Series) SET s = $series RETURN *`, {
        series: expectedSeries,
      });
      await neo4jService.write(`CREATE (b:Book) SET b = $book RETURN *`, {
        book: expectedBook,
      });
    });

    it.each([
      [{}, {}],
      [{order: 1}, {order: 1}],
      [{displayAs: '上巻'}, {displayAs: '上巻'}],
    ])(
      '正常な動作 %j',
      async (data, expected: {order?: number; displayAs?: string}) => {
        const actual = await seriesService.addBookToSeries(
          {seriesId: expectedSeries.id, bookId: expectedBook.id},
          data,
        );

        expect(actual.seriesId).toBe(expectedSeries.id);
        expect(actual.bookId).toBe(expectedBook.id);
        expect(actual.order).toBe(expected.order);
        expect(actual.displayAs).toBe(expected.displayAs);

        const neo4jResult = await neo4jService.read(
          `
        MATCH (:Book {id: $bookId})-[r:IS_PART_OF_SERIES]->(:Series {id: $seriesId})
        RETURN r
        `,
          {bookId: expectedBook.id, seriesId: expectedSeries.id},
        );
        expect(neo4jResult.records).toHaveLength(1);
      },
    );

    it('2度呼ばれた際に上書きする', async () => {
      const rightProps = {order: 2, displayAs: '下巻'};
      await seriesService.addBookToSeries(
        {seriesId: expectedSeries.id, bookId: expectedBook.id},
        {order: 1, displayAs: '上巻'},
      );
      const actual = await seriesService.addBookToSeries(
        {seriesId: expectedSeries.id, bookId: expectedBook.id},
        rightProps,
      );

      expect(actual.seriesId).toBe(expectedSeries.id);
      expect(actual.bookId).toBe(expectedBook.id);

      expect(actual.order).toBe(rightProps.order);
      expect(actual.displayAs).toBe(rightProps.displayAs);
    });
  });

  describe('getPartsFromSeries()', () => {
    const expectedSeries = {id: 'series1', name: faker.lorem.words(2)};
    const expectedBooks = [
      {id: 'book1', title: 'A'},
      {id: 'book2', title: 'B'},
      {id: 'book3', title: 'C'},
    ];

    beforeEach(async () => {
      await neo4jService.write(`CREATE (s:Series) SET s = $series RETURN *`, {
        series: expectedSeries,
      });
      await Promise.all(
        expectedBooks.map((expectedBook) =>
          neo4jService.write(`CREATE (b:Book) SET b = $book RETURN *`, {
            book: expectedBook,
          }),
        ),
      );
    });

    describe('orderあり', () => {
      beforeEach(async () => {
        await Promise.all(
          expectedBooks.map((expectedBook, i) =>
            neo4jService.write(
              `
              CREATE (:Book {id: $book.id})-[r:IS_PART_OF_SERIES]->(:Series {id: $series.id})
              SET r = $props
              RETURN *
              `,
              {series: expectedSeries, book: expectedBook, props: {order: i}},
            ),
          ),
        );
      });

      it.each([
        [
          {
            skip: 0,
            limit: 0,
            except: [],
            orderBy: {order: OrderBy.ASC, title: OrderBy.ASC},
          },
          {
            books: [],
            hasPrevious: false,
            hasNext: true,
          },
        ],
        [
          {
            skip: 0,
            limit: 3,
            except: [],
            orderBy: {
              order: OrderBy.ASC,
              title: OrderBy.ASC,
            },
          },
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
            orderBy: {
              order: OrderBy.ASC,
              title: OrderBy.ASC,
            },
          },
          {
            books: [expectedBooks[0], expectedBooks[2]],
            hasPrevious: false,
            hasNext: false,
          },
        ],
        [
          {
            skip: 0,
            limit: 3,
            except: [],
            orderBy: {
              order: OrderBy.DESC,
              title: OrderBy.ASC,
            },
          },
          {
            books: [expectedBooks[2], expectedBooks[1], expectedBooks[0]],
            hasPrevious: false,
            hasNext: false,
          },
        ],
        [
          {
            skip: 0,
            limit: 1,
            except: [],
            orderBy: {
              order: OrderBy.ASC,
              title: OrderBy.ASC,
            },
          },
          {
            books: [expectedBooks[0]],
            hasPrevious: false,
            hasNext: true,
          },
        ],
        [
          {
            skip: 1,
            limit: 1,
            except: [],
            orderBy: {
              order: OrderBy.ASC,
              title: OrderBy.ASC,
            },
          },
          {
            books: [expectedBooks[1]],
            hasPrevious: true,
            hasNext: true,
          },
        ],
        [
          {
            skip: 3,
            limit: 3,
            except: [],
            orderBy: {order: OrderBy.ASC, title: OrderBy.ASC},
          },
          {
            books: [],
            hasPrevious: true,
            hasNext: false,
          },
        ],
      ])('正常な動作 %j', async (props, expected) => {
        const actual = await seriesService.getPartsFromSeries(
          expectedSeries.id,
          props,
        );

        expect(actual.hasPrevious).toBe(expected.hasPrevious);
        expect(actual.hasNext).toBe(expected.hasNext);
        expect(actual.count).toBe(expectedBooks.length);

        expect(actual.nodes).toHaveLength(expected.books.length);
        actual.nodes.map(({bookId}, i) => {
          expect(bookId).toBe(expected.books[i].id);
        });
      });
    });
  });

  describe('getPartsFromBook()', () => {
    const expectedSeries = [
      {id: 'series1', name: faker.lorem.words(2)},
      {id: 'series2', name: faker.lorem.words(2)},
      {id: 'series3', name: faker.lorem.words(2)},
    ];
    const expectedBook = {id: 'book1', title: faker.lorem.words(2)};

    beforeEach(async () => {
      await neo4jService.write(`CREATE (b:Book) SET b = $book RETURN *`, {
        book: expectedBook,
      });
      await Promise.all(
        expectedSeries.map((expectedASeries) =>
          neo4jService.write(
            `
          CREATE (s:Series)
          CREATE (:Book {id: $book.id})-[r:IS_PART_OF_SERIES]->(:Series {id: $series.id})
          SET s = $series RETURN *`,
            {
              book: expectedBook,
              series: expectedASeries,
            },
          ),
        ),
      );
    });

    it('BookからSeriesを取得する', async () => {
      const actual = await seriesService.getPartsFromBook(expectedBook.id);

      expect(actual.count).toBe(expectedSeries.length);

      actual.nodes.map(({bookId}) => {
        expect(expectedBook.id).toBe(bookId);
      });
    });
  });

  describe('getSeriesFromBook()', () => {
    describe('seriesが1つの場合', () => {
      beforeEach(async () => {
        await neo4jService.write(
          `
          CREATE (s:Series {id: "series1", title: "Series 1"})
          CREATE (b1:Book {id: "book1"})
          CREATE (b2:Book {id: "book2"}), (b1)-[:NEXT_BOOK]->(b2)
          CREATE (b3:Book {id: "book3"}), (b2)-[:NEXT_BOOK]->(b3)
          CREATE (s)-[:HEAD_OF_SERIES]->(b1)
          RETURN *
          `,
        );
      });

      it('book1からSeriesを取得する', async () => {
        const actual = await seriesService.getSeriesFromBook('book1');

        expect(actual).toHaveLength(1);
        expect(actual[0].seriesId).toBe('series1');
      });

      it('book3からSeriesを取得する', async () => {
        const actual = await seriesService.getSeriesFromBook('book3');

        expect(actual).toHaveLength(1);
        expect(actual[0].seriesId).toBe('series1');
      });
    });

    describe('seriesが複数の場合', () => {
      beforeEach(async () => {
        await neo4jService.write(
          `
          CREATE (s1:Series {id: "series1", title: "Series 1"})
          CREATE (s2:Series {id: "series2", title: "Series 2"})
          CREATE (s1b1:Book {id: "s1-book1"})
          CREATE (s1b2:Book {id: "s1-book2"}), (s1b1)-[:NEXT_BOOK]->(s1b2)
          CREATE (s2b1:Book {id: "s2-book1"})
          CREATE (s2b2:Book {id: "s2-book2"}), (s2b1)-[:NEXT_BOOK]->(s2b2)
          CREATE (b3:Book {id: "book3"}), (s1b2)-[:NEXT_BOOK]->(b3), (s2b2)-[:NEXT_BOOK]->(b3)
          CREATE (s1)-[:HEAD_OF_SERIES]->(s1b1), (s2)-[:HEAD_OF_SERIES]->(s2b1)
          RETURN *
          `,
        );
      });

      it('book3からSeriesを取得する', async () => {
        const actual = await seriesService.getSeriesFromBook('book3');
        expect(actual).toHaveLength(2);
      });
    });

    describe('PART_OF_SERIESが存在する場合', () => {
      beforeEach(async () => {
        await neo4jService.write(
          `
          CREATE (s:Series {id: "series1", title: "Series 1"})
          CREATE (b1:Book {id: "book1"})
          CREATE (b2:Book {id: "book2"}), (b1)-[:NEXT_BOOK]->(b2)
          CREATE (b3:Book {id: "book3"}), (b2)-[:NEXT_BOOK]->(b3)
          CREATE (s)-[h:HEAD_OF_SERIES]->(b1)
          CREATE (s)-[r1:PART_OF_SERIES {numberingAs: "上巻"}]->(b1)
          CREATE (s)-[r3:PART_OF_SERIES {numberingAs: "下巻"}]->(b3)
          RETURN *
          `,
        );
      });

      it('book1からSeriesを取得する', async () => {
        const actual = await seriesService.getSeriesFromBook('book1');

        expect(actual).toHaveLength(1);
        expect(actual[0].seriesId).toBe('series1');
        expect(actual[0].numberingAs).toBe('上巻');
      });

      it('book2からSeriesを取得する', async () => {
        const actual = await seriesService.getSeriesFromBook('book2');

        expect(actual).toHaveLength(1);
        expect(actual[0].seriesId).toBe('series1');
        expect(actual[0].numberingAs).toBeNull();
      });

      it('book3からSeriesを取得する', async () => {
        const actual = await seriesService.getSeriesFromBook('book3');

        expect(actual).toHaveLength(1);
        expect(actual[0].seriesId).toBe('series1');
        expect(actual[0].numberingAs).toBe('下巻');
      });
    });
  });
});
