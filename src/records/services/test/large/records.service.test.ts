import {INestApplication} from '@nestjs/common';
import {Test} from '@nestjs/testing';
import {IDService} from '../../../../common/id/id.service';
import {OrderBy} from '../../../../common/order-by.enum';
import {Neo4jTestModule} from '../../../../neo4j/neo4j-test.module';
import {Neo4jService} from '../../../../neo4j/neo4j.service';
import {RecordsService} from '../../records.service';

describe(RecordsService.name, () => {
  let app: INestApplication;

  let neo4jService: Neo4jService;

  let recordsService: RecordsService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [Neo4jTestModule],
      providers: [IDService, RecordsService],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    neo4jService = module.get<Neo4jService>(Neo4jService);

    recordsService = module.get<RecordsService>(RecordsService);
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    await neo4jService.write(`MATCH (n) DETACH DELETE n`);
  });

  afterAll(async () => {
    await app.close();
  });

  it('to be defined', () => {
    expect(recordsService).toBeDefined();
  });

  describe('findById()', () => {
    const expected = {id: '1'};

    beforeEach(async () => {
      await neo4jService.write(`CREATE (r:Record) SET r=$expected RETURN r`, {
        expected,
      });
    });

    it('存在しないIDについて取得しようとすると例外を投げる', async () => {
      await expect(() => recordsService.findById('2')).rejects.toThrow(
        /Not Found/,
      );
    });

    it('指定したIDが存在するなら取得できる', async () => {
      const actual = await recordsService.findById(expected.id);

      expect(actual.id).toBe(expected.id);
    });
  });

  describe('findAll()', () => {
    const expectedArray = [
      {id: '1'},
      {id: '2'},
      {id: '3'},
      {id: '4'},
      {id: '5'},
    ];

    beforeEach(async () => {
      await Promise.all(
        expectedArray.map((expected) =>
          neo4jService.write(`CREATE (s:Record) SET s = $expected RETURN *`, {
            expected,
          }),
        ),
      );
    });

    it('全件取得できる', async () => {
      const actualArray = await recordsService.findAll();

      actualArray.map((actual) => {
        const expected = expectedArray.find(({id}) => id === actual.id)!;

        expect(expected).not.toBeUndefined();
        expect(actual.id).toBe(expected.id);
      });
    });
  });

  describe('getUserIdByRecord()', () => {
    it('record idからuser idを取得', async () => {
      await neo4jService.write(
        `
        CREATE (u:User {id:"user1"}), (b:Book {id:"book1"})
        CREATE (u)-[:RECORDED]->(:Record {id: "record1"})-[:RECORD_OF]->(b)
        `,
      );
      const actual = await recordsService.getUserIdByRecord('record1');
      expect(actual).toBe('user1');
    });

    it('存在しないIDについて取得しようとすると例外を投げる', async () => {
      await expect(() =>
        recordsService.getUserIdByRecord('record2'),
      ).rejects.toThrow(/Not Found/);
    });
  });

  describe('getBookIdByRecord()', () => {
    it('record book idを取得', async () => {
      await neo4jService.write(
        `
        CREATE (u:User {id:"user1"}), (b:Book {id:"book1"})
        CREATE (u)-[:RECORDED]->(:Record {id: "record1"})-[:RECORD_OF]->(b)
        `,
      );
      const actual = await recordsService.getBookIdByRecord('record1');
      expect(actual).toBe('book1');
    });

    it('存在しないIDについて取得しようとすると例外を投げる', async () => {
      await expect(() =>
        recordsService.getBookIdByRecord('record2'),
      ).rejects.toThrow(/Not Found/);
    });
  });

  describe('createRecord()', () => {
    it('日付のある1回目の追加', async () => {
      await neo4jService.write(
        `
        CREATE (u:User {id:"user1"}), (b:Book {id:"book1"})
        `,
      );
      const actual = await recordsService.createRecord(
        {userId: 'user1', bookId: 'book1'},
        {readAt: '2020-01-01'},
      );
      expect(actual.id).toStrictEqual(expect.any(String));
      expect(actual.readAt).toBe('2020-01-01');
    });

    it('日付のない1回目の追加', async () => {
      await neo4jService.write(
        `
        CREATE (u:User {id:"user1"}), (b:Book {id:"book1"})
        `,
      );
      const actual = await recordsService.createRecord(
        {userId: 'user1', bookId: 'book1'},
        {},
      );
      expect(actual.id).toStrictEqual(expect.any(String));
      expect(actual.readAt).toBeNull();
    });

    it('1回目とは別の日付で2回目を登録すると別のRecordとして扱われる', async () => {
      await neo4jService.write(
        `
        CREATE (u:User {id:"user1"}), (b:Book {id:"book1"})
        CREATE (u)-[:RECORDED]->(:Record {id: "record1", readAt: "2019-01-01"})-[:RECORD_OF]->(b)
        `,
      );
      const actual = await recordsService.createRecord(
        {userId: 'user1', bookId: 'book1'},
        {readAt: '2020-01-01'},
      );
      expect(actual.id).not.toBe('record1');
      expect(actual.id).toStrictEqual(expect.any(String));
      expect(actual.readAt).toBe('2020-01-01');

      const count = await neo4jService
        .read(
          `MATCH p=()-[:RECORDED]->()-[:RECORD_OF]->() RETURN count(p) AS count`,
        )
        .then(({records}) => records[0].get('count').toNumber());
      expect(count).toBe(2);
    });

    it('1回目と同じ日付で2回目を登録するとid以外を上書きとして扱われる', async () => {
      await neo4jService.write(
        `
        CREATE (u:User {id:"user1"}), (b:Book {id:"book1"})
        CREATE (u)-[:RECORDED]->(:Record {id: "record1", readAt: "2020-01-01"})-[:RECORD_OF]->(b)
        `,
      );
      const actual = await recordsService.createRecord(
        {userId: 'user1', bookId: 'book1'},
        {readAt: '2020-01-01'},
      );
      expect(actual.id).toBe('record1');
      expect(actual.readAt).toBe('2020-01-01');

      const count = await neo4jService
        .read(
          `MATCH p=()-[:RECORDED]->()-[:RECORD_OF]->() RETURN count(p) AS count`,
        )
        .then(({records}) => records[0].get('count').toNumber());
      expect(count).toBe(1);
    });

    it('日付のない記録をした後で日付がある2回目の記録をすると別の記録として扱われる', async () => {
      await neo4jService.write(
        `
        CREATE (u:User {id:"user1"}), (b:Book {id:"book1"})
        CREATE (u)-[:RECORDED]->(:Record {id: "record1"})-[:RECORD_OF]->(b)
        `,
      );
      const actual = await recordsService.createRecord(
        {userId: 'user1', bookId: 'book1'},
        {readAt: '2020-01-01'},
      );
      expect(actual.id).not.toBe('record1');
      expect(actual.id).toStrictEqual(expect.any(String));
      expect(actual.readAt).toBe('2020-01-01');

      const count = await neo4jService
        .read(
          `MATCH p=()-[:RECORDED]->()-[:RECORD_OF]->() RETURN count(p) AS count`,
        )
        .then(({records}) => records[0].get('count').toNumber());
      expect(count).toBe(2);
    });

    it('日付のない記録をした後で日付がない2回目の記録をすると別の記録として扱われる', async () => {
      await neo4jService.write(
        `
        CREATE (u:User {id:"user1"}), (b:Book {id:"book1"})
        CREATE (u)-[:RECORDED]->(:Record {id: "record1"})-[:RECORD_OF]->(b)
        `,
      );
      const actual = await recordsService.createRecord(
        {userId: 'user1', bookId: 'book1'},
        {},
      );
      expect(actual.id).not.toBe('record1');
      expect(actual.id).toStrictEqual(expect.any(String));
      expect(actual.readAt).toBeNull();

      const count = await neo4jService
        .read(
          `MATCH p=()-[:RECORDED]->()-[:RECORD_OF]->() RETURN count(p) AS count`,
        )
        .then(({records}) => records[0].get('count').toNumber());
      expect(count).toBe(2);
    });

    it('日付のある記録がある状態で日付がない2回目の記録をすると別の記録として扱われる', async () => {
      await neo4jService.write(
        `
        CREATE (u:User {id:"user1"}), (b:Book {id:"book1"})
        CREATE (u)-[:RECORDED]->(:Record {id: "record1", readAt: "2020-01-01"})-[:RECORD_OF]->(b)
        `,
      );
      const actual = await recordsService.createRecord(
        {userId: 'user1', bookId: 'book1'},
        {},
      );
      expect(actual.id).not.toBe('record1');
      expect(actual.id).toStrictEqual(expect.any(String));
      expect(actual.readAt).toBeNull();

      const count = await neo4jService
        .read(
          `MATCH p=()-[:RECORDED]->()-[:RECORD_OF]->() RETURN count(p) AS count`,
        )
        .then(({records}) => records[0].get('count').toNumber());
      expect(count).toBe(2);
    });
  });

  describe('getReadBooksFromUser()', () => {
    beforeEach(async () => {
      await neo4jService.write(
        `
        CREATE (u:User {id: "user1"})
        CREATE (b1:Book {id: "book1", title: "A"})
        CREATE (b2:Book {id: "book2", title: "B"})
        CREATE (b3:Book {id: "book3", title: "C"})
        CREATE (u)-[:RECORDED]->(r1:Record {id: "record1"})-[:RECORD_OF]->(b1)
        CREATE (u)-[:RECORDED]->(r2:Record {id: "record2"})-[:RECORD_OF]->(b2)
        CREATE (u)-[:RECORDED]->(r3:Record {id: "record3"})-[:RECORD_OF]->(b3)
        RETURN *
        `,
      );
    });

    it.each([
      [
        {
          skip: 0,
          limit: 0,
          orderBy: {title: OrderBy.ASC},
        },
        {
          books: [],
          hasPrevious: false,
          hasNext: true,
        },
      ],
      [
        {
          skip: 0,
          limit: 3,
          orderBy: {title: OrderBy.ASC},
        },
        {
          books: ['book1', 'book2', 'book3'],
          hasPrevious: false,
          hasNext: false,
        },
      ],
      [
        {
          skip: 0,
          limit: 3,
          orderBy: {title: OrderBy.DESC},
        },
        {
          books: ['book3', 'book2', 'book1'],
          hasPrevious: false,
          hasNext: false,
        },
      ],
      [
        {
          skip: 0,
          limit: 1,
          orderBy: {title: OrderBy.ASC},
        },
        {
          books: ['book1'],
          hasPrevious: false,
          hasNext: true,
        },
      ],
      [
        {
          skip: 1,
          limit: 1,
          orderBy: {title: OrderBy.ASC},
        },
        {
          books: ['book2'],
          hasPrevious: true,
          hasNext: true,
        },
      ],
      [
        {
          skip: 3,
          limit: 3,
          orderBy: {title: OrderBy.ASC},
        },
        {
          books: [],
          hasPrevious: true,
          hasNext: false,
        },
      ],
    ])('正常な動作 %j', async (props, expected) => {
      const actual = await recordsService.getReadBooksFromUser('user1', props);

      expect(actual.hasPrevious).toBe(expected.hasPrevious);
      expect(actual.hasNext).toBe(expected.hasNext);
      expect(actual.count).toBe(3);

      expect(actual.nodes).toHaveLength(expected.books.length);
      for (const [i, {id}] of actual.nodes.entries()) {
        expect(id).toBe(expected.books[i]);
      }
    });
  });

  describe('getRecordsFromUser()', () => {
    beforeEach(async () => {
      await neo4jService.write(
        `
        CREATE (u:User {id: "user1"})
        CREATE (b1:Book {id: "book1", title: "A"})
        CREATE (b2:Book {id: "book2", title: "B"})
        CREATE (b3:Book {id: "book3", title: "C"})
        CREATE (u)-[:RECORDED]->(r1:Record {id: "record1", readAt: "2020-01-01"})-[:RECORD_OF]->(b1)
        CREATE (u)-[:RECORDED]->(r2:Record {id: "record2", readAt: "2020-01-02"})-[:RECORD_OF]->(b2)
        CREATE (u)-[:RECORDED]->(r3:Record {id: "record3", readAt: "2020-01-03"})-[:RECORD_OF]->(b3)
        RETURN *
        `,
      );
    });

    it.each([
      [
        {
          skip: 0,
          limit: 0,
          orderBy: {readAt: OrderBy.ASC},
        },
        {
          records: [],
          hasPrevious: false,
          hasNext: true,
        },
      ],
      [
        {
          skip: 0,
          limit: 3,
          orderBy: {readAt: OrderBy.ASC},
        },
        {
          records: ['record1', 'record2', 'record3'],
          hasPrevious: false,
          hasNext: false,
        },
      ],
      [
        {
          skip: 0,
          limit: 3,
          orderBy: {readAt: OrderBy.DESC},
        },
        {
          records: ['record3', 'record2', 'record1'],
          hasPrevious: false,
          hasNext: false,
        },
      ],
      [
        {
          skip: 0,
          limit: 1,
          orderBy: {readAt: OrderBy.ASC},
        },
        {
          records: ['record1'],
          hasPrevious: false,
          hasNext: true,
        },
      ],
      [
        {
          skip: 1,
          limit: 1,
          orderBy: {readAt: OrderBy.ASC},
        },
        {
          records: ['record2'],
          hasPrevious: true,
          hasNext: true,
        },
      ],
      [
        {
          skip: 3,
          limit: 3,
          orderBy: {readAt: OrderBy.ASC},
        },
        {
          records: [],
          hasPrevious: true,
          hasNext: false,
        },
      ],
    ])('正常な動作 %j', async (props, expected) => {
      const actual = await recordsService.getRecordsFromUser('user1', props);

      expect(actual.hasPrevious).toBe(expected.hasPrevious);
      expect(actual.hasNext).toBe(expected.hasNext);
      expect(actual.count).toBe(3);

      expect(actual.nodes).toHaveLength(expected.records.length);
      for (const [i, {id}] of actual.nodes.entries()) {
        expect(id).toBe(expected.records[i]);
      }
    });
  });
});
