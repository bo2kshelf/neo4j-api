import {Injectable} from '@nestjs/common';
import {IDService} from '../../id/id.service';
import {Neo4jService} from '../../neo4j/neo4j.service';
import {SeriesEntity} from '../entities/series.entity';

@Injectable()
export class SeriesService {
  constructor(
    private readonly neo4jService: Neo4jService,
    private readonly idService: IDService,
  ) {}

  async findById(id: string): Promise<SeriesEntity> {
    return this.neo4jService
      .read(`MATCH (n:Series {id: $id}) RETURN n`, {id})
      .then((res) => res.records[0].get(0).properties);
  }

  async findAllSeries(): Promise<SeriesEntity[]> {
    return this.neo4jService
      .read(`MATCH (n:Series) RETURN n`)
      .then((res) => res.records.map((record) => record.get(0).properties));
  }

  async createSeries(data: {title: string}): Promise<SeriesEntity> {
    const result = await this.neo4jService.write(
      `
      CREATE (n:Series {id: $id})
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
