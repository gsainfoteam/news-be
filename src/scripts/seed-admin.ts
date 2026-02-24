import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

dotenv.config();

const BCRYPT_ROUNDS = 12;

async function main() {
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;

    if (!username || !password) {
        console.error('❌ ADMIN_USERNAME과 ADMIN_PASSWORD를 .env에 설정해주세요.');
        process.exit(1);
    }

    if (password.length < 8) {
        console.error('❌ ADMIN_PASSWORD는 최소 8자 이상이어야 합니다.');
        process.exit(1);
    }

    const prisma = new PrismaClient();

    try {
        const existing = await prisma.admin.findUnique({ where: { username } });
        if (existing) {
            console.log(`⚠️  이미 존재하는 계정입니다: ${username}`);
            return;
        }

        const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
        await prisma.admin.create({ data: { username, hashedPassword } });
        console.log(`✅ 관리자 계정 생성 완료: ${username}`);
    } finally {
        await prisma.$disconnect();
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
