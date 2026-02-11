import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking for users...');
    const user = await prisma.sis_usuarios.findFirst();
    if (user) {
        console.log(`FOUND_USER_ID: ${user.id}`);
    } else {
        console.log('No users found. Creating Dev User...');
        const devId = 'cm6fb5q7e0000v9037v6q4j1b';
        try {
            await prisma.sis_usuarios.create({
                data: {
                    id: devId,
                    nome: 'Dev User',
                    codigo: 'DEV001',
                    setor: 'TI',
                    senha: 'admin'
                }
            });
            console.log(`CREATED_USER_ID: ${devId}`);
        } catch (e) {
            console.error('Error creating user:', e);
        }
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
