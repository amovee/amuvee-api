import { Body,Req, Controller, Get, Post } from '@nestjs/common';
import { Category } from 'src/shared/schemas/category.schema';
import { CategoriesService } from './categories.service';
import { Request } from 'express';


@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
  ) {}
  @Get()
  async getHello(): Promise<Category[]> {
    return this.categoriesService.findAll();
  }
  @Post()
  async createEmpty(@Body("name") name: any): Promise<Category>  {
    return this.categoriesService.createEmpty(name);
  }
}
