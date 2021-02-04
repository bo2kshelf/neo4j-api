import {INestApplication} from '@nestjs/common';
import {Test} from '@nestjs/testing';
import {BooksService} from '../../../books/books.service';
import {IDModule} from '../../../id/id.module';
import {IDService} from '../../../id/id.service';
import {Neo4jTestModule} from '../../../neo4j/neo4j-test.module';
import {Neo4jService} from '../../../neo4j/neo4j.service';
import {SeriesService} from '../../../series/series.service';
import {PartsOfSeriesService} from '../../parts-of-series.service';

describe(PartsOfSeriesService.name, () => {
  let app: INestApplication;

  let neo4jService: Neo4jService;
  let idService: IDService;

  let partsService: PartsOfSeriesService;
  let seriesService: SeriesService;
  let booksService: BooksService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [Neo4jTestModule, IDModule],
      providers: [IDService, PartsOfSeriesService, BooksService, SeriesService],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    neo4jService = module.get<Neo4jService>(Neo4jService);
    idService = module.get<IDService>(IDService);

    partsService = module.get<PartsOfSeriesService>(PartsOfSeriesService);
    seriesService = module.get<SeriesService>(SeriesService);
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
    expect(partsService).toBeDefined();
  });

  describe('connectSeriesAndBook()', () => {
    it.each([[{}], [{volume: 1}]])('成功 %#', async (props) => {
      const series = await seriesService.createSeries({title: 'Series'});
      const book = await booksService.createBook({title: `Book`});

      const actual = await partsService.connectSeriesAndBook(
        {
          seriesId: series.id,
          bookId: book.id,
        },
        props,
      );

      expect(actual).toStrictEqual({
        book: expect.anything(),
        series: expect.anything(),
        ...props,
      });
      expect(actual.series).toStrictEqual({
        id: expect.any(String),
        title: 'Series',
      });
      expect(actual.book).toStrictEqual({
        id: expect.any(String),
        title: 'Book',
      });
    });
  });

  describe('getFromSeries()', () => {
    it.each([
      [{}, {length: 0}],
      [{skip: 0}, {length: 0}],
      [{limit: 0}, {length: 0}],
      [{limit: 10}, {length: 10}],
      [{skip: 0, limit: 0}, {length: 0}],
      [{skip: 0, limit: 5}, {length: 5}],
      [{skip: 0, limit: 10}, {length: 10}],
      [{skip: 0, limit: 20}, {length: 10}],
      [{skip: 5, limit: 0}, {length: 0}],
      [{skip: 5, limit: 5}, {length: 5}],
      [{skip: 5, limit: 10}, {length: 5}],
      [{skip: 10, limit: 5}, {length: 0}],
    ])('1:Nで成功 %#', async (args, expected) => {
      const series1 = await seriesService.createSeries({title: 'Series 1'});
      const series2 = await seriesService.createSeries({title: 'Series 2'});
      const books1 = await Promise.all(
        [...Array.from({length: 10})].map((_, i) =>
          booksService.createBook({title: `Book 1-${i}`}),
        ),
      );
      const books2 = await Promise.all(
        [...Array.from({length: 10})].map((_, i) =>
          booksService.createBook({title: `Book 1-${i}`}),
        ),
      );

      await Promise.all(
        books1.map((book) =>
          partsService.connectSeriesAndBook({
            seriesId: series1.id,
            bookId: book.id,
          }),
        ),
      );

      await Promise.all(
        books2.map((book) =>
          partsService.connectSeriesAndBook({
            seriesId: series2.id,
            bookId: book.id,
          }),
        ),
      );

      const actual = await partsService.getFromSeries(series1, args);
      expect(actual).toHaveLength(expected.length);
      for (const connection of actual) {
        expect(series1).toStrictEqual(connection.series);
        expect(books1).toContainEqual(connection.book);
      }
    });
  });

  describe('getFromBook()', () => {
    it.each([
      [{}, {length: 0}],
      [{skip: 0}, {length: 0}],
      [{limit: 1}, {length: 1}],
      [{skip: 0, limit: 0}, {length: 0}],
      [{skip: 0, limit: 1}, {length: 1}],
      [{skip: 0, limit: 2}, {length: 1}],
      [{skip: 1, limit: 1}, {length: 0}],
    ])('1:Nで成功 %#', async (args, expected) => {
      const series1 = await seriesService.createSeries({title: 'Series 1'});
      const series2 = await seriesService.createSeries({title: 'Series 2'});
      const books1 = await Promise.all(
        [...Array.from({length: 10})].map((_, i) =>
          booksService.createBook({title: `Book 1-${i}`}),
        ),
      );
      const books2 = await Promise.all(
        [...Array.from({length: 10})].map((_, i) =>
          booksService.createBook({title: `Book 2-${i}`}),
        ),
      );

      await Promise.all(
        books1.map((book) =>
          partsService.connectSeriesAndBook({
            seriesId: series1.id,
            bookId: book.id,
          }),
        ),
      );

      await Promise.all(
        books2.map((book) =>
          partsService.connectSeriesAndBook({
            seriesId: series2.id,
            bookId: book.id,
          }),
        ),
      );

      for (const book of books1) {
        const actual = await partsService.getFromBook(book, args);
        expect(actual).toHaveLength(expected.length);
        for (const connection of actual) {
          expect(connection.book).toStrictEqual(book);
          expect(connection.series).toStrictEqual(series1);
        }
      }
    });

    it.each([
      [{skip: 0, limit: 1}, {length: 1}],
      [{skip: 0, limit: 2}, {length: 2}],
      [{skip: 1, limit: 1}, {length: 1}],
      [{skip: 1, limit: 2}, {length: 1}],
    ])('M:Nで成功 %#', async (args, expected) => {
      const series1 = await seriesService.createSeries({title: 'Series 1'});
      const series2 = await seriesService.createSeries({title: 'Series 2'});
      const books1 = await Promise.all(
        [...Array.from({length: 10})].map((_, i) =>
          booksService.createBook({title: `Book 1-${i}`}),
        ),
      );

      await Promise.all(
        books1.map((book) =>
          partsService.connectSeriesAndBook({
            seriesId: series1.id,
            bookId: book.id,
          }),
        ),
      );

      await Promise.all(
        books1.map((book) =>
          partsService.connectSeriesAndBook({
            seriesId: series2.id,
            bookId: book.id,
          }),
        ),
      );

      for (const book of books1) {
        const actual = await partsService.getFromBook(book, args);
        expect(actual).toHaveLength(expected.length);
        for (const connection of actual) {
          expect(connection.book).toStrictEqual(book);
          expect([series1, series2]).toContainEqual(connection.series);
        }
      }
    });
  });
});
