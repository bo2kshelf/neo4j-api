import {INestApplication} from '@nestjs/common';
import {Test} from '@nestjs/testing';
import {IDModule} from '../../../../common/id/id.module';
import {IDService} from '../../../../common/id/id.service';
import {Neo4jTestModule} from '../../../../neo4j/neo4j-test.module';
import {Neo4jService} from '../../../../neo4j/neo4j.service';
import {PublisherEntity} from '../../../entities/publisher.entity';
import {PublishersService} from '../../publishers.service';

describe(PublishersService.name, () => {
  let app: INestApplication;

  let neo4jService: Neo4jService;
  let idService: IDService;

  let publishersService: PublishersService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [Neo4jTestModule, IDModule],
      providers: [IDService, PublishersService],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    neo4jService = module.get<Neo4jService>(Neo4jService);
    idService = module.get<IDService>(IDService);

    publishersService = module.get<PublishersService>(PublishersService);
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    await neo4jService.write(`MATCH (n) DETACH DELETE n`);
  });

  afterAll(async () => {
    await app.close();
  });

  it('to be defined', () => {
    expect(publishersService).toBeDefined();
  });

  describe('createPublisher()', () => {
    it.each([[{name: 'A'}, {id: expect.any(String), name: 'A'}]])(
      '成功 %#',
      async (data, expected) => {
        const actual = await publishersService.create(data);
        expect(actual).toStrictEqual(expected);
      },
    );
  });

  describe('getPublisherById()', () => {
    let expected: PublisherEntity;
    beforeEach(async () => {
      expected = await publishersService.create({name: 'A'});
    });

    it('成功', async () => {
      const actual = await publishersService.findById(expected.id);
      expect(actual).toStrictEqual(expected);
    });
  });

  describe('getAllPublishers()', () => {
    beforeEach(async () => {
      for (let i = 0; i < 10; i++) await publishersService.create({name: 'A'});
    });

    it('成功', async () => {
      const actual = await publishersService.findAll();
      expect(actual).toHaveLength(10);
    });
  });
});
