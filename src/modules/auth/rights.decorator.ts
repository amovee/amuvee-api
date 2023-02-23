
import { SetMetadata } from '@nestjs/common';
import { right } from 'src/types/rights';
export const RIGHT_KEY = 'Rights';
export const Right = (right: right) => SetMetadata(RIGHT_KEY, right);
