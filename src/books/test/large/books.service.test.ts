import {INestApplication} from '@nestjs/common';
import {Test} from '@nestjs/testing';
import {IDModule} from '../../../id/id.module';
import {IDService} from '../../../id/id.service';
import {Neo4jTestModule} from '../../../neo4j/neo4j-test.module';
import {Neo4jService} from '../../../neo4j/neo4j.service';
import {BookEntity} from '../../book.entity';
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

  describe('createBook()', () => {
    it.each([
      [{title: 'A'}, {id: expect.any(String), title: 'A'}],
      [
        {title: 'A', isbn: '9784832272460'},
        {id: expect.any(String), title: 'A', isbn: '9784832272460'},
      ],
    ])('成功 %#', async (data, expected) => {
      const actual = await booksSerivce.createBook(data);

      expect(actual).toStrictEqual(expected);
    });
  });

  describe('findBookById()', () => {
    let expected: BookEntity;
    beforeEach(async () => {
      expected = await booksSerivce.createBook({title: 'A'});
    });

    it('成功', async () => {
      const actual = await booksSerivce.findBookById(expected.id);
      expect(actual).toStrictEqual(expected);
    });
  });

  describe('findAllBooks()', () => {
    beforeEach(async () => {
      for (let i = 0; i < 10; i++) await booksSerivce.createBook({title: 'A'});
    });

    it('成功', async () => {
      const actual = await booksSerivce.findAllBooks();
      expect(actual).toHaveLength(10);
    });
  });
});
