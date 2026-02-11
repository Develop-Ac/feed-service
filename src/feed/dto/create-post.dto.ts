import { IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
    @IsOptional()
    @IsString()
    conteudo?: string;

    @IsString()
    @IsOptional()
    tipo?: string;
}
