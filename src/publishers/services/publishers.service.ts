import {Injectable} from '@nestjs/common';
import {int} from 'neo4j-driver';
import {IDService} from '../../common/id/id.service';
import {OrderBy} from '../../common/order-by.enum';
import {Neo4jService} from '../../neo4j/neo4j.service';
import {PublicationEntity} from '../entities/publication.entity';
import {PublisherEntity} from '../entities/publisher.entity';

@Injectable()
export class PublishersService {
  constructor(
    private readonly neo4jService: Neo4jService,
    private readonly idService: IDService,
  ) {}

  async findById(id: string): Promise<PublisherEntity> {
    const result = await this.neo4jService.read(
      `MATCH (n:Publisher {id: $id}) RETURN n`,
      {id},
    );
    if (result.records.length === 0) throw new Error('Not Found');
    return result.records[0].get(0).properties;
  }

  async findAll(): Promise<PublisherEntity[]> {
    return this.neo4jService
      .read(`MATCH (n:Publisher) RETURN n`)
      .then((res) => res.records.map((record) => record.get(0).properties));
  }

  async create(data: {name: string}): Promise<PublisherEntity> {
    const result = await this.neo4jService.write(
      `
      CREATE (n:Publisher {id: $id})
      SET n += $data
      RETURN n
      `,
      {
        id: this.idService.generate(),
        data,
      },
    );
    return result.records[0].get(0).properties;
  }

  async publishedBook({
    bookId,
    publisherId,
  }: {
    bookId: string;
    publisherId: string;
  }): Promise<PublicationEntity> {
    return this.neo4jService
      .write(
        `
        MATCH (p:Publisher {id: $publisherId})
        MATCH (b:Book {id: $bookId})
        MERGE (p)-[:PUBLISHED_BOOK]->(b)
        RETURN p,b
      `,
        {bookId, publisherId},
      )
      .then((result) =>
        result.records.map((record) => ({
          publisherId: record.get('p').properties.id,
          bookId: record.get('b').properties.id,
        })),
      )
      .then((entities) => entities[0]);
  }

  async getPublisherIdFromBook(bookId: string): Promise<string> {
    return this.neo4jService
      .read(
        `OPTIONAL MATCH (p:Publisher)-[r:PUBLISHED_BOOK]->(b:Book {id: $bookId}) RETURN p.id AS p`,
        {bookId},
      )
      .then((result) => result.records[0].get('p'));
  }

  async getPublicationsFromPublisher(
    publisherId: string,
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
    nodes: PublicationEntity[];
    count: number;
    hasPrevious: boolean;
    hasNext: boolean;
  }> {
    const publications = await this.neo4jService
      .read(
        `
        MATCH (p:Publisher {id: $publisherId})
        MATCH (p)-[r:PUBLISHED_BOOK]->(b)
        WHERE NOT b.id IN $except
        RETURN p,r,b
        ORDER BY b.title ${orderBy.title}
        SKIP $skip LIMIT $limit
    `,
        {
          publisherId,
          skip: int(skip),
          limit: int(limit),
          except,
        },
      )
      .then((result) =>
        result.records.map((record) => ({
          ...record.get('r').properties,
          publisherId: record.get('p').properties.id,
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
        MATCH (:Publisher {id: $publisherId})-[r:PUBLISHED_BOOK]->(:Book)
        WITH count(r) AS count
        RETURN count, 0 < count AND 0 < $skip AS previous, $skip + $limit < count AS next
        `,
        {
          publisherId,
          skip: int(skip),
          limit: int(limit),
        },
      )
      .then((result) => ({
        count: result.records[0].get('count').toNumber(),
        hasNext: result.records[0].get('next'),
        hasPrevious: result.records[0].get('previous'),
      }));
    return {nodes: publications, ...meta};
  }
}
