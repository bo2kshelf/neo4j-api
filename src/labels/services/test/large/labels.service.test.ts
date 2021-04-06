import {INestApplication} from '@nestjs/common';
import {Test} from '@nestjs/testing';
import * as faker from 'faker';
import {IDModule} from '../../../../common/id/id.module';
import {IDService} from '../../../../common/id/id.service';
import {Neo4jTestModule} from '../../../../neo4j/neo4j-test.module';
import {Neo4jService} from '../../../../neo4j/neo4j.service';
import {LabelsService} from '../../labels.service';

describe(LabelsService.name, () => {
  let app: INestApplication;

  let neo4jService: Neo4jService;
  let idService: IDService;

  let labelsService: LabelsService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [Neo4jTestModule, IDModule],
      providers: [IDService, LabelsService],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    neo4jService = module.get<Neo4jService>(Neo4jService);
    idService = module.get<IDService>(IDService);

    labelsService = module.get<LabelsService>(LabelsService);
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    await neo4jService.write(`MATCH (n) DETACH DELETE n`);
  });

  afterAll(async () => {
    await app.close();
  });

  it('to be defined', () => {
    expect(labelsService).toBeDefined();
  });

  describe('findById()', () => {
    const expected = {id: '1', name: faker.lorem.words(2)};

    beforeEach(async () => {
      await neo4jService.write(`CREATE (p:Label) SET p=$expected RETURN p`, {
        expected,
      });
    });

    it('存在しないIDについて取得しようとすると例外を投げる', async () => {
      await expect(() => labelsService.findById('2')).rejects.toThrow(
        /Not Found/,
      );
    });

    it('指定したIDが存在するなら取得できる', async () => {
      const actual = await labelsService.findById(expected.id);

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
          neo4jService.write(`CREATE (p:Publisher) SET p=$expected RETURN p`, {
            expected,
          }),
        ),
      );
    });

    it('全件取得できる', async () => {
      const actualArray = await labelsService.findAll();

      actualArray.map((actual) => {
        const expected = expectedArray.find(({id}) => id === actual.id)!;

        expect(expected).not.toBeUndefined();
        expect(actual.id).toBe(expected.id);
        expect(actual.name).toBe(expected.name);
      });
    });
  });

  describe('create()', () => {
    it('publishedIdに対してpublisherが存在しない場合例外を投げる', async () => {
      await expect(() =>
        labelsService.create({name: 'A', publisherId: '1'}),
      ).rejects.toThrow(/Publisher Not Found/);
    });

    describe('publisherが存在する場合)', () => {
      const expectedPublisher = {id: '1'};
      beforeEach(async () => {
        await neo4jService.write(
          `CREATE (p:Publisher) SET p=$publisher RETURN p`,
          {publisher: expectedPublisher},
        );
      });

      it.each([
        [
          {name: 'A', publisherId: expectedPublisher.id},
          {id: expect.any(String), name: 'A'},
        ],
      ])('生成に成功する %#', async (data, expected) => {
        const actual = await labelsService.create(data);

        expect(actual).toStrictEqual(expected);
      });
    });
  });
});
