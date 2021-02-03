import {Injectable} from '@nestjs/common';
import {IDService} from '../id/id.service';
import {Neo4jService} from '../neo4j/neo4j.service';
import {BookEntity} from './book.entity';

@Injectable()
export class BooksService {
  constructor(
    private readonly neo4jService: Neo4jService,
    private readonly idService: IDService,
  ) {}

  async findBookById(id: string): Promise<BookEntity> {
    return this.neo4jService
      .read(`MATCH (n:Book {id: $id}) RETURN n`, {id})
      .then((res) => res.records[0].get(0).properties);
  }

  async findAllBooks(): Promise<BookEntity[]> {
    return this.neo4jService
      .read(`MATCH (n:Book) RETURN n`)
      .then((res) => res.records.map((record) => record.get(0).properties));
  }

  async createBook(data: {title: string; isbn?: string}): Promise<BookEntity> {
    const result = await this.neo4jService.write(
      `
      CREATE (n:Book {id: $id})
      SET n += $data
      RETURN n`,
      {
        id: this.idService.generate(),
        data,
      },
    );
    return result.records[0].get(0).properties;
  }
}
