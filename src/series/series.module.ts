import {Module} from '@nestjs/common';
import {IDModule} from '../id/id.module';
import {SeriesResolver} from './resolvers/series.resolver';
import {SeriesService} from './services/series.service';

@Module({
  imports: [IDModule],
  providers: [SeriesService, SeriesResolver],
  exports: [SeriesService],
})
export class SeriesModule {}
