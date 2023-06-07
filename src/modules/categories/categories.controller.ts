import { Controller, Get, Post, Query, } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { MinCategoryDTO } from 'src/shared/dtos/categories.dto';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService
  ) {}
  // No Auth
  @Post('migrate')
  async migrate(): Promise<void> {
    await this.categoriesService.migrate();
  }
  @Get('min') async getAll(@Query('language') language?: string): Promise<MinCategoryDTO[]> {
    return  await this.categoriesService.getCategories(language);
  }
}
