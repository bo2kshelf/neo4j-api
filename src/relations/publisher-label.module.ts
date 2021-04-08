import {Module} from '@nestjs/common';
import {LabelsModule} from '../labels/labels.module';
import {PublishersModule} from '../publishers/publishers.module';
import {
  LabelsResolver,
  PublishersResolver,
  RelationResolver,
} from './resolvers/publisher-label.resolvers';
import {PublisherLabelRelationsService} from './services/publisher-label.service';

@Module({
  imports: [PublishersModule, LabelsModule],
  providers: [
    PublisherLabelRelationsService,
    RelationResolver,
    PublishersResolver,
    LabelsResolver,
  ],
  exports: [PublisherLabelRelationsService],
})
export class PublisherLabelRelationsModule {}
