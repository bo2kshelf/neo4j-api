import {Injectable} from '@nestjs/common';
import {Neo4jService} from '../../neo4j/neo4j.service';
import {UserEntity} from '../entities/users.entity';

@Injectable()
export class UsersService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async findUserById(id: string): Promise<UserEntity> {
    return this.neo4jService
      .read(`MATCH (n:User {id: $id}) RETURN n`, {id})
      .then((res) => res.records[0].get(0).properties);
  }
}
