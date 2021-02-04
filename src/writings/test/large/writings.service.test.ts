import {INestApplication} from '@nestjs/common';
import {Test} from '@nestjs/testing';
import {AuthorsService} from '../../../authors/authors.service';
import {BooksService} from '../../../books/books.service';
import {IDModule} from '../../../id/id.module';
import {IDService} from '../../../id/id.service';
import {Neo4jTestModule} from '../../../neo4j/neo4j-test.module';
import {Neo4jService} from '../../../neo4j/neo4j.service';
import {WritingsService} from '../../writings.service';

describe(WritingsService.name, () => {
  let app: INestApplication;

  let neo4jService: Neo4jService;
  let idService: IDService;

  let writingService: WritingsService;
  let authorsService: AuthorsService;
  let booksService: BooksService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [Neo4jTestModule, IDModule],
      providers: [IDService, WritingsService, BooksService, AuthorsService],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    neo4jService = module.get<Neo4jService>(Neo4jService);
    idService = module.get<IDService>(IDService);

    writingService = module.get<WritingsService>(WritingsService);
    authorsService = module.get<AuthorsService>(AuthorsService);
    booksService = module.get<BooksService>(BooksService);
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    await neo4jService.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  it('to be defined', () => {
    expect(writingService).toBeDefined();
  });
});
