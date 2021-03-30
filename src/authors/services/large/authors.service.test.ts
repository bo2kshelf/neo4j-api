import {INestApplication} from '@nestjs/common';
import {Test} from '@nestjs/testing';
import {IDModule} from '../../../id/id.module';
import {IDService} from '../../../id/id.service';
import {Neo4jTestModule} from '../../../neo4j/neo4j-test.module';
import {Neo4jService} from '../../../neo4j/neo4j.service';
import {AuthorEntity} from '../../entities/author.entity';
import {AuthorsService} from '../authors.service';

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

    await neo4jService.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  it('to be defined', () => {
    expect(authorsService).toBeDefined();
  });

  describe('createSeries()', () => {
    it.each([[{name: 'A'}, {id: expect.any(String), name: 'A'}]])(
      '成功 %#',
      async (data, expected) => {
        const actual = await authorsService.create(data);

        expect(actual).toStrictEqual(expected);
      },
    );
  });

  describe('findAuthorById()', () => {
    let expected: AuthorEntity;
    beforeEach(async () => {
      expected = await authorsService.create({name: 'A'});
    });

    it('成功', async () => {
      const actual = await authorsService.findById(expected.id);
      expect(actual).toStrictEqual(expected);
    });
  });

  describe('findAllSeries()', () => {
    beforeEach(async () => {
      for (let i = 0; i < 10; i++) await authorsService.create({name: 'A'});
    });

    it('成功', async () => {
      const actual = await authorsService.findAll();
      expect(actual).toHaveLength(10);
    });
  });
});
