import {Injectable} from '@nestjs/common';
import {int} from 'neo4j-driver';
import {BookEntity} from '../books/entities/book.entity';
import {IDService} from '../id/id.service';
import {Neo4jService} from '../neo4j/neo4j.service';
import {PublicationEntity, PublisherEntity} from './publisher.entity';

@Injectable()
export class PublishersService {
  constructor(
    private readonly neo4jService: Neo4jService,
    private readonly idService: IDService,
  ) {}

  async getPublisherById(id: string): Promise<PublisherEntity> {
    return this.neo4jService
      .read(`MATCH (n:Publisher {id: $id}) RETURN n`, {id})
      .then((res) => res.records[0].get(0).properties);
  }

  async getAllPublishers(): Promise<PublisherEntity[]> {
    return this.neo4jService
      .read(`MATCH (n:Publisher) RETURN n`)
      .then((res) => res.records.map((record) => record.get(0).properties));
  }

  async createPublisher(data: {name: string}): Promise<PublisherEntity> {
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

  async getPublicationsFromBook(
    book: BookEntity,
    {skip = 0, limit = 0}: {skip?: number; limit?: number},
  ): Promise<PublicationEntity[]> {
    return this.neo4jService
      .read(
        `
    MATCH (b:Book {id: $book.id})
    MATCH (p)-[r:PUBLISHES]->(b)
    RETURN p,r,b
    SKIP $skip LIMIT $limit
    `,
        {
          book,
          skip: int(skip),
          limit: int(limit),
        },
      )
      .then((result) =>
        result.records.map((record) => ({
          ...record.get('r').properties,
          publisher: record.get('p').properties,
          book: record.get('b').properties,
        })),
      );
  }

  async getPublicationsFromPublisher(
    publisher: PublisherEntity,
    {
      skip = 0,
      limit = 0,
      except = [],
    }: {skip?: number; limit?: number; except?: string[]},
  ): Promise<PublicationEntity[]> {
    return this.neo4jService
      .read(
        `
    MATCH (p:Publisher {id: $publisher.id})
    MATCH (p)-[r:PUBLISHES]->(b)
    WHERE NOT b.id IN $except
    RETURN p,r,b
    SKIP $skip LIMIT $limit
    `,
        {
          publisher,
          skip: int(skip),
          limit: int(limit),
          except,
        },
      )
      .then((result) =>
        result.records.map((record) => ({
          ...record.get('r').properties,
          publisher: record.get('p').properties,
          book: record.get('b').properties,
        })),
      );
  }

  async connectBookToPublisher({
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
        MERGE (p)-[:PUBLISHES]->(b)
        RETURN p,b
      `,
        {bookId, publisherId},
      )
      .then((result) =>
        result.records.map((record) => ({
          publisher: record.get('p').properties,
          book: record.get('b').properties,
        })),
      )
      .then((entities) => entities[0]);
  }
}
