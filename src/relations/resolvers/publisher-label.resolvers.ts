import {Args, Parent, ResolveField, Resolver} from '@nestjs/graphql';
import {LabelEntity} from '../../labels/entities/label.entity';
import {LabelsService} from '../../labels/services/labels.service';
import {PublisherEntity} from '../../publishers/entities/publisher.entity';
import {PublishersService} from '../../publishers/services/publishers.service';
import {PublisherLabelRelationEntity} from '../entities/publisher-label.entity';
import {PublisherLabelRelationsService} from '../services/publisher-label.service';
import {
  ResolvePublishersLabelsArgs,
  ResolvePublishersLabelsReturn,
} from './dto/publisher-label.dtos';

@Resolver(() => PublisherLabelRelationEntity)
export class RelationResolver {
  constructor(
    private readonly publishersService: PublishersService,
    private readonly labelsService: LabelsService,
  ) {}

  @ResolveField(() => PublisherEntity)
  async publisher(
    @Parent() {publisherId}: PublisherLabelRelationEntity,
  ): Promise<PublisherEntity> {
    return this.publishersService.findById(publisherId);
  }

  @ResolveField(() => LabelEntity)
  async label(
    @Parent() {labelId}: PublisherLabelRelationEntity,
  ): Promise<LabelEntity> {
    return this.labelsService.findById(labelId);
  }
}

@Resolver(() => PublisherEntity)
export class PublishersResolver {
  constructor(
    private readonly relationService: PublisherLabelRelationsService,
  ) {}

  @ResolveField(() => ResolvePublishersLabelsReturn)
  async labels(
    @Parent() {id: authorId}: PublisherEntity,
    @Args({type: () => ResolvePublishersLabelsArgs})
    args: ResolvePublishersLabelsArgs,
  ): Promise<ResolvePublishersLabelsReturn> {
    return this.relationService.getLabelsFromPublisher(authorId, args);
  }
}

@Resolver(() => LabelEntity)
export class LabelsResolver {
  constructor(
    private readonly relationService: PublisherLabelRelationsService,
  ) {}

  @ResolveField(() => PublisherLabelRelationEntity)
  async belongsTo(
    @Parent() {id: seriesId}: LabelEntity,
  ): Promise<PublisherLabelRelationEntity> {
    return this.relationService.getPublisherFromLabel(seriesId);
  }
}
