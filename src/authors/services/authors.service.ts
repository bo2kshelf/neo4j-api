import {Injectable} from '@nestjs/common';
import {IDService} from '../../id/id.service';
import {Neo4jService} from '../../neo4j/neo4j.service';
import {AuthorEntity} from '../entities/author.entity';

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

  async findAllAuthors(): Promise<AuthorEntity[]> {
    return this.neo4jService
      .read(`MATCH (n:Author) RETURN n`)
      .then((res) => res.records.map((record) => record.get(0).properties));
  }

  async createAuthor(data: {name: string}): Promise<AuthorEntity> {
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
}
