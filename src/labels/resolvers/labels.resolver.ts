import {
  Args,
  Mutation,
  Query,
  Resolver,
  ResolveReference,
} from '@nestjs/graphql';
import {LabelEntity} from '../entities/label.entity';
import {LabelsService} from '../services/labels.service';
import {CreateLabelArgs} from './dto/create-label.dto';
import {GetLabelArgs} from './dto/get-label.dto';

@Resolver(() => LabelEntity)
export class LabelsResolver {
  constructor(private readonly labelsService: LabelsService) {}

  @ResolveReference()
  resolveReference(reference: {__typename: string; id: string}) {
    return this.labelsService.findById(reference.id);
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

  @Mutation(() => LabelEntity)
  async createLabel(
    @Args({type: () => CreateLabelArgs})
    args: CreateLabelArgs,
  ): Promise<LabelEntity> {
    return this.labelsService.create(args);
  }
}
