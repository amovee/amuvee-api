import { Controller, Get } from '@nestjs/common';
import { Meta } from 'src/shared/schemas/meta.schema';
import { RelationshipTypesService } from './relationship-types.service';

@Controller('relationship-types')
export class RelationshipTypesController {
    constructor(
      private readonly relationshipTypesService: RelationshipTypesService,
    ) {}
    // No Auth but filtered
    @Get()
    async findAll(): Promise<Meta[]> {
      return (await this.relationshipTypesService.findAll());
    }}
