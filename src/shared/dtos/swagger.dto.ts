import { ApiProperty } from '@nestjs/swagger';

export class CreateSwaggerDto {
  @ApiProperty({ example: 'Item Name', description: 'The name of the item' })
  name: string;

  @ApiProperty({ example: 10, description: 'The quantity of the item' })
  quantity: number;

  @ApiProperty({ example: 'Description of the item', description: 'The item description' })
  description: string;
}

export class swaggerItemDTO {
  @ApiProperty({ example: 'Item Name', description: 'The name of the item' })
  name: string;

  @ApiProperty({ example: 10, description: 'The quantity of the item' })
  quantity: number;

  @ApiProperty({ example: 'Description of the item', description: 'The item description' })
  description: string;
}