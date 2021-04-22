import {Injectable} from '@nestjs/common';
import {int} from 'neo4j-driver';
import {OrderBy} from '../../common/order-by.enum';
import {Neo4jService} from '../../neo4j/neo4j.service';
import {LabelEntity} from '../entities/label.entity';

@Injectable()
export class LabelsService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async findById(id: string): Promise<LabelEntity> {
    const result = await this.neo4jService.read(
      `MATCH (n:Label {id: $id}) RETURN n`,
      {id},
    );
    if (result.records.length === 0) throw new Error('Not Found');
    return result.records[0].get(0).properties;
  }

  async findAll(): Promise<LabelEntity[]> {
    return this.neo4jService
      .read(`MATCH (n:Label) RETURN n`)
      .then((res) => res.records.map((record) => record.get(0).properties));
  }

  async getLabeledBooks(
    labelId: string,
    {
      skip,
      limit,
      except,
      orderBy,
    }: {
      skip: number;
      limit: number;
      except: string[];
      orderBy: {title: OrderBy};
    },
  ): Promise<{
    count: number;
    hasNext: boolean;
    hasPrevious: boolean;
    nodes: {
      labelId: any;
      bookId: any;
    }[];
  }> {
    const nodes = await this.neo4jService
      .read(
        `
      MATCH (l:Label {id: $labelId})
      MATCH (l)-[r:LABELED_BOOK]->(b)
      WHERE NOT b.id IN $except
      RETURN l,b,r
      ORDER BY b.title ${orderBy.title}
      SKIP $skip LIMIT $limit
  `,
        {labelId, skip: int(skip), limit: int(limit), except},
      )
      .then((result) =>
        result.records.map((record) => ({
          labelId: record.get('l').properties.id,
          bookId: record.get('b').properties.id,
        })),
      );
    const meta: {
      count: number;
      hasNext: boolean;
      hasPrevious: boolean;
    } = await this.neo4jService
      .read(
        `
      MATCH (:Label {id: $labelId})-[r:LABELED_BOOK]->(:Book)
      WITH count(r) AS count
      RETURN count, 0 < count AND 0 < $skip AS previous, $skip + $limit < count AS next
      `,
        {labelId, skip: int(skip), limit: int(limit)},
      )
      .then((result) => ({
        count: result.records[0].get('count').toNumber(),
        hasNext: result.records[0].get('next'),
        hasPrevious: result.records[0].get('previous'),
      }));
    return {nodes, ...meta};
  }

  async getLabelIdFromBook(bookId: string): Promise<string | null> {
    return this.neo4jService
      .read(
        `OPTIONAL MATCH (l)-[:LABELED_BOOK]->(b:Book {id: $bookId}) RETURN l.id AS l`,
        {bookId},
      )
      .then((result) => result.records[0].get('l'));
  }
}
