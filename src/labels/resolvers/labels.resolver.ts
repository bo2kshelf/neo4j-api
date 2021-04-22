import {
  Args,
  Parent,
  Query,
  ResolveField,
  Resolver,
  ResolveReference,
} from '@nestjs/graphql';
import {LabelEntity} from '../entities/label.entity';
import {LabelsService} from '../services/labels.service';
import {GetLabelArgs} from './dto/get-label.dto';
import {
  ResolveLabelsBooksArgs,
  ResolveLabelsBooksReturnEntity,
} from './dto/resolve-label-books.dto';

@Resolver(() => LabelEntity)
export class LabelsResolver {
  constructor(private readonly labelsService: LabelsService) {}

  @ResolveReference()
  resolveReference(reference: {__typename: string; id: string}) {
    return this.labelsService.findById(reference.id);
  }

  @ResolveField(() => ResolveLabelsBooksReturnEntity)
  async books(
    @Parent() {id}: LabelEntity,
    @Args({type: () => ResolveLabelsBooksArgs})
    args: ResolveLabelsBooksArgs,
  ): Promise<ResolveLabelsBooksReturnEntity> {
    return this.labelsService.getLabeledBooks(id, args);
  }

  @Query(() => LabelEntity)
  async label(
    @Args({type: () => GetLabelArgs})
    {id}: GetLabelArgs,
  ): Promise<LabelEntity> {
    return this.labelsService.findById(id);
  }

  @Query(() => [LabelEntity])
  async allLabels(): Promise<LabelEntity[]> {
    return this.labelsService.findAll();
  }
}
