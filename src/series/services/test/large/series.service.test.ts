import {INestApplication} from '@nestjs/common';
import {Test} from '@nestjs/testing';
import {IDModule} from '../../../../common/id/id.module';
import {IDService} from '../../../../common/id/id.service';
import {Neo4jTestModule} from '../../../../neo4j/neo4j-test.module';
import {Neo4jService} from '../../../../neo4j/neo4j.service';
import {SeriesEntity} from '../../../entities/series.entity';
import {SeriesService} from '../../series.service';

describe(SeriesService.name, () => {
  let app: INestApplication;

  let neo4jService: Neo4jService;
  let idService: IDService;

  let seriesService: SeriesService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [Neo4jTestModule, IDModule],
      providers: [IDService, SeriesService],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    neo4jService = module.get<Neo4jService>(Neo4jService);
    idService = module.get<IDService>(IDService);

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

  describe('createSeries()', () => {
    it.each([[{title: 'A'}, {id: expect.any(String), title: 'A'}]])(
      '成功 %#',
      async (data, expected) => {
        const actual = await seriesService.createSeries(data);

        expect(actual).toStrictEqual(expected);
      },
    );
  });

  describe('findSeriesById()', () => {
    let expected: SeriesEntity;
    beforeEach(async () => {
      expected = await seriesService.createSeries({title: 'A'});
    });

    it('成功', async () => {
      const actual = await seriesService.findById(expected.id);
      expect(actual).toStrictEqual(expected);
    });
  });

  describe('findAllSeries()', () => {
    beforeEach(async () => {
      for (let i = 0; i < 10; i++)
        await seriesService.createSeries({title: 'A'});
    });

    it('成功', async () => {
      const actual = await seriesService.findAllSeries();
      expect(actual).toHaveLength(10);
    });
  });
});
