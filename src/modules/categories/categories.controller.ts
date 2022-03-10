import { Body, Controller, Get, Post } from '@nestjs/common';
import { Category } from 'src/shared/schemas/category.schema';
import { CategoriesService } from './categories.service';

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
  async add(@Body() dto: any): Promise<Category>  {
    console.log(dto);
    
    return this.categoriesService.create(dto);
  }
}
