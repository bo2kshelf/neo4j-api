import {Injectable} from '@nestjs/common';
import {int} from 'neo4j-driver';
import {IDService} from '../../id/id.service';
import {Neo4jService} from '../../neo4j/neo4j.service';
import {AuthorEntity} from '../entities/author.entity';
import {WritingEntity} from '../entities/writing.entity';

@Injectable()
export class AuthorsService {
  constructor(
    private readonly neo4jService: Neo4jService,
    private readonly idService: IDService,
  ) {}

  async findById(id: string): Promise<AuthorEntity> {
    return this.neo4jService
      .read(`MATCH (n:Author {id: $id}) RETURN n`, {id})
      .then((res) => res.records[0].get(0).properties);
  }

  async findAll(): Promise<AuthorEntity[]> {
    return this.neo4jService
      .read(`MATCH (n:Author) RETURN n`)
      .then((res) => res.records.map((record) => record.get(0).properties));
  }

  async create(data: {name: string}): Promise<AuthorEntity> {
    const result = await this.neo4jService.write(
      `
      CREATE (n:Author {id: $id})
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

  async writedBook({
    authorId,
    bookId,
    ...props
  }: {
    authorId: string;
    bookId: string;
    roles?: string[];
  }): Promise<WritingEntity> {
    const result = await this.neo4jService.write(
      `
        MATCH (a:Author {id: $authorId})
        MATCH (b:Book {id: $bookId})
        MERGE (a)-[r:WRITES]->(b)
        SET r = $props
        RETURN a,r,b
      `,
      {bookId, authorId, props},
    );
    return result.records.map((record) => ({
      ...record.get('r').properties,
      author: record.get('a').properties,
      book: record.get('b').properties,
    }))[0];
  }

  async getWritingFromAuthor(
    authorId: string,
    {skip, limit, except}: {skip: number; limit: number; except: string[]},
  ): Promise<WritingEntity[]> {
    const result = await this.neo4jService.read(
      `
    MATCH (a:Author {id: $authorId})
    MATCH (a)-[r:WRITES]->(b)
    WHERE NOT b.id IN $except
    RETURN a,r,b
    SKIP $skip LIMIT $limit
    `,
      {
        authorId,
        skip: int(skip),
        limit: int(limit),
        except,
      },
    );
    return result.records.map((record) => ({
      ...record.get('r').properties,
      author: record.get('a').properties,
      book: record.get('b').properties,
    }));
  }

  async getWritingFromBook(
    authorId: string,
    {skip, limit}: {skip: number; limit: number},
  ): Promise<WritingEntity[]> {
    const result = await this.neo4jService.read(
      `
      MATCH (b:Book {id: $book.id})
      MATCH (a)-[r:WRITES]->(b)
      RETURN a,r,b
      SKIP $skip LIMIT $limit
    `,
      {
        authorId,
        skip: int(skip),
        limit: int(limit),
      },
    );
    return result.records.map((record) => ({
      ...record.get('r').properties,
      author: record.get('a').properties,
      book: record.get('b').properties,
    }));
  }
}
