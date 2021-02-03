import {Module} from '@nestjs/common';
import {SeriesResolver} from './series.resolver';
import {SeriesService} from './series.service';

@Module({
  imports: [],
  providers: [SeriesService, SeriesResolver],
  exports: [SeriesService],
})
export class SeriesModule {}
