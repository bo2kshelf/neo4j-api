import {INestApplication} from '@nestjs/common';
import {Test} from '@nestjs/testing';
import * as faker from 'faker';
import {IDModule} from '../../../../common/id/id.module';
import {IDService} from '../../../../common/id/id.service';
import {Neo4jTestModule} from '../../../../neo4j/neo4j-test.module';
import {Neo4jService} from '../../../../neo4j/neo4j.service';
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
      [{}, {roles: []}],
      [{roles: ['翻訳']}, {roles: ['翻訳']}],
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
      const rightProps = {roles: ['RightRole']};
      await authorsService.writedBook(
        {authorId: 'author1', bookId: 'book1'},
        {roles: ['FakeRole']},
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
});
