import {Injectable} from '@nestjs/common';
import {Neo4jService} from '../neo4j/neo4j.service';
import {AccountEntity} from './account.entity';

@Injectable()
export class AccountsService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async findAccountById(id: string): Promise<AccountEntity> {
    return this.neo4jService
      .read(`MATCH (n:Account {id: $id}) RETURN n`, {id})
      .then((res) => res.records[0].get(0).properties);
  }
}
