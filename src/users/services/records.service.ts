import {Injectable} from '@nestjs/common';
import {Neo4jService} from '../../neo4j/neo4j.service';
import {ReadBookRecordEntity} from '../entities/read-book-record.entity';

@Injectable()
export class RecordsService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async findById(id: string): Promise<ReadBookRecordEntity> {
    const result = await this.neo4jService.read(
      `MATCH (n:Record {id: $id}) RETURN n`,
      {id},
    );
    if (result.records.length === 0) throw new Error('Not Found');
    return result.records[0].get(0).properties;
  }

  async getUserIdByRecord(recordId: string): Promise<string> {
    const result = await this.neo4jService.read(
      `MATCH (u:User)-[:RECORDED]->(:Record {id: $recordId}) RETURN u.id AS id`,
      {recordId},
    );
    if (result.records.length === 0) throw new Error('Not Found');
    return result.records[0].get('id');
  }

  async getBookIdByRecord(recordId: string): Promise<string> {
    const result = await this.neo4jService.read(
      `MATCH (:Record {id: $recordId})-[:RECORD_FOR]->(b:Book) RETURN b.id AS id`,
      {recordId},
    );
    if (result.records.length === 0) throw new Error('Not Found');
    return result.records[0].get('id');
  }
}
