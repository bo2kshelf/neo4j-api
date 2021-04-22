import {Module} from '@nestjs/common';
import {BooksResolver} from './resolvers/books.resolver';
import {LabelsResolver} from './resolvers/labels.resolver';
import {LabelsService} from './services/labels.service';

@Module({
  providers: [LabelsService, LabelsResolver, BooksResolver],
  exports: [LabelsService],
})
export class LabelsModule {}
