import {Injectable} from '@nestjs/common';
import {int, QueryResult} from 'neo4j-driver';
import {AuthorEntity} from '../authors/author.entity';
import {BookEntity} from '../books/book.entity';
import {Neo4jService} from '../neo4j/neo4j.service';
import {WritingEntity} from './writing.entity';

@Injectable()
export class WritingsService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async transferRecords(result: QueryResult): Promise<WritingEntity[]> {
    return result.records.map((record) => ({
      ...record.get('r').properties,
      author: record.get('a').properties,
      book: record.get('b').properties,
    }));
  }

  async getFromBook(
    book: BookEntity,
    {skip = 0, limit = 0}: {skip?: number; limit?: number},
  ): Promise<WritingEntity[]> {
    return this.neo4jService
      .read(
        `
      MATCH (b:Book {id: $book.id})
      MATCH (a)-[r:WRITES]->(b)
      RETURN a,r,b
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

  async getFromAuthor(
    author: AuthorEntity,
    {
      skip = 0,
      limit = 0,
      except = [],
    }: {skip?: number; limit?: number; except?: string[]},
  ): Promise<WritingEntity[]> {
    return this.neo4jService
      .read(
        `
      MATCH (a:Author {id: $author.id})
      MATCH (a)-[r:WRITES]->(b)
      WHERE NOT b.id IN $except
      RETURN a,r,b
      SKIP $skip LIMIT $limit
      `,
        {
          author,
          skip: int(skip),
          limit: int(limit),
          except,
        },
      )
      .then(this.transferRecords);
  }

  async connectBookToAuthor(
    {bookId, authorId}: {bookId: string; authorId: string},
    props: {roles?: string[]} = {},
  ): Promise<WritingEntity> {
    return this.neo4jService
      .write(
        `
        MATCH (a:Author {id: $authorId})
        MATCH (b:Book {id: $bookId})
        MERGE (a)-[r:WRITES]->(b)
        SET r = $props
        RETURN a,r,b
      `,
        {bookId, authorId, props},
      )
      .then((result) =>
        result.records.map((record) => ({
          ...record.get('r').properties,
          author: record.get('a').properties,
          book: record.get('b').properties,
        })),
      )
      .then((entities) => entities[0]);
  }
}
