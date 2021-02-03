import {Injectable} from '@nestjs/common';
import {int, QueryResult} from 'neo4j-driver';
import {BookEntity} from '../books/book.entity';
import {Neo4jService} from '../neo4j/neo4j.service';
import {SeriesEntity} from '../series/series.entity';
import {SeriesPartEntity} from './series-part.entity';

@Injectable()
export class SeriesPartService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async transferRecords(result: QueryResult): Promise<SeriesPartEntity[]> {
    return result.records.map((record) => ({
      ...record.get('r').properties,
      series: record.get('s').properties,
      book: record.get('b').properties,
    }));
  }

  async getFromBook(
    book: BookEntity,
    {skip = 0, limit = 0}: {skip?: number; limit?: number},
  ): Promise<SeriesPartEntity[]> {
    return this.neo4jService
      .read(
        `
      MATCH (b:Book {id: $book.id})
      MATCH (s)-[r:PART_OF_SERIES]->(b)
      RETURN s,r,b
      SKIP $skip LIMIT $limit
      `,
        {
          book,
          skip: int(skip),
          limit: int(limit),
        },
      )
      .then(this.transferRecords);
  }

  async getFromSeries(
    series: SeriesEntity,
    {skip = 0, limit = 0}: {skip?: number; limit?: number},
  ): Promise<SeriesPartEntity[]> {
    return this.neo4jService
      .read(
        `
      MATCH (s:Series {id: $series.id})
      MATCH (s)-[r:PART_OF_SERIES]->(b)
      RETURN s,r,b
      SKIP $skip LIMIT $limit
      `,
        {
          series,
          skip: int(skip),
          limit: int(limit),
        },
      )
      .then(this.transferRecords);
  }

  async connectSeriesAndBook(
    {bookId, seriesId}: {bookId: string; seriesId: string},
    props: {volume?: number} = {},
  ): Promise<SeriesPartEntity> {
    return this.neo4jService
      .write(
        `
        MATCH (s:Series {id: $seriesId})
        MATCH (b:Book {id: $bookId})
        MERGE (s)-[r:PART_OF_SERIES]->(b)
        SET r = $props
        RETURN s,r,b
      `,
        {bookId, seriesId, props},
      )
      .then(this.transferRecords)
      .then((entities) => entities[0]);
  }
}
