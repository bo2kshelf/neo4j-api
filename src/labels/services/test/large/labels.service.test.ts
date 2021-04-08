import {INestApplication} from '@nestjs/common';
import {Test} from '@nestjs/testing';
import * as faker from 'faker';
import {IDModule} from '../../../../common/id/id.module';
import {IDService} from '../../../../common/id/id.service';
import {OrderBy} from '../../../../common/order-by.enum';
import {Neo4jTestModule} from '../../../../neo4j/neo4j-test.module';
import {Neo4jService} from '../../../../neo4j/neo4j.service';
import {LabelsService} from '../../labels.service';

describe(LabelsService.name, () => {
  let app: INestApplication;

  let neo4jService: Neo4jService;
  let idService: IDService;

  let labelsService: LabelsService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [Neo4jTestModule, IDModule],
      providers: [IDService, LabelsService],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    neo4jService = module.get<Neo4jService>(Neo4jService);
    idService = module.get<IDService>(IDService);

    labelsService = module.get<LabelsService>(LabelsService);
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    await neo4jService.write(`MATCH (n) DETACH DELETE n`);
  });

  afterAll(async () => {
    await app.close();
  });

  it('to be defined', () => {
    expect(labelsService).toBeDefined();
  });

  describe('findById()', () => {
    const expected = {id: '1', name: faker.lorem.words(2)};

    beforeEach(async () => {
      await neo4jService.write(`CREATE (p:Label) SET p=$expected RETURN p`, {
        expected,
      });
    });

    it('存在しないIDについて取得しようとすると例外を投げる', async () => {
      await expect(() => labelsService.findById('2')).rejects.toThrow(
        /Not Found/,
      );
    });

    it('指定したIDが存在するなら取得できる', async () => {
      const actual = await labelsService.findById(expected.id);

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
      const actualArray = await labelsService.findAll();

      actualArray.map((actual) => {
        const expected = expectedArray.find(({id}) => id === actual.id)!;

        expect(expected).not.toBeUndefined();
        expect(actual.id).toBe(expected.id);
        expect(actual.name).toBe(expected.name);
      });
    });
  });

  describe('create()', () => {
    it('publishedIdに対してpublisherが存在しない場合例外を投げる', async () => {
      await expect(() =>
        labelsService.create({name: 'A', publisherId: '1'}),
      ).rejects.toThrow(/Publisher Not Found/);
    });

    describe('publisherが存在する場合)', () => {
      const expectedPublisher = {id: '1'};
      beforeEach(async () => {
        await neo4jService.write(
          `CREATE (p:Publisher) SET p=$publisher RETURN p`,
          {publisher: expectedPublisher},
        );
      });

      it.each([
        [
          {name: 'A', publisherId: expectedPublisher.id},
          {id: expect.any(String), name: 'A'},
        ],
      ])('生成に成功する %#', async (data, expected) => {
        const actual = await labelsService.create(data);

        expect(actual).toStrictEqual(expected);
      });
    });
  });

  describe('publishedBook()', () => {
    const expectedLabel = {id: 'label1', name: faker.lorem.words(2)};
    const expectedBook = {id: 'book1', title: faker.lorem.words(2)};

    beforeEach(async () => {
      await neo4jService.write(`CREATE (n:Label) SET n=$expected RETURN *`, {
        expected: expectedLabel,
      });
      await neo4jService.write(`CREATE (n:Book) SET n=$expected RETURN *`, {
        expected: expectedBook,
      });
    });

    it('正常な動作', async () => {
      const actual = await labelsService.labeledBook({
        labelId: expectedLabel.id,
        bookId: expectedBook.id,
      });

      expect(actual.labelId).toBe(expectedLabel.id);
      expect(actual.bookId).toBe(expectedBook.id);

      const neo4jResult = await neo4jService.read(
        `MATCH (:Label {id: $publisherId})-[r: LABELED_BOOK]->(:Book {id: $bookId}) RETURN r`,
        {bookId: expectedBook.id, publisherId: expectedLabel.id},
      );
      expect(neo4jResult.records).toHaveLength(1);
    });

    it('2回同じ操作をすると上書き', async () => {
      const once = await labelsService.labeledBook({
        labelId: expectedLabel.id,
        bookId: expectedBook.id,
      });
      const two = await labelsService.labeledBook({
        labelId: expectedLabel.id,
        bookId: expectedBook.id,
      });

      expect(once.labelId).toBe(expectedLabel.id);
      expect(once.bookId).toBe(expectedBook.id);

      expect(two.labelId).toBe(expectedLabel.id);
      expect(two.bookId).toBe(expectedBook.id);

      const neo4jResult = await neo4jService.read(
        `MATCH (:Label {id: $publisherId})-[r: LABELED_BOOK]->(:Book {id: $bookId}) RETURN r`,
        {bookId: expectedBook.id, publisherId: expectedLabel.id},
      );
      expect(neo4jResult.records).toHaveLength(1);
    });
  });

  describe('getLabeledBooks()', () => {
    describe('一般的な状況', () => {
      const expectedLabel = {id: 'label1', name: 'A'};
      const expectedBooks = [
        {id: 'book1', title: 'A'},
        {id: 'book2', title: 'B'},
        {id: 'book3', title: 'C'},
      ];
      beforeEach(async () => {
        await neo4jService.write(`CREATE (n:Label) SET n=$expected RETURN *`, {
          expected: expectedLabel,
        });
        await Promise.all(
          expectedBooks.map((expectedBook) =>
            neo4jService.write(
              `
              MATCH (l:Label {id: $label.id})
              CREATE (b:Book) SET b=$book
              CREATE (l)-[r:LABELED_BOOK]->(b)
              RETURN *
              `,
              {label: expectedLabel, book: expectedBook},
            ),
          ),
        );
      });

      it.each([
        [
          {skip: 0, limit: 0, except: [], orderBy: {title: OrderBy.ASC}},
          {
            nodes: [],
            hasPrevious: false,
            hasNext: true,
          },
        ],
        [
          {skip: 0, limit: 3, except: [], orderBy: {title: OrderBy.ASC}},
          {
            nodes: [
              {bookId: expectedBooks[0].id, labelId: expectedLabel.id},
              {bookId: expectedBooks[1].id, labelId: expectedLabel.id},
              {bookId: expectedBooks[2].id, labelId: expectedLabel.id},
            ],
            hasPrevious: false,
            hasNext: false,
          },
        ],
        [
          {skip: 0, limit: 3, except: [], orderBy: {title: OrderBy.DESC}},
          {
            nodes: [
              {bookId: expectedBooks[2].id, labelId: expectedLabel.id},
              {bookId: expectedBooks[1].id, labelId: expectedLabel.id},
              {bookId: expectedBooks[0].id, labelId: expectedLabel.id},
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
            nodes: [
              {bookId: expectedBooks[0].id, labelId: expectedLabel.id},
              {bookId: expectedBooks[2].id, labelId: expectedLabel.id},
            ],
            hasPrevious: false,
            hasNext: false,
          },
        ],
        [
          {skip: 0, limit: 1, except: [], orderBy: {title: OrderBy.ASC}},
          {
            nodes: [{bookId: expectedBooks[0].id, labelId: expectedLabel.id}],
            hasPrevious: false,
            hasNext: true,
          },
        ],
        [
          {skip: 1, limit: 1, except: [], orderBy: {title: OrderBy.ASC}},
          {
            nodes: [{bookId: expectedBooks[1].id, labelId: expectedLabel.id}],
            hasPrevious: true,
            hasNext: true,
          },
        ],
        [
          {skip: 3, limit: 3, except: [], orderBy: {title: OrderBy.ASC}},
          {
            nodes: [],
            hasPrevious: true,
            hasNext: false,
          },
        ],
      ])('正常な動作 %j', async (props, expected) => {
        const actual = await labelsService.getLabeledBooks(
          expectedLabel.id,
          props,
        );

        expect(actual.hasPrevious).toBe(expected.hasPrevious);
        expect(actual.hasNext).toBe(expected.hasNext);
        expect(actual.count).toBe(expectedBooks.length);

        expect(actual.nodes).toHaveLength(expected.nodes.length);
        for (const [i, actualPub] of actual.nodes.entries()) {
          expect(actualPub.bookId).toBe(expected.nodes[i].bookId);
          expect(actualPub.labelId).toBe(expected.nodes[i].labelId);
        }
      });
    });
  });

  describe('getLabelIdFromBook()', () => {
    const expectedLabel = {id: 'label1', name: 'A'};
    const expectedBook = {id: 'book1', title: 'A'};
    it('関係が存在するならIDを返す', async () => {
      await neo4jService.write(
        `
        CREATE (l:Label) SET l=$label
        CREATE (b:Book) SET b=$book
        CREATE (l)-[:LABELED_BOOK]->(b)
        RETURN *`,
        {label: expectedLabel, book: expectedBook},
      );
      const actual = await labelsService.getLabelIdFromBook(expectedBook.id);
      expect(actual).toBe(expectedLabel.id);
    });

    it('関係が存在しない場合はnullを返す', async () => {
      await neo4jService.write(
        `
        CREATE (l:Label) SET l=$label
        CREATE (b:Book) SET b=$book
        RETURN *`,
        {label: expectedLabel, book: expectedBook},
      );
      const actual = await labelsService.getLabelIdFromBook(expectedBook.id);
      expect(actual).toBeNull();
    });

    it('bookIdに対応するBookが存在しない場合はnullを返す', async () => {
      await neo4jService.write(
        `
        CREATE (l:Label) SET l=$label
        RETURN *`,
        {label: expectedLabel, book: expectedBook},
      );
      const actual = await labelsService.getLabelIdFromBook(expectedBook.id);
      expect(actual).toBeNull();
    });
  });
});
