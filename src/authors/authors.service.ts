import {Injectable} from '@nestjs/common';
import {Neo4jService} from '../neo4j/neo4j.service';
import {AuthorEntity} from './author.entity';

@Injectable()
export class AuthorsService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async findById(id: string): Promise<AuthorEntity> {
    return this.neo4jService
      .read(`MATCH (n:Author {id: $id}) RETURN n`, {id})
      .then((res) => res.records[0].get(0).properties);
  }
}
