import {Injectable} from '@nestjs/common';
import {int} from 'neo4j-driver';
import {IDService} from '../../common/id/id.service';
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
    const result = await this.neo4jService.read(
      `MATCH (n:Author {id: $id}) RETURN n`,
      {id},
    );
    if (result.records.length === 0) throw new Error('Not Found');
    return result.records[0].get(0).properties;
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

  async writedBook(
    {authorId, bookId}: {authorId: string; bookId: string},
    {roles = []}: {roles?: string[]},
  ): Promise<WritingEntity> {
    const result = await this.neo4jService.write(
      `
        MATCH (a:Author {id: $authorId})
        MATCH (b:Book {id: $bookId})
        MERGE (a)-[r:WRITED_BOOK]->(b)
        SET r = $props
        RETURN a,r,b
      `,
      {bookId, authorId, props: {roles}},
    );
    return result.records.map((record) => ({
      ...record.get('r').properties,
      authorId: record.get('a').properties.id,
      bookId: record.get('b').properties.id,
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
      authorId: record.get('a').properties.id,
      bookId: record.get('b').properties.id,
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
      authorId: record.get('a').properties.id,
      bookId: record.get('b').properties.id,
    }));
  }
}
