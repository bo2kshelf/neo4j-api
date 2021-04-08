import {Injectable} from '@nestjs/common';
import {int} from 'neo4j-driver';
import {OrderBy} from '../../common/order-by.enum';
import {Neo4jService} from '../../neo4j/neo4j.service';
import {PublisherLabelRelationEntity} from '../entities/publisher-label.entity';

@Injectable()
export class PublisherLabelRelationsService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async getLabelsFromPublisher(
    publisherId: string,
    {
      skip,
      limit,
      except,
      orderBy,
    }: {
      skip: number;
      limit: number;
      except: string[];
      orderBy: {name: OrderBy};
    },
  ): Promise<{
    nodes: PublisherLabelRelationEntity[];
    count: number;
    hasNext: boolean;
    hasPrevious: boolean;
  }> {
    const nodes: PublisherLabelRelationEntity[] = await this.neo4jService
      .read(
        `
      MATCH (p:Publisher {id: $publisherId})
      MATCH (p)-[:HAS_LABEL]->(l:Label)
      WHERE NOT l.id IN $except
      RETURN p,l
      ORDER BY l.name ${orderBy.name}
      SKIP $skip LIMIT $limit
      `,
        {publisherId, skip: int(skip), limit: int(limit), except},
      )
      .then((result) =>
        result.records.map((record) => ({
          publisherId: record.get('p').properties.id,
          labelId: record.get('l').properties.id,
        })),
      );
    const meta: {
      count: number;
      hasNext: boolean;
      hasPrevious: boolean;
    } = await this.neo4jService
      .read(
        `
        MATCH (p:Publisher {id: $publisherId})
        MATCH (p)-[r:HAS_LABEL]->(l:Label)
        WITH p,l
        WITH count(l) AS count
        RETURN count, 0 < count AND 0 < $skip AS previous, $skip + $limit < count AS next
      `,
        {publisherId, skip: int(skip), limit: int(limit)},
      )
      .then((result) => ({
        count: result.records[0].get('count').toNumber(),
        hasNext: result.records[0].get('next'),
        hasPrevious: result.records[0].get('previous'),
      }));
    return {nodes, ...meta};
  }

  async getPublisherFromLabel(
    labelId: string,
  ): Promise<PublisherLabelRelationEntity> {
    const result = await this.neo4jService.read(
      `
      MATCH (l:Label {id: $id})
      MATCH (p:Publisher)-[:HAS_LABEL]->(l)
      RETURN l.id AS l, p.id AS p`,
      {id: labelId},
    );
    if (result.records.length === 0) throw new Error('Not Found');
    return {
      publisherId: result.records[0].get('p'),
      labelId: result.records[0].get('l'),
    };
  }
}
