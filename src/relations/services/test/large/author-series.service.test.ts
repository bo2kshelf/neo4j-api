import {INestApplication} from '@nestjs/common';
import {Test} from '@nestjs/testing';
import {OrderBy} from '../../../../common/order-by.enum';
import {Neo4jTestModule} from '../../../../neo4j/neo4j-test.module';
import {Neo4jService} from '../../../../neo4j/neo4j.service';
import {AuthorSeriesRelationsService} from '../../author-series.service';

describe(AuthorSeriesRelationsService.name, () => {
  let app: INestApplication;

  let neo4jService: Neo4jService;
  let relationService: AuthorSeriesRelationsService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [Neo4jTestModule],
      providers: [AuthorSeriesRelationsService],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    neo4jService = module.get<Neo4jService>(Neo4jService);
    relationService = module.get<AuthorSeriesRelationsService>(
      AuthorSeriesRelationsService,
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

  describe('getFromAuthor()', () => {
    beforeEach(async () => {
      await neo4jService.write(`
        CREATE (s1:Series {id: "series1", title: "series1"})
        CREATE (s2:Series {id: "series2", title: "series2"})
        CREATE (s3:Series {id: "series3", title: "series3"})
        CREATE (s1b1:Book {id: "series1-book1"})
        CREATE (s2b1:Book {id: "series2-book1"})
        CREATE (s3b1:Book {id: "series3-book1"})
        CREATE (a1:Author {id: "author1", name: "author1"})
        CREATE (s1b1)-[:IS_PART_OF_SERIES]->(s1)
        CREATE (s2b1)-[:IS_PART_OF_SERIES]->(s2)
        CREATE (s3b1)-[:IS_PART_OF_SERIES]->(s3)
        CREATE (a1)-[:WRITED_BOOK]->(s1b1)
        CREATE (a1)-[:WRITED_BOOK]->(s2b1)
        CREATE (a1)-[:WRITED_BOOK]->(s3b1)
        RETURN *
      `);
    });

    it.each([
      [
        {skip: 0, limit: 0, orderBy: {title: OrderBy.ASC}},
        {
          relations: [],
          hasPrevious: false,
          hasNext: true,
        },
      ],
      [
        {skip: 0, limit: 3, orderBy: {title: OrderBy.ASC}},
        {
          relations: [
            {seriesId: 'series1', authorId: 'author1'},
            {seriesId: 'series2', authorId: 'author1'},
            {seriesId: 'series3', authorId: 'author1'},
          ],
          hasPrevious: false,
          hasNext: false,
        },
      ],
      [
        {skip: 0, limit: 3, orderBy: {title: OrderBy.DESC}},
        {
          relations: [
            {seriesId: 'series3', authorId: 'author1'},
            {seriesId: 'series2', authorId: 'author1'},
            {seriesId: 'series1', authorId: 'author1'},
          ],
          hasPrevious: false,
          hasNext: false,
        },
      ],
      [
        {skip: 1, limit: 1, orderBy: {title: OrderBy.ASC}},
        {
          relations: [{seriesId: 'series2', authorId: 'author1'}],
          hasPrevious: true,
          hasNext: true,
        },
      ],
    ])('正常な動作 %j', async (props, expected) => {
      const actual = await relationService.getFromAuthor('author1', props);

      expect(actual.count).toBe(3);
      expect(actual.hasNext).toBe(expected.hasNext);
      expect(actual.hasPrevious).toBe(expected.hasPrevious);

      for (const [i, actualRelation] of actual.nodes.entries()) {
        expect(actualRelation.seriesId).toBe(expected.relations[i].seriesId);
        expect(actualRelation.authorId).toBe(expected.relations[i].authorId);
      }
    });
  });

  describe('getFromSeries()', () => {
    beforeEach(async () => {
      await neo4jService.write(`
        CREATE (s1:Series {id: "series1", title: "series1"})
        CREATE (s1b1:Book {id: "series1-book1"})
        CREATE (s1b2:Book {id: "series1-book2"})
        CREATE (s1b3:Book {id: "series1-book3"})
        CREATE (a1:Author {id: "author1", name: "author1"})
        CREATE (a2:Author {id: "author2", name: "author2"})
        CREATE (a3:Author {id: "author3", name: "author3"})
        CREATE (s1b1)-[:IS_PART_OF_SERIES]->(s1)
        CREATE (s1b2)-[:IS_PART_OF_SERIES]->(s1)
        CREATE (s1b3)-[:IS_PART_OF_SERIES]->(s1)
        CREATE (a1)-[:WRITED_BOOK]->(s1b1)
        CREATE (a2)-[:WRITED_BOOK]->(s1b2)
        CREATE (a3)-[:WRITED_BOOK]->(s1b3)
        RETURN *
      `);
    });

    it.each([
      [
        {skip: 0, limit: 0, orderBy: {name: OrderBy.ASC}},
        {
          relations: [],
          hasPrevious: false,
          hasNext: true,
        },
      ],
      [
        {skip: 0, limit: 3, orderBy: {name: OrderBy.ASC}},
        {
          relations: [
            {authorId: 'author1', seriesId: 'series1'},
            {authorId: 'author2', seriesId: 'series1'},
            {authorId: 'author3', seriesId: 'series1'},
          ],
          hasPrevious: false,
          hasNext: false,
        },
      ],
      [
        {skip: 0, limit: 3, orderBy: {name: OrderBy.DESC}},
        {
          relations: [
            {authorId: 'author3', seriesId: 'series1'},
            {authorId: 'author2', seriesId: 'series1'},
            {authorId: 'author1', seriesId: 'series1'},
          ],
          hasPrevious: false,
          hasNext: false,
        },
      ],
      [
        {skip: 1, limit: 1, orderBy: {name: OrderBy.ASC}},
        {
          relations: [{authorId: 'author2', seriesId: 'series1'}],
          hasPrevious: true,
          hasNext: true,
        },
      ],
    ])('正常な動作 %j', async (props, expected) => {
      const actual = await relationService.getFromSeries('series1', props);

      expect(actual.count).toBe(3);
      expect(actual.hasNext).toBe(expected.hasNext);
      expect(actual.hasPrevious).toBe(expected.hasPrevious);

      for (const [i, actualRelation] of actual.nodes.entries()) {
        expect(actualRelation.seriesId).toBe(expected.relations[i].seriesId);
        expect(actualRelation.authorId).toBe(expected.relations[i].authorId);
      }
    });
  });
});
