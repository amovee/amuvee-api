import { Body,Req, Controller, Get, Post } from '@nestjs/common';
import { Meta } from 'src/shared/schemas/meta.schema';
import { JobSituationsService } from './job-situation.service';


@Controller('job-situations')
export class JobSituationsController {
  constructor(
    private readonly jobSituationsService: JobSituationsService,
  ) {}
  // No Auth but filtered
  @Get()
  async findAll(): Promise<Meta[]> {
    return (await this.jobSituationsService.findAll());
  }
}
