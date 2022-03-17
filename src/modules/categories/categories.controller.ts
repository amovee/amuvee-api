import { Body,Req, Controller, Get, Post } from '@nestjs/common';
import { Category } from 'src/shared/schemas/category.schema';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
  ) {}
  // No Auth
  @Get()
  async findAll(): Promise<Category[]> {
    return this.categoriesService.findAll();
  }
  @Post()
  async createEmpty(@Body("name") name: any): Promise<Category>  {
    return this.categoriesService.createEmpty(name);
  }
}
