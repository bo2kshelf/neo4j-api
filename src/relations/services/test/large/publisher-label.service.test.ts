import {INestApplication} from '@nestjs/common';
import {Test} from '@nestjs/testing';
import {OrderBy} from '../../../../common/order-by.enum';
import {Neo4jTestModule} from '../../../../neo4j/neo4j-test.module';
import {Neo4jService} from '../../../../neo4j/neo4j.service';
import {PublisherLabelRelationsService} from '../../publisher-label.service';

describe(PublisherLabelRelationsService.name, () => {
  let app: INestApplication;

  let neo4jService: Neo4jService;
  let relationService: PublisherLabelRelationsService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [Neo4jTestModule],
      providers: [PublisherLabelRelationsService],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    neo4jService = module.get<Neo4jService>(Neo4jService);
    relationService = module.get<PublisherLabelRelationsService>(
      PublisherLabelRelationsService,
    );
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    await neo4jService.write(`MATCH (n) DETACH DELETE n`);
  });

  afterAll(async () => {
    await app.close();
  });

  it('to be defined', () => {
    expect(relationService).toBeDefined();
  });

  describe('getLabelsFromPublisher()', () => {
    beforeEach(async () => {
      await neo4jService.write(`
        CREATE (p:Publisher {id: "publisher1", name: "series1"})
        CREATE (l1:Label {id: "label1", name: "label1"})
        CREATE (l2:Label {id: "label2", name: "label2"})
        CREATE (l3:Label {id: "label3", name: "label3"})
        CREATE (p)-[:HAS_LABEL]->(l1)
        CREATE (p)-[:HAS_LABEL]->(l2)
        CREATE (p)-[:HAS_LABEL]->(l3)
        RETURN *
      `);
    });

    it.each([
      [
        {skip: 0, limit: 0, except: [], orderBy: {name: OrderBy.ASC}},
        {
          relations: [],
          hasPrevious: false,
          hasNext: true,
        },
      ],
      [
        {skip: 0, limit: 3, except: [], orderBy: {name: OrderBy.ASC}},
        {
          relations: [
            {labelId: 'label1', publisherId: 'publisher1'},
            {labelId: 'label2', publisherId: 'publisher1'},
            {labelId: 'label3', publisherId: 'publisher1'},
          ],
          hasPrevious: false,
          hasNext: false,
        },
      ],
      [
        {skip: 0, limit: 3, except: ['label2'], orderBy: {name: OrderBy.ASC}},
        {
          relations: [
            {labelId: 'label1', publisherId: 'publisher1'},
            {labelId: 'label3', publisherId: 'publisher1'},
          ],
          hasPrevious: false,
          hasNext: false,
        },
      ],
      [
        {skip: 0, limit: 3, except: [], orderBy: {name: OrderBy.DESC}},
        {
          relations: [
            {labelId: 'label3', publisherId: 'publisher1'},
            {labelId: 'label2', publisherId: 'publisher1'},
            {labelId: 'label1', publisherId: 'publisher1'},
          ],
          hasPrevious: false,
          hasNext: false,
        },
      ],
      [
        {skip: 1, limit: 1, except: [], orderBy: {name: OrderBy.ASC}},
        {
          relations: [{labelId: 'label2', publisherId: 'publisher1'}],
          hasPrevious: true,
          hasNext: true,
        },
      ],
    ])('正常な動作 %j', async (props, expected) => {
      const actual = await relationService.getLabelsFromPublisher(
        'publisher1',
        props,
      );

      expect(actual.count).toBe(3);
      expect(actual.hasNext).toBe(expected.hasNext);
      expect(actual.hasPrevious).toBe(expected.hasPrevious);

      for (const [i, actualRelation] of actual.nodes.entries()) {
        expect(actualRelation.publisherId).toBe(
          expected.relations[i].publisherId,
        );
        expect(actualRelation.labelId).toBe(expected.relations[i].labelId);
      }
    });
  });

  describe('getPublisherFromLabel()', () => {
    beforeEach(async () => {
      await neo4jService.write(`
        CREATE (p:Publisher {id: "publisher1"})
        CREATE (l:Label {id: "label1"})
        CREATE (p)-[:HAS_LABEL]->(l)
        RETURN *
      `);
    });

    it('正常に取得する', async () => {
      const actual = await relationService.getPublisherFromLabel('label1');

      expect(actual.publisherId).toBe('publisher1');
      expect(actual.labelId).toBe('label1');
    });

    it('存在しないLabelのIDについて取得しようとすると例外を投げる', async () => {
      await expect(() =>
        relationService.getPublisherFromLabel('label2'),
      ).rejects.toThrow(/Not Found/);
    });
  });
});
