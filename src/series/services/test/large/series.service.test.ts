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
  let seriesService: SeriesService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [Neo4jTestModule, IDModule],
      providers: [IDService, SeriesService],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    neo4jService = module.get<Neo4jService>(Neo4jService);
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

  describe('create()', () => {
    it('正常に生成する', async () => {
      await neo4jService.write(
        `
        CREATE (b:Book {id: "book1"})
        RETURN *
        `,
      );
      const actual = await seriesService.createSeries('book1', {
        title: 'series',
      });
      expect(actual.bookId).toBe('book1');
      expect(actual.seriesId).toStrictEqual(expect.any(String));
    });

    it('bookが存在しない場合例外を投げる', async () => {
      await expect(() =>
        seriesService.createSeries('book2', {title: 'series'}),
      ).rejects.toThrow(/Not Found/);
    });
  });

  describe('connectBooksAsNextBook()', () => {
    it('正常に生成する', async () => {
      await neo4jService.write(
        `
        CREATE (p:Book {id: "pre"})
        CREATE (n:Book {id: "next"})
        RETURN *
        `,
      );
      const actual = await seriesService.connectBooksAsNextBook({
        previousId: 'pre',
        nextId: 'next',
      });
      expect(actual.previousId).toBe('pre');
      expect(actual.nextId).toBe('next');
    });

    it('previousIdに紐づくbookが存在しない場合例外を投げる', async () => {
      await neo4jService.write(
        `
        CREATE (n:Book {id: "next"})
        RETURN *
        `,
      );
      await expect(() =>
        seriesService.connectBooksAsNextBook({
          previousId: 'pre',
          nextId: 'next',
        }),
      ).rejects.toThrow(/Not Found/);
    });

    it('nextIdに紐づくbookが存在しない場合例外を投げる', async () => {
      await neo4jService.write(
        `
        CREATE (p:Book {id: "pre"})
        RETURN *
        `,
      );
      await expect(() =>
        seriesService.connectBooksAsNextBook({
          previousId: 'pre',
          nextId: 'next',
        }),
      ).rejects.toThrow(/Not Found/);
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

  describe('previousBooks()', () => {
    beforeEach(async () => {
      await neo4jService.write(
        `
        CREATE (b1:Book {id: "book1"})
        CREATE (b2:Book {id: "book2"}), (b1)-[:NEXT_BOOK]->(b2)
        CREATE (b3:Book {id: "book3"}), (b2)-[:NEXT_BOOK]->(b3)
        CREATE (b4:Book {id: "book4"}), (b3)-[:NEXT_BOOK]->(b4)
        RETURN *
        `,
      );
    });

    it.each([
      [
        {skip: 0, limit: 0},
        {count: 3, hasPrevious: false, hasNext: true, nodes: []},
      ],
      [
        {skip: 0, limit: 1},
        {
          count: 3,
          hasPrevious: false,
          hasNext: true,
          nodes: [{previousId: 'book3', nextId: 'book4'}],
        },
      ],
      [
        {skip: 0, limit: 3},
        {
          count: 3,
          hasPrevious: false,
          hasNext: false,
          nodes: [
            {previousId: 'book3', nextId: 'book4'},
            {previousId: 'book2', nextId: 'book3'},
            {previousId: 'book1', nextId: 'book2'},
          ],
        },
      ],
      [
        {skip: 1, limit: 1},
        {
          count: 3,
          hasPrevious: true,
          hasNext: true,
          nodes: [{previousId: 'book2', nextId: 'book3'}],
        },
      ],
      [
        {skip: 3, limit: 3},
        {
          count: 3,
          hasPrevious: true,
          hasNext: false,
          nodes: [],
        },
      ],
    ])('正常な動作 %j', async (props, expected) => {
      const actual = await seriesService.previousBooks('book4', props);
      expect(actual.count).toBe(expected.count);
      expect(actual.hasPrevious).toBe(expected.hasPrevious);
      expect(actual.hasNext).toBe(expected.hasNext);

      expect(actual.nodes).toHaveLength(expected.nodes.length);
      for (const [i, {previousId, nextId}] of actual.nodes.entries()) {
        expect(previousId).toBe(expected.nodes[i].previousId);
        expect(nextId).toBe(expected.nodes[i].nextId);
      }
    });
  });

  describe('nextBooks()', () => {
    beforeEach(async () => {
      await neo4jService.write(
        `
        CREATE (b1:Book {id: "book1"})
        CREATE (b2:Book {id: "book2"}), (b1)-[:NEXT_BOOK]->(b2)
        CREATE (b3:Book {id: "book3"}), (b2)-[:NEXT_BOOK]->(b3)
        CREATE (b4:Book {id: "book4"}), (b3)-[:NEXT_BOOK]->(b4)
        RETURN *
        `,
      );
    });

    it.each([
      [
        {skip: 0, limit: 0},
        {count: 3, hasPrevious: false, hasNext: true, nodes: []},
      ],
      [
        {skip: 0, limit: 1},
        {
          count: 3,
          hasPrevious: false,
          hasNext: true,
          nodes: [{previousId: 'book1', nextId: 'book2'}],
        },
      ],
      [
        {skip: 0, limit: 3},
        {
          count: 3,
          hasPrevious: false,
          hasNext: false,
          nodes: [
            {previousId: 'book1', nextId: 'book2'},
            {previousId: 'book2', nextId: 'book3'},
            {previousId: 'book3', nextId: 'book4'},
          ],
        },
      ],
      [
        {skip: 1, limit: 1},
        {
          count: 3,
          hasPrevious: true,
          hasNext: true,
          nodes: [{previousId: 'book2', nextId: 'book3'}],
        },
      ],
      [
        {skip: 3, limit: 3},
        {
          count: 3,
          hasPrevious: true,
          hasNext: false,
          nodes: [],
        },
      ],
    ])('正常な動作 %j', async (props, expected) => {
      const actual = await seriesService.nextBooks('book1', props);
      expect(actual.count).toBe(expected.count);
      expect(actual.hasPrevious).toBe(expected.hasPrevious);
      expect(actual.hasNext).toBe(expected.hasNext);

      expect(actual.nodes).toHaveLength(expected.nodes.length);
      for (const [i, {previousId, nextId}] of actual.nodes.entries()) {
        expect(previousId).toBe(expected.nodes[i].previousId);
        expect(nextId).toBe(expected.nodes[i].nextId);
      }
    });
  });

  describe('getHeadOfSeries', () => {
    it('正常に動作する', async () => {
      await neo4jService.write(
        `
        CREATE (s:Series {id: "series1"})
        CREATE (b:Book {id: "book1"}), (s)-[:HEAD_OF_SERIES]->(b)
        CREATE (s)-[:PART_OF_SERIES {numberingAs: "上巻"}]->(b)
        RETURN *
        `,
      );
      const actual = await seriesService.getHeadOfSeries('series1');
      expect(actual.seriesId).toBe('series1');
      expect(actual.bookId).toBe('book1');
      expect(actual.numberingAs).toBe('上巻');
    });

    it('PART_OF_SERIESが無くても正常に動作する', async () => {
      await neo4jService.write(
        `
        CREATE (s:Series {id: "series1"})
        CREATE (b:Book {id: "book1"}), (s)-[:HEAD_OF_SERIES]->(b)
        RETURN *
        `,
      );
      const actual = await seriesService.getHeadOfSeries('series1');
      expect(actual.seriesId).toBe('series1');
      expect(actual.bookId).toBe('book1');
      expect(actual.numberingAs).toBeNull();
    });
  });

  describe('getPartsOfSeries', () => {
    describe('PART_OF_SERIESが無い場合', () => {
      beforeEach(async () => {
        await neo4jService.write(
          `
          CREATE (s:Series {id: "series1"})
          CREATE (b1:Book {id: "book1"}), (s)-[:HEAD_OF_SERIES]->(b1)
          CREATE (b2:Book {id: "book2"}), (b1)-[:NEXT_BOOK]->(b2)
          CREATE (b3:Book {id: "book3"}), (b2)-[:NEXT_BOOK]->(b3)
          RETURN *
          `,
        );
      });

      it.each([
        [
          {
            skip: 0,
            limit: 0,
            orderBy: OrderBy.ASC,
          },
          {
            count: 3,
            hasPrevious: false,
            hasNext: true,
            nodes: [],
          },
        ],
        [
          {
            skip: 0,
            limit: 3,
            orderBy: OrderBy.ASC,
          },
          {
            count: 3,
            hasPrevious: false,
            hasNext: false,
            nodes: [
              {seriesId: 'series1', bookId: 'book1', numberingAs: null},
              {seriesId: 'series1', bookId: 'book2', numberingAs: null},
              {seriesId: 'series1', bookId: 'book3', numberingAs: null},
            ],
          },
        ],
        [
          {
            skip: 0,
            limit: 3,
            orderBy: OrderBy.DESC,
          },
          {
            count: 3,
            hasPrevious: false,
            hasNext: false,
            nodes: [
              {seriesId: 'series1', bookId: 'book3', numberingAs: null},
              {seriesId: 'series1', bookId: 'book2', numberingAs: null},
              {seriesId: 'series1', bookId: 'book1', numberingAs: null},
            ],
          },
        ],
        [
          {
            skip: 1,
            limit: 3,
            orderBy: OrderBy.ASC,
          },
          {
            count: 3,
            hasPrevious: true,
            hasNext: false,
            nodes: [
              {seriesId: 'series1', bookId: 'book2', numberingAs: null},
              {seriesId: 'series1', bookId: 'book3', numberingAs: null},
            ],
          },
        ],
        [
          {
            skip: 1,
            limit: 1,
            orderBy: OrderBy.ASC,
          },
          {
            count: 3,
            hasPrevious: true,
            hasNext: true,
            nodes: [{seriesId: 'series1', bookId: 'book2', numberingAs: null}],
          },
        ],
        [
          {
            skip: 3,
            limit: 3,
            orderBy: OrderBy.ASC,
          },
          {
            count: 3,
            hasPrevious: true,
            hasNext: false,
            nodes: [],
          },
        ],
      ])('正常に動作する %j', async (props, expected) => {
        const actual = await seriesService.getPartsOfSeries('series1', props);
        expect(actual.count).toBe(expected.count);
        expect(actual.hasPrevious).toBe(expected.hasPrevious);
        expect(actual.hasNext).toBe(expected.hasNext);
        for (const [i, actualNode] of actual.nodes.entries()) {
          expect(actualNode).toStrictEqual(expected.nodes[i]);
        }
      });
    });

    it('PART_OF_SERIESがある場合', async () => {
      await neo4jService.write(
        `
        CREATE (s:Series {id: "series1"})
        CREATE (b1:Book {id: "book1"}), (s)-[:HEAD_OF_SERIES]->(b1)
        CREATE (b2:Book {id: "book2"}), (b1)-[:NEXT_BOOK]->(b2)
        CREATE (b3:Book {id: "book3"}), (b2)-[:NEXT_BOOK]->(b3)
        CREATE (s)-[:PART_OF_SERIES {numberingAs: "上巻"}]->(b1)
        CREATE (s)-[:PART_OF_SERIES {numberingAs: "中巻"}]->(b2)
        CREATE (s)-[:PART_OF_SERIES {numberingAs: "下巻"}]->(b3)
        RETURN *
        `,
      );

      const expected = {
        count: 3,
        hasPrevious: false,
        hasNext: false,
        nodes: [
          {seriesId: 'series1', bookId: 'book1', numberingAs: '上巻'},
          {seriesId: 'series1', bookId: 'book2', numberingAs: '中巻'},
          {seriesId: 'series1', bookId: 'book3', numberingAs: '下巻'},
        ],
      };
      const actual = await seriesService.getPartsOfSeries('series1', {
        skip: 0,
        limit: 3,
        orderBy: OrderBy.ASC,
      });
      expect(actual.count).toBe(expected.count);
      expect(actual.hasPrevious).toBe(expected.hasPrevious);
      expect(actual.hasNext).toBe(expected.hasNext);
      for (const [i, actualNode] of actual.nodes.entries()) {
        expect(actualNode).toStrictEqual(expected.nodes[i]);
      }
    });
  });

  describe('getSubPartsOfSeries', () => {
    it('正常に動作する', async () => {
      await neo4jService.write(
        `
        CREATE (s:Series {id: "series1"})
        CREATE (b1:Book {id: "book1", title: "A"}), (s)-[:SUBPART_OF_SERIES]->(b1)
        CREATE (b2:Book {id: "book2", title: "B"}), (s)-[:SUBPART_OF_SERIES]->(b2)
        CREATE (b3:Book {id: "book3", title: "C"}), (s)-[:SUBPART_OF_SERIES]->(b3)
        RETURN *
        `,
      );

      const expected = {
        count: 3,
        hasPrevious: false,
        hasNext: false,
        nodes: [
          {seriesId: 'series1', bookId: 'book1'},
          {seriesId: 'series1', bookId: 'book2'},
          {seriesId: 'series1', bookId: 'book3'},
        ],
      };
      const actual = await seriesService.getSubPartsOfSeries('series1', {
        skip: 0,
        limit: 3,
      });
      expect(actual.count).toBe(expected.count);
      expect(actual.hasPrevious).toBe(expected.hasPrevious);
      expect(actual.hasNext).toBe(expected.hasNext);
      for (const [i, actualNode] of actual.nodes.entries()) {
        expect(actualNode).toStrictEqual(expected.nodes[i]);
      }
    });
  });
});
