/* eslint-disable id-length */
import {INestApplication} from '@nestjs/common';
import {Test} from '@nestjs/testing';
import {AuthorsService} from '../../../authors/services/authors.service';
import {BooksService} from '../../../books/services/books.service';
import {IDModule} from '../../../id/id.module';
import {IDService} from '../../../id/id.service';
import {Neo4jTestModule} from '../../../neo4j/neo4j-test.module';
import {Neo4jService} from '../../../neo4j/neo4j.service';
import {PartsOfSeriesModule} from '../../../parts-of-series/parts-of-series.module';
import {PartsOfSeriesService} from '../../../parts-of-series/parts-of-series.service';
import {SeriesService} from '../../../series/services/series.service';
import {AuthorSeriesRelationsService} from '../../author-series-relations.service';

describe(AuthorSeriesRelationsService.name, () => {
  let app: INestApplication;

  let neo4jService: Neo4jService;

  let relationsService: AuthorSeriesRelationsService;

  let authorsService: AuthorsService;
  let seriesService: SeriesService;

  let booksService: BooksService;
  let partsService: PartsOfSeriesService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [Neo4jTestModule, IDModule, PartsOfSeriesModule],
      providers: [
        IDService,
        AuthorSeriesRelationsService,
        BooksService,
        AuthorsService,
        SeriesService,
        PartsOfSeriesService,
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    neo4jService = module.get<Neo4jService>(Neo4jService);

    relationsService = module.get<AuthorSeriesRelationsService>(
      AuthorSeriesRelationsService,
    );

    authorsService = module.get<AuthorsService>(AuthorsService);
    booksService = module.get<BooksService>(BooksService);
    seriesService = module.get<SeriesService>(SeriesService);

    partsService = module.get<PartsOfSeriesService>(PartsOfSeriesService);
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    await neo4jService.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  it('to be defined', () => {
    expect(relationsService).toBeDefined();
  });

  describe('getFromAuthor()', () => {
    it('1:N:1で正常', async () => {
      const author = await authorsService.create({name: 'Author'});
      const series = await seriesService.createSeries({title: 'Series'});

      const books = await Promise.all(
        [...Array.from({length: 10})].map((_, i) =>
          booksService.create({title: `Book ${i}`}),
        ),
      );

      await Promise.all(
        books.map(({id: bookId}) =>
          authorsService.writedBook({bookId, authorId: author.id}),
        ),
      );

      await Promise.all(
        books.map(({id: bookId}) =>
          partsService.connectSeriesAndBook({bookId, seriesId: series.id}),
        ),
      );

      const relations = await relationsService.getFromAuthor(author, {
        skip: 0,
        limit: 10,
      });
      expect(relations).toHaveLength(1);
      for (const relation of relations) {
        expect(relation.author).toStrictEqual(author);
        expect(relation.series).toStrictEqual(series);
      }
    });

    it.each([
      [{M: 4}, {length: 0}],
      [{skip: 0, limit: 8, M: 0}, {length: 0}],
      [{skip: 0, limit: 8, M: 1}, {length: 1}],
      [{skip: 0, limit: 8, M: 4}, {length: 4}],
      [{skip: 4, limit: 4, M: 4}, {length: 0}],
      [{skip: 0, limit: 2, M: 4}, {length: 2}],
      [{skip: 2, limit: 2, M: 4}, {length: 2}],
      [{skip: 4, limit: 2, M: 4}, {length: 0}],
    ])('1:N:Mで正常 %#', async ({M, ...args}, {length: expectedLength}) => {
      const author = await authorsService.create({name: 'Author'});

      const {series} = await Promise.all(
        [...Array.from({length: M})].map(async (_, seriesI) => {
          const series = await seriesService.createSeries({
            title: `Series ${seriesI}`,
          });
          const books = await Promise.all(
            [...Array.from({length: 2})].map((_, bookI) =>
              booksService.create({title: `Book ${seriesI}-${bookI}`}),
            ),
          );
          await Promise.all(
            books.map(({id: bookId}) =>
              authorsService.writedBook({bookId, authorId: author.id}),
            ),
          );
          await Promise.all(
            books.map(({id: bookId}) =>
              partsService.connectSeriesAndBook({bookId, seriesId: series.id}),
            ),
          );
          return {series, books};
        }),
      ).then((relations) => ({series: relations.map(({series}) => series)}));

      const actual = await relationsService.getFromAuthor(author, {...args});
      expect(actual).toHaveLength(expectedLength);
      for (const relation of actual) {
        expect(relation.author).toStrictEqual(author);
        expect(series).toContainEqual(relation.series);
      }
    });
  });

  describe('getFromSeries()', () => {
    it('1:N:1で正常', async () => {
      const author = await authorsService.create({name: 'Author'});
      const series = await seriesService.createSeries({title: 'Series'});

      const books = await Promise.all(
        [...Array.from({length: 10})].map((_, i) =>
          booksService.create({title: `Book ${i}`}),
        ),
      );

      await Promise.all(
        books.map(({id: bookId}) =>
          authorsService.writedBook({bookId, authorId: author.id}),
        ),
      );

      await Promise.all(
        books.map(({id: bookId}) =>
          partsService.connectSeriesAndBook({bookId, seriesId: series.id}),
        ),
      );

      const relations = await relationsService.getFromSeries(series, {
        skip: 0,
        limit: 10,
      });
      expect(relations).toHaveLength(1);
      for (const relation of relations) {
        expect(relation.author).toStrictEqual(author);
        expect(relation.series).toStrictEqual(series);
      }
    });

    it.each([
      [{M: 4}, {length: 0}],
      [{skip: 0, limit: 8, M: 0}, {length: 0}],
      [{skip: 0, limit: 8, M: 1}, {length: 1}],
      [{skip: 0, limit: 8, M: 4}, {length: 4}],
      [{skip: 4, limit: 4, M: 4}, {length: 0}],
      [{skip: 0, limit: 2, M: 4}, {length: 2}],
      [{skip: 2, limit: 2, M: 4}, {length: 2}],
      [{skip: 4, limit: 2, M: 4}, {length: 0}],
    ])('1:N:Mで正常 %#', async ({M, ...args}, {length: expectedLength}) => {
      const series = await seriesService.createSeries({
        title: `Series`,
      });

      const {authors} = await Promise.all(
        [...Array.from({length: M})].map(async (_, authorI) => {
          const author = await authorsService.create({
            name: `Author ${authorI}`,
          });

          const books = await Promise.all(
            [...Array.from({length: 2})].map((_, bookI) =>
              booksService.create({title: `Book ${authorI}-${bookI}`}),
            ),
          );
          await Promise.all(
            books.map(({id: bookId}) =>
              authorsService.writedBook({bookId, authorId: author.id}),
            ),
          );
          await Promise.all(
            books.map(({id: bookId}) =>
              partsService.connectSeriesAndBook({bookId, seriesId: series.id}),
            ),
          );
          return {author, books};
        }),
      ).then((relations) => ({authors: relations.map(({author}) => author)}));

      const actual = await relationsService.getFromSeries(series, {...args});
      expect(actual).toHaveLength(expectedLength);
      for (const relation of actual) {
        expect(relation.series).toStrictEqual(series);
        expect(authors).toContainEqual(relation.author);
      }
    });
  });

  describe('getRelatedBooks()', () => {
    it.each([
      [{books: 10}, {length: 0}],
      [{skip: 0, limit: 0, books: 10}, {length: 0}],
      [{skip: 0, limit: 5, books: 10}, {length: 5}],
      [{skip: 0, limit: 10, books: 10}, {length: 10}],
      [{skip: 0, limit: 20, books: 10}, {length: 10}],
      [{skip: 5, limit: 5, books: 10}, {length: 5}],
      [{skip: 5, limit: 10, books: 10}, {length: 5}],
      [{skip: 10, limit: 10, books: 10}, {length: 0}],
    ])(
      '1:N:1で正常 %#',
      async ({books: booksLength, ...args}, {length: expectedLength}) => {
        const author = await authorsService.create({name: 'Author'});
        const series = await seriesService.createSeries({title: 'Series'});

        const books = await Promise.all(
          [...Array.from({length: booksLength})].map((_, i) =>
            booksService.create({title: `Book ${i}`}),
          ),
        );

        await Promise.all(
          books.map(({id: bookId}) =>
            authorsService.writedBook({bookId, authorId: author.id}),
          ),
        );

        await Promise.all(
          books.map(({id: bookId}) =>
            partsService.connectSeriesAndBook({bookId, seriesId: series.id}),
          ),
        );

        const actual = await relationsService.getRelatedBooks(
          {author, series},
          {...args},
        );
        expect(actual).toHaveLength(expectedLength);
        for (const book of actual) {
          expect(books).toContainEqual(book);
        }
      },
    );
  });
});
