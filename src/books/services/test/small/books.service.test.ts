import {INestApplication} from '@nestjs/common';
import {Test} from '@nestjs/testing';
import {IDService} from '../../../../common/id/id.service';
import {Neo4jService} from '../../../../neo4j/neo4j.service';
import {BooksService} from '../../books.service';

jest.mock('../../../../common/id/id.service');
jest.mock('../../../../neo4j/neo4j.service');

describe(BooksService.name, () => {
  let app: INestApplication;

  let neo4jService: Neo4jService;
  let idService: IDService;

  let booksSerivce: BooksService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [Neo4jService, IDService, BooksService],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    neo4jService = module.get<Neo4jService>(Neo4jService);
    idService = module.get<IDService>(IDService);

    booksSerivce = module.get<BooksService>(BooksService);
  });

  beforeEach(async () => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('to be defined', () => {
    expect(booksSerivce).toBeDefined();
  });
});
