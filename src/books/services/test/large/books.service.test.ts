import {INestApplication} from '@nestjs/common';
import {Test} from '@nestjs/testing';
import * as faker from 'faker';
import {IDModule} from '../../../../common/id/id.module';
import {IDService} from '../../../../common/id/id.service';
import {Neo4jTestModule} from '../../../../neo4j/neo4j-test.module';
import {Neo4jService} from '../../../../neo4j/neo4j.service';
import {BooksService} from '../../books.service';

describe(BooksService.name, () => {
  let app: INestApplication;

  let neo4jService: Neo4jService;
  let idService: IDService;

  let booksSerivce: BooksService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [Neo4jTestModule, IDModule],
      providers: [IDService, BooksService],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    neo4jService = module.get<Neo4jService>(Neo4jService);
    idService = module.get<IDService>(IDService);

    booksSerivce = module.get<BooksService>(BooksService);
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    await neo4jService.write(`MATCH (n) DETACH DELETE n`);
  });

  afterAll(async () => {
    await app.close();
  });

  it('to be defined', () => {
    expect(booksSerivce).toBeDefined();
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
      [
        {title: faker.lorem.words(2), isbn: '9784832272460'},
        {
          id: expect.any(String),
          title: expect.any(String),
          isbn: '9784832272460',
        },
      ],
      [
        {
          title: faker.lorem.words(2),
          subtitle: faker.lorem.words(2),
          isbn: '9784832272460',
        },
        {
          id: expect.any(String),
          title: expect.any(String),
          subtitle: expect.any(String),
          isbn: '9784832272460',
        },
      ],
    ])('生成に成功する %#', async (data, expected) => {
      const actual = await booksSerivce.create(data);

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
          neo4jService.write(`CREATE (b:Book) SET b = $expected RETURN *`, {
            expected,
          }),
        ),
      );
    });

    it('全件取得できる', async () => {
      const actualArray = await booksSerivce.findAll();

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
      await neo4jService.write(
        `CREATE (a:Book {id: $expected.id, title: $expected.title}) RETURN *`,
        {expected},
      );
    });

    it('指定したIDが存在するなら取得できる', async () => {
      const actual = await booksSerivce.findById(expected.id);

      expect(actual.id).toBe(expected.id);
      expect(actual.title).toBe(expected.title);
    });

    it('存在しないIDによって取得しようとすると例外を投げる', async () => {
      await expect(() => booksSerivce.findById('2')).rejects.toThrow(
        /Not Found/,
      );
    });
  });
});
