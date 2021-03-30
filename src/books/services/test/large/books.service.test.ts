import {INestApplication} from '@nestjs/common';
import {Test} from '@nestjs/testing';
import * as faker from 'faker';
import {IDModule} from '../../../../id/id.module';
import {IDService} from '../../../../id/id.service';
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
    await neo4jService.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  it('to be defined', () => {
    expect(booksSerivce).toBeDefined();
  });

  describe('create()', () => {
    const expectedId = '1';
    beforeEach(() => {
      jest.spyOn(idService, 'generate').mockReturnValueOnce(expectedId);
    });

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
    it('10件作成して，10件取得できる', async () => {
      for (let i = 0; i < 10; i++)
        await booksSerivce.create({title: faker.lorem.words(2)});

      const actual = await booksSerivce.findAll();
      expect(actual).toHaveLength(10);
    });
  });

  describe('findById()', () => {
    it('1件作成して，そのIDによって取得できる', async () => {
      const expected = await booksSerivce.create({
        title: faker.lorem.words(2),
      });

      const actual = await booksSerivce.findById(expected.id);

      expect(actual.id).toBe(expected.id);
      expect(actual.title).toBe(expected.title);
    });

    it('存在しないIDによって取得しようとすると例外を投げる', async () => {
      const created = await booksSerivce.create({
        title: faker.lorem.words(2),
      });

      const failedId = `-${created.id}`;
      await expect(() => booksSerivce.findById(failedId)).rejects.toThrow(
        /Not Found/,
      );
    });
  });
});
