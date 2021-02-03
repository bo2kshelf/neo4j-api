import {Injectable} from '@nestjs/common';
import {Neo4jService} from '../neo4j/neo4j.service';
import {SeriesEntity} from './series.entity';

@Injectable()
export class SeriesService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async findById(id: string): Promise<SeriesEntity> {
    return this.neo4jService
      .read(`MATCH (n:Series {id: $id}) RETURN n`, {id})
      .then((res) => res.records[0].get(0).properties);
  }

  async createSeries(data: {title: string}) {
    const result = await this.neo4jService.write(
      `CREATE (n:Series {id: apoc.create.uuid(), title: $data.title}) RETURN n`,
      {
        data: {
          title: data.title,
        },
      },
    );
    return result.records[0].get(0).properties;
  }
}
