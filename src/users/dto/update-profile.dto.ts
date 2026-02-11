import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    nome?: string;

    @IsOptional()
    @IsString()
    tema_preferencia?: string;

    @IsOptional()
    @IsString()
    senha_atual?: string;

    @IsOptional()
    @IsString()
    @MinLength(6)
    nova_senha?: string;
}
