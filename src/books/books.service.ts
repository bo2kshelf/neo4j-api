import {Injectable} from '@nestjs/common';
import {Neo4jService} from '../neo4j/neo4j.service';
import {BookEntity} from './book.entity';

@Injectable()
export class BooksService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async findById(id: string): Promise<BookEntity> {
    return this.neo4jService
      .read(`MATCH (n:Book {id: $id}) RETURN n`, {id})
      .then((res) => res.records[0].get(0).properties);
  }

  async createBook(data: {title: string}) {
    const result = await this.neo4jService.write(
      `CREATE (n:Book {id: apoc.create.uuid(), title: $data.title}) RETURN n`,
      {data},
    );
    return result.records[0].get(0).properties;
  }
}
